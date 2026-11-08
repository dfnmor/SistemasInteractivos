import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PerfilNino, Cuento, VistaActiva } from '../types/meexuu';

/* =============================================================================
 * MÓDULO 2 — SESIÓN DE HABLA (/articulacion)
 * Sigue estrictamente el Wireframe 4 (Fase 2, Act. 6, p. 9):
 *   1. Encabezado: "← Sesión de habla"
 *   2. Tarjeta del fonema:
 *      - "FONEMA BILABIAL"
 *      - "🔊 /m/ - /a/ • MA - MÁ" | "★★☆"
 *      - "💡 Paso 1: Presiona los labios con suavidad" | "〰 Vibración Nasal"
 *   3. Tarjeta "👤 Modelo Guía: Terapeuta" con botón circular "▶", boca animada,
 *      onda azul y etiqueta "Vibración Fonética Continua"
 *   4. Tarjeta Espejo AR con cámara ("✓ Alineado"), guía labial punteada y
 *      barras "👄 Cierre y Simetría Labial" | "¡Abre juntos! Correcto"
 *   5. Fila de botones: "↻ Repetir (Ver fonema lento)" y "✓ ¡Listo! Comprobar"
 *   6. Tarjeta inferior verde menta: "😊 ¡Excelente sellado labial! Tus labios
 *      hicieron el contacto perfecto para 'MA'."
 * ============================================================================= */

interface ModuloArticulacionViewProps {
  perfilActivo: PerfilNino;
  cuentos: Cuento[];
  palabraInicial?: { palabra: string; idEjercicio: number };
  modoDemo?: boolean;
  onRegistrarIntento: (
    idEjercicio: number,
    precision: number
  ) => Promise<{
    titulo: string;
    mensaje: string;
    icono: string;
  }>;
  onNavigate: (vista: VistaActiva, path?: string) => void;
}

interface InfoFonema {
  categoria: string;
  fonema: string;
  paso: string;
  indicador: string;
  exitoTitulo: string;
  exitoTexto: string;
}

const INFO_FONEMAS: Record<string, InfoFonema> = {
  'MA-MÁ': {
    categoria: 'FONEMA BILABIAL',
    fonema: '/m/ - /a/ • MA - MÁ',
    paso: 'Paso 1: Presiona los labios con suavidad',
    indicador: 'Vibración Nasal',
    exitoTitulo: '¡Excelente sellado labial!',
    exitoTexto: "Tus labios hicieron el contacto perfecto para 'MA'.",
  },
  'PA-PÁ': {
    categoria: 'FONEMA BILABIAL',
    fonema: '/p/ - /a/ • PA - PÁ',
    paso: 'Paso 1: Junta los labios y suelta el aire',
    indicador: 'Pulso de Aire',
    exitoTitulo: '¡Excelente sellado labial!',
    exitoTexto: "Tus labios hicieron el contacto perfecto para 'PA'.",
  },
  'CA-SA': {
    categoria: 'APERTURA VOCÁLICA',
    fonema: '/k/ - /a/ • CA - SA',
    paso: 'Paso 1: Abre la boca en "CA" y sonríe en "SA"',
    indicador: 'Soplo Suave',
    exitoTitulo: '¡Excelente apertura labial!',
    exitoTexto: "Tus labios hicieron la apertura perfecta para 'CA'.",
  },
  'SO-PA': {
    categoria: 'REDONDEO LABIAL',
    fonema: '/s/ - /o/ • SO - PA',
    paso: 'Paso 1: Redondea tus labios para la "O"',
    indicador: 'Círculo Labial',
    exitoTitulo: '¡Excelente redondeo labial!',
    exitoTexto: "Tus labios formaron el círculo perfecto para 'SO'.",
  },
};

const infoDe = (palabra: string): InfoFonema =>
  INFO_FONEMAS[palabra.toUpperCase()] || INFO_FONEMAS['MA-MÁ'];

export const ModuloArticulacionView: React.FC<ModuloArticulacionViewProps> = ({
  perfilActivo,
  cuentos,
  palabraInicial,
  modoDemo = false,
  onRegistrarIntento,
  onNavigate,
}) => {
  const esNoLector = perfilActivo.nivel_lectura === 'NO_LECTOR';

  const palabras = useMemo(
    () =>
      cuentos
        .filter((c) => c.tipo === 'ARTICULACION')
        .sort(
          (a, b) =>
            a.orden_dificultad - b.orden_dificultad || a.id_cuento - b.id_cuento
        )
        .flatMap((c) =>
          (c.ejercicios || [])
            .slice()
            .sort((a, b) => a.orden_en_cuento - b.orden_en_cuento)
            .map((e) => ({
              id_ejercicio: e.id_ejercicio,
              palabra: e.palabra_o_sena,
            }))
        ),
    [cuentos]
  );

  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const i = palabras.findIndex(
      (p) => p.id_ejercicio === palabraInicial?.idEjercicio
    );
    setIndice(i >= 0 ? i : 0);
  }, [palabras, palabraInicial]);

  const actual = palabras[indice] || { id_ejercicio: 7, palabra: 'MA-MÁ' };
  const info = infoDe(actual.palabra);

  const [lento, setLento] = useState(false);
  const [bocaAbierta, setBocaAbierta] = useState(false);
  const [modeloReproduciendo, setModeloReproduciendo] = useState(true);
  const [camaraOk, setCamaraOk] = useState(false);
  const [comprobando, setComprobando] = useState(false);
  const [precision, setPrecision] = useState<number>(92);
  const [resultado, setResultado] = useState<'EXITO' | 'CASI'>('EXITO');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!modeloReproduciendo) return;
    const t = setInterval(() => setBocaAbierta((b) => !b), lento ? 1500 : 800);
    return () => clearInterval(t);
  }, [lento, modeloReproduciendo]);

  useEffect(() => {
    let cancelado = false;
    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      })
      .then((stream) => {
        if (cancelado) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setCamaraOk(true);
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCamaraOk(false));
    return () => {
      cancelado = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const comprobar = async (valor: number) => {
    setComprobando(true);
    try {
      await onRegistrarIntento(actual.id_ejercicio, valor);
      setPrecision(valor);
      if (valor >= 75) {
        setResultado('EXITO');
        setLento(false);
      } else {
        setResultado('CASI');
        setLento(true);
      }
    } finally {
      setComprobando(false);
    }
  };

  const handleListo = () => {
    const acierto = Math.random() >= 0.35;
    comprobar(
      acierto
        ? Math.floor(84 + Math.random() * 14)
        : Math.floor(54 + Math.random() * 18)
    );
  };

  return (
    <section
      aria-labelledby="titulo-sesion-habla"
      style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
    >
      {/* 1. Encabezado idéntico al Wireframe 4: "← Sesión de habla" */}
      <div className="screen-back-header">
        <button
          type="button"
          className="btn-back-circle"
          onClick={() => onNavigate('MENU_PRINCIPAL', '/menu')}
          aria-label="Volver al menú de inicio"
        >
          ←
        </button>
        <h1
          id="titulo-sesion-habla"
          className="section-title"
          style={{ fontSize: '1.25rem' }}
        >
          Sesión de habla
        </h1>
      </div>

      {/* 2. Tarjeta del fonema (Wireframe 4):
             - "FONEMA BILABIAL"
             - "🔊 /m/ - /a/ • MA - MÁ" | "★★☆"
             - "💡 Paso 1: Presiona los labios con suavidad" | "〰 Vibración Nasal" */}
      <div className="card-aaa">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <div>
            {!esNoLector && (
              <p
                className="text-support"
                style={{
                  fontWeight: 700,
                  color: '#0052A3',
                  fontSize: '0.78rem',
                  letterSpacing: '0.04em',
                }}
              >
                {info.categoria}
              </p>
            )}
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '1.35rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#DBEAFE',
                  color: '#0052A3',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.05rem',
                }}
              >
                🔊
              </span>
              <span>
                {esNoLector
                  ? actual.palabra.replace(/-/g, ' - ')
                  : info.fonema}
              </span>
            </p>
          </div>
          <span
            style={{
              fontSize: '1.25rem',
              color: '#0052A3',
              whiteSpace: 'nowrap',
            }}
            aria-label="2 de 3 estrellas"
          >
            ★★☆
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: '2px solid var(--border-subtle)',
          }}
        >
          <span
            className="text-support"
            style={{ fontWeight: 700, fontSize: '0.85rem' }}
          >
            <span aria-hidden="true">💡 </span>
            {esNoLector ? '👄 ➡️ 😊' : info.paso}
          </span>
          <span
            className="pill-label"
            style={{ backgroundColor: '#DCFCE7', color: '#065F46' }}
          >
            〰 {info.indicador}
          </span>
        </div>
      </div>

      {/* 3. Tarjeta "Modelo Guía: Terapeuta" (Pila vertical, Wireframe 4) */}
      <div
        className="card-aaa"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          backgroundColor: 'var(--bg-surface-soft)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
            <span aria-hidden="true">👤 </span>
            {esNoLector ? 'Guía' : 'Modelo Guía: Terapeuta'}
          </span>
          <button
            type="button"
            onClick={() => setModeloReproduciendo((r) => !r)}
            aria-label={
              modeloReproduciendo
                ? 'Pausar modelo guía'
                : 'Reproducir modelo guía'
            }
            style={{
              width: '48px',
              height: '48px',
              padding: 0,
              borderRadius: '50%',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontSize: '1.05rem',
            }}
          >
            ▶
          </button>
        </div>

        <div style={{ textAlign: 'center', padding: '4px 0' }}>
          <div style={{ fontSize: '2.8rem', lineHeight: 1 }} aria-hidden="true">
            {bocaAbierta ? '👄' : '🗣️'}
          </div>
          <svg
            width="100%"
            height="44"
            viewBox="0 0 320 44"
            aria-hidden="true"
          >
            <path
              d="M 10 22 Q 35 4, 60 22 T 110 22 T 160 22 T 210 22 T 260 22 T 310 22"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          {!esNoLector && (
            <p
              className="text-support"
              style={{
                fontWeight: 700,
                color: '#0052A3',
                fontSize: '0.8rem',
              }}
            >
              ↑ Vibración Fonética Continua{lento ? ' · lento' : ''}
            </p>
          )}
        </div>
      </div>

      {/* 4. Tarjeta Espejo AR con cámara (Pila vertical, Wireframe 4) */}
      <div
        className="card-aaa"
        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        <div
          className="ar-camera-stage camara-lsm-stage"
          style={{ minHeight: '220px' }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="ar-video-element"
            style={{ display: camaraOk ? 'block' : 'none' }}
            aria-label="Espejo de cámara para articulación oral"
          />
          <span
            className="pill-label"
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              zIndex: 6,
              backgroundColor: '#10B981',
              color: '#FFFFFF',
            }}
          >
            ✓ Alineado
          </span>

          {/* Guía labial punteada en el centro del espejo AR */}
          <div
            aria-hidden="true"
            style={{
              position: 'relative',
              zIndex: 4,
              width: '165px',
              height: '96px',
              borderRadius: '48px',
              border: '3px dashed #34D399',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
            }}
          >
            👄
          </div>
        </div>

        {/* Dos barras inferiores lado a lado: "👄 Cierre y Simetría Labial" y "¡Abre juntos! Correcto" */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            alignItems: 'end',
          }}
        >
          <div>
            <p
              className="text-support"
              style={{
                fontWeight: 700,
                fontSize: '0.8rem',
                marginBottom: '4px',
              }}
            >
              👄 {esNoLector ? 'Labios' : 'Cierre y Simetría Labial'}
            </p>
            <div className="progress-track-aaa" style={{ height: '10px' }}>
              <div
                className="progress-fill-aaa"
                style={{ width: `${precision}%` }}
              />
            </div>
          </div>

          <div>
            <p
              className="text-support"
              style={{
                fontWeight: 700,
                fontSize: '0.8rem',
                marginBottom: '4px',
                color:
                  resultado === 'CASI' ? 'var(--warn-text)' : '#047857',
                textAlign: 'right',
              }}
            >
              {esNoLector
                ? '✓ OK'
                : resultado === 'CASI'
                ? '¡Intenta otra vez!'
                : '¡Abre juntos! Correcto'}
            </p>
            <div className="progress-track-aaa" style={{ height: '10px' }}>
              <div
                className={
                  resultado === 'CASI'
                    ? 'progress-fill-aaa'
                    : 'progress-fill-success'
                }
                style={{ width: `${precision}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Fila de botones idéntica al Wireframe 4:
             "↻ Repetir / Ver fonema lento" | "✓ ¡Listo! Comprobar" */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.35fr',
          gap: '10px',
        }}
      >
        <button
          type="button"
          className="btn-secondary-aaa"
          style={{
            flexDirection: 'column',
            gap: '2px',
            minHeight: '60px',
            borderRadius: '16px',
          }}
          onClick={() => {
            setLento((l) => !l);
            setModeloReproduciendo(true);
          }}
          aria-pressed={lento}
        >
          <span>↻ Repetir</span>
          {!esNoLector && (
            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
              {lento ? 'Velocidad normal' : 'Ver fonema lento'}
            </span>
          )}
        </button>

        <button
          type="button"
          className="btn-primary-aaa"
          style={{ minHeight: '60px', borderRadius: '16px' }}
          onClick={handleListo}
          disabled={comprobando}
        >
          <span aria-hidden="true">✓</span>
          <span>{comprobando ? 'Comprobando…' : '¡Listo! Comprobar'}</span>
        </button>
      </div>

      {/* 6. Tarjeta verde menta inferior idéntica al Wireframe 4:
             "😊 ¡Excelente sellado labial! Tus labios hicieron el contacto perfecto para 'MA'." */}
      <div
        className="card-aaa"
        role="status"
        aria-live="polite"
        style={{
          backgroundColor:
            resultado === 'CASI' ? 'var(--warn-bg)' : '#DCFCE7',
          borderColor:
            resultado === 'CASI' ? 'var(--warn-border)' : '#10B981',
          color: resultado === 'CASI' ? 'var(--warn-text)' : '#064E3B',
          borderWidth: '2px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.9rem' }} aria-hidden="true">
            {resultado === 'CASI' ? '💪' : '😊'}
          </span>
          <div style={{ flex: 1 }}>
            <h2 className="section-title" style={{ color: 'inherit' }}>
              {resultado === 'CASI'
                ? '¡Casi! Intenta otra vez'
                : info.exitoTitulo}
            </h2>
            {!esNoLector && (
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                }}
              >
                {resultado === 'CASI'
                  ? 'Observa el fonema lento y vuelve a intentarlo.'
                  : info.exitoTexto}
              </p>
            )}
          </div>
        </div>
      </div>

      {modoDemo && (
        <div className="demo-panel">
          <strong>🧪 Modo demostración (?demo=1) · Módulo 2</strong>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-success-aaa"
              style={{ flex: 1 }}
              disabled={comprobando}
              onClick={() => comprobar(94)}
            >
              ✓ Simular acierto
            </button>
            <button
              type="button"
              className="btn-secondary-aaa"
              style={{ flex: 1 }}
              disabled={comprobando}
              onClick={() => comprobar(60)}
            >
              ✗ Simular fallo
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
