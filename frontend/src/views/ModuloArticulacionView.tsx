import React, { useState, useRef, useEffect } from 'react';
import { PerfilNino, VistaActiva } from '../types/meexuu';

interface ModuloArticulacionViewProps {
  perfilActivo: PerfilNino;
  palabraInicial?: { palabra: string; idEjercicio: number };
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

interface FonemaArticulacionItem {
  idEjercicio: number;
  categoria: string;
  fonema: string;
  palabraMostrar: string;
  paso1: string;
  indicadorTactil: string;
  aperturaBucal: 'CERRADO_SUAVE' | 'ABIERTO_VOCAL' | 'REDONDEADO';
  retroalimentacionExito: string;
}

const FONEMAS_DISPONIBLES: FonemaArticulacionItem[] = [
  {
    idEjercicio: 10,
    categoria: 'FONEMA BILABIAL',
    fonema: '/m/ - /a/ • MA - MÁ',
    palabraMostrar: 'MA - MÁ',
    paso1: 'Paso 1: Presiona los labios con suavidad y luego ábrelos ampliamente para la "A".',
    indicadorTactil: 'Vibración Nasal Suave',
    aperturaBucal: 'CERRADO_SUAVE',
    retroalimentacionExito:
      "¡Excelente sellado labial! Tus labios hicieron el contacto perfecto para 'MA'.",
  },
  {
    idEjercicio: 12,
    categoria: 'APERTURA VOCÁLICA (BOSQUEJO FASE 1)',
    fonema: '/k/ - /a/ - /s/ - /a/ • CA - SA',
    palabraMostrar: 'CA - SA',
    paso1: 'Paso 1: Abre la boca grande en "CA" y sonríe suavemente dejando salir el aire en "SA".',
    indicadorTactil: 'Soplo Frontal Suave',
    aperturaBucal: 'ABIERTO_VOCAL',
    retroalimentacionExito:
      "¡Gran apertura bucal! Pronunciaste las dos sílabas de 'CA-SA' con claridad.",
  },
  {
    idEjercicio: 11,
    categoria: 'FONEMA BILABIAL EXPLOSIVO',
    fonema: '/p/ - /a/ • PA - PÁ',
    palabraMostrar: 'PA - PÁ',
    paso1: 'Paso 1: Junta los labios y suelta una pequeña burbuja de aire al abrir la boca.',
    indicadorTactil: 'Pulso de Aire Labial',
    aperturaBucal: 'CERRADO_SUAVE',
    retroalimentacionExito:
      "¡Muy bien! El impulso labial para 'PA-PÁ' fue simétrico y claro.",
  },
  {
    idEjercicio: 13,
    categoria: 'REDONDEO LABIAL',
    fonema: '/s/ - /o/ - /p/ - /a/ • SO - PA',
    palabraMostrar: 'SO - PA',
    paso1: 'Paso 1: Redondea tus labios como un círculo para la "O" y ciérralos en "PA".',
    indicadorTactil: 'Círculo Labial Simétrico',
    aperturaBucal: 'REDONDEADO',
    retroalimentacionExito:
      "¡Excelente redondeo de labios en la vocal 'O' de 'SO-PA'!",
  },
];

export const ModuloArticulacionView: React.FC<ModuloArticulacionViewProps> = ({
  palabraInicial,
  onRegistrarIntento,
  onNavigate,
}) => {
  const inicial =
    FONEMAS_DISPONIBLES.find((f) => f.idEjercicio === palabraInicial?.idEjercicio) ||
    FONEMAS_DISPONIBLES[0];

  const [fonemaActual, setFonemaActual] = useState<FonemaArticulacionItem>(inicial);
  const [camaraLenta, setCamaraLenta] = useState<boolean>(false);
  const [etapaAnimacionBoca, setEtapaAnimacionBoca] = useState<'CERRAR' | 'ABRIR'>(
    'ABRIR'
  );
  const [camaraEspejoActiva, setCamaraEspejoActiva] = useState<boolean>(false);
  const [comprobando, setComprobando] = useState<boolean>(false);
  const [precisionLabial, setPrecisionLabial] = useState<number>(90);
  const [mensajeFeedback, setMensajeFeedback] = useState<string>(
    inicial.retroalimentacionExito
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const intervalMs = camaraLenta ? 1600 : 900;
    const timer = setInterval(() => {
      setEtapaAnimacionBoca((prev) => (prev === 'CERRAR' ? 'ABRIR' : 'CERRAR'));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [camaraLenta]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleEspejoCamara = async () => {
    if (camaraEspejoActiva) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCamaraEspejoActiva(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      setCamaraEspejoActiva(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      setCamaraEspejoActiva(false);
    }
  };

  const handleComprobarArticulacion = async (precisionSimulada: number) => {
    setComprobando(true);
    setPrecisionLabial(precisionSimulada);
    setTimeout(async () => {
      const resp = await onRegistrarIntento(
        fonemaActual.idEjercicio,
        precisionSimulada
      );
      setMensajeFeedback(
        precisionSimulada >= 75
          ? `${fonemaActual.retroalimentacionExito} (${resp.mensaje})`
          : resp.mensaje
      );
      setComprobando(false);
    }, 600);
  };

  return (
    <section aria-labelledby="titulo-modulo-articulacion">
      {/* Cabecera de Sesión de Habla (Mockup 4 - Actividad 6) */}
      <div
        className="card-aaa"
        style={{
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          border: '3px solid var(--purple-aaa)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="btn-secondary-aaa"
            onClick={() => onNavigate('CATALOGO_CUENTOS')}
          >
            ← Sesión de habla
          </button>
          <div>
            <span className="badge-aaa badge-articulacion">
              Módulo 2 • {fonemaActual.categoria} (RF-08 / RF-09)
            </span>
            <h1
              id="titulo-modulo-articulacion"
              style={{ margin: '4px 0 0 0', fontSize: '1.75rem' }}
            >
              Di la palabra: {fonemaActual.fonema} ⭐⭐
            </h1>
          </div>
        </div>

        {/* Selector de palabras / fonemas */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {FONEMAS_DISPONIBLES.map((item) => (
            <button
              key={item.idEjercicio}
              type="button"
              className={
                fonemaActual.idEjercicio === item.idEjercicio
                  ? 'btn-purple-aaa'
                  : 'btn-secondary-aaa'
              }
              onClick={() => {
                setFonemaActual(item);
                setMensajeFeedback(item.retroalimentacionExito);
              }}
            >
              👄 {item.palabraMostrar}
            </button>
          ))}
        </div>
      </div>

      {/* Instrucción Paso 1 y Etiqueta de Vibración Nasal (Mockup 4) */}
      <div
        className="card-aaa"
        style={{
          marginBottom: '20px',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2rem' }} aria-hidden="true">
            💡
          </span>
          <div>
            <strong style={{ fontSize: '1.1rem' }}>{fonemaActual.paso1}</strong>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
              Apoyo visual articulatorio sin dependencia exclusiva del canal auditivo (WCAG 1.2 / DUA P1)
            </div>
          </div>
        </div>
        <span className="badge-aaa badge-articulacion" style={{ fontSize: '0.95rem' }}>
          〰️ {fonemaActual.indicadorTactil}
        </span>
      </div>

      {/* Dos Columnas: Modelo Guía Terapeuta (Video de Articulación) y Espejo AR del Niño */}
      <div className="grid-2-cols" style={{ marginBottom: '22px' }}>
        {/* Columna 1: Modelo Guía Terapeuta + Onda de Vibración Fonética Continua */}
        <div className="card-aaa" style={{ border: '3px solid var(--purple-aaa)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <span className="badge-aaa badge-articulacion">
              👩‍⚕️ Modelo Guía: Terapeuta de Lenguaje
            </span>
            <span className="badge-aaa badge-lsm">
              {camaraLenta ? '🐢 Cámara Lenta (0.5x)' : '▶ Velocidad Normal (1.0x)'}
            </span>
          </div>

          {/* Animación SVG de Apoyo Labial Sincronizado */}
          <div
            style={{
              backgroundColor: 'var(--purple-bg-soft)',
              border: '3px solid var(--purple-aaa)',
              borderRadius: '18px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            <svg
              width="240"
              height="135"
              viewBox="0 0 240 135"
              role="img"
              aria-label={`Animación guía de movimiento labial para pronunciar ${fonemaActual.palabraMostrar}`}
              style={{ maxWidth: '100%' }}
            >
              {/* Contorno de mejillas y mentón guía */}
              <rect
                x="10"
                y="10"
                width="220"
                height="115"
                rx="24"
                fill="#FFFFFF"
                stroke="#4C1D95"
                strokeWidth="3"
              />
              {/* Labio superior e inferior animados según sílaba */}
              {etapaAnimacionBoca === 'CERRAR' ? (
                <g>
                  <path
                    d="M 55 68 Q 90 52 120 62 Q 150 52 185 68"
                    fill="none"
                    stroke="#9D174D"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 55 68 Q 120 82 185 68"
                    fill="none"
                    stroke="#BE185D"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                  {/* Puntos de referencia labiales verdes */}
                  <circle cx="55" cy="68" r="5" fill="#047857" />
                  <circle cx="120" cy="65" r="5" fill="#047857" />
                  <circle cx="185" cy="68" r="5" fill="#047857" />
                </g>
              ) : (
                <g>
                  <ellipse
                    cx="120"
                    cy="68"
                    rx={fonemaActual.aperturaBucal === 'REDONDEADO' ? 36 : 58}
                    ry={28}
                    fill="#831843"
                    stroke="#BE185D"
                    strokeWidth="8"
                  />
                  <path
                    d="M 90 50 L 150 50"
                    stroke="#FFFFFF"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <circle cx="62" cy="68" r="5" fill="#047857" />
                  <circle cx="120" cy="40" r="5" fill="#047857" />
                  <circle cx="120" cy="96" r="5" fill="#047857" />
                  <circle cx="178" cy="68" r="5" fill="#047857" />
                </g>
              )}
            </svg>

            <div
              style={{
                fontSize: '1.45rem',
                fontWeight: 700,
                color: '#091326',
                backgroundColor: '#FFFFFF',
                padding: '8px 16px',
                borderRadius: '12px',
                border: '2px solid #4C1D95',
                display: 'inline-block',
                marginTop: '8px',
              }}
            >
              {etapaAnimacionBoca === 'CERRAR'
                ? `1️⃣ Cierre Labial (${fonemaActual.palabraMostrar.split('-')[0].trim()})`
                : `2️⃣ Apertura Vocálica (${fonemaActual.palabraMostrar})`}
            </div>
          </div>

          {/* Gráfica de Onda de Vibración Fonética Continua (Mockup 4) */}
          <div
            style={{
              backgroundColor: 'var(--bg-app)',
              padding: '14px 16px',
              borderRadius: '14px',
              border: '2px solid var(--border-subtle)',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px',
              }}
            >
              <strong>🌊 Vibración Fonética Continua</strong>
              <span className="badge-aaa badge-lsm">Zona Segura &lt;50 dB</span>
            </div>
            <svg width="100%" height="46" viewBox="0 0 360 46" aria-hidden="true">
              <path
                d="M 0 23 Q 30 4, 60 23 T 120 23 T 180 23 T 240 23 T 300 23 T 360 23"
                fill="none"
                stroke="#004488"
                strokeWidth="4"
              />
            </svg>
          </div>

          <button
            type="button"
            className="btn-secondary-aaa"
            style={{ width: '100%' }}
            onClick={() => setCamaraLenta((prev) => !prev)}
          >
            🔄 Repetir • {camaraLenta ? 'Cambiar a Velocidad 1.0x' : 'Ver fonema lento (0.5x)'}
          </button>
        </div>

        {/* Columna 2: Espejo AR de Imitación Bucal del Niño (Mockup 4) */}
        <div className="card-aaa" style={{ border: '3px solid var(--purple-aaa)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <span className="badge-aaa badge-success">✓ Alineado frente al Espejo AR</span>
            <span className="badge-aaa badge-articulacion">
              Cierre y Simetría Labial Activa
            </span>
          </div>

          <div
            className="ar-camera-stage"
            style={{ minHeight: '260px', borderColor: 'var(--purple-aaa)' }}
          >
            {camaraEspejoActiva ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="ar-video-element"
                aria-label="Espejo AR en vivo para practicar articulación oral"
              />
            ) : (
              <div className="ar-hand-guide-box" style={{ borderColor: '#C084FC' }}>
                <div style={{ fontSize: '3.8rem', marginBottom: '6px' }}>🧒🏽👄</div>
                <div
                  style={{
                    fontWeight: 700,
                    color: '#A7F3D0',
                    marginBottom: '6px',
                  }}
                >
                  ESPEJO AR • PUNTOS LABIALES DETECTADOS
                </div>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#F8FAFC' }}>
                  Mira cómo se juntan y abren tus labios al decir{' '}
                  <strong>&quot;{fonemaActual.palabraMostrar}&quot;</strong>
                </p>
              </div>
            )}
          </div>

          {/* Indicadores de Cierre y Simetría Labial y ¡Abre juntos! (Mockup 4) */}
          <div className="grid-2-cols" style={{ marginTop: '14px', marginBottom: '14px' }}>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-app)',
                border: '2px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                👄 Cierre y Simetría Labial
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-aaa)' }}>
                Óptima ({precisionLabial}%)
              </div>
            </div>

            <div
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: 'var(--success-bg)',
                border: '2px solid var(--success-border)',
                color: 'var(--success-text)',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                ✨ Sincronía Fonética
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                ¡Abre juntos! Correcto
              </div>
            </div>
          </div>

          {/* Botón Principal ¡Listo! Comprobar (Mockup 4) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              type="button"
              className="btn-primary-aaa"
              style={{ flex: '1 1 200px' }}
              disabled={comprobando}
              onClick={() => handleComprobarArticulacion(90)}
            >
              {comprobando ? '⏳ Comprobando articulación...' : '✓ ¡Listo! Comprobar (+25 ⭐)'}
            </button>

            <button
              type="button"
              className="btn-secondary-aaa"
              onClick={toggleEspejoCamara}
            >
              {camaraEspejoActiva ? '⏹ Apagar Espejo Web' : '📷 Activar Espejo de Cámara'}
            </button>
          </div>
        </div>
      </div>

      {/* Tarjeta Inferior de Retroalimentación Positiva (Mockup 4: "¡Excelente sellado labial!") */}
      <div
        className="card-aaa"
        style={{
          backgroundColor: 'var(--success-bg)',
          borderColor: 'var(--success-border)',
          color: 'var(--success-text)',
          borderWidth: '3px',
        }}
        role="status"
        aria-live="polite"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '2.2rem' }} aria-hidden="true">
            😊
          </span>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.28rem' }}>
              ¡Excelente sellado labial!
            </h2>
            <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>{mensajeFeedback}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

