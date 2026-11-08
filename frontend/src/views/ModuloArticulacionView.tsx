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
    paso1: 'Paso 1: Presiona los labios con suavidad',
    indicadorTactil: 'Vibración Nasal',
    aperturaBucal: 'CERRADO_SUAVE',
    retroalimentacionExito:
      "¡Excelente sellado labial! Tus labios hicieron el contacto perfecto para 'MA'.",
  },
  {
    idEjercicio: 12,
    categoria: 'APERTURA VOCÁLICA',
    fonema: '/k/ - /a/ • CA - SA',
    palabraMostrar: 'CA - SA',
    paso1: 'Paso 1: Abre la boca grande en "CA" y sonríe en "SA"',
    indicadorTactil: 'Soplo Suave',
    aperturaBucal: 'ABIERTO_VOCAL',
    retroalimentacionExito:
      "¡Excelente apertura vocálica! Pronunciaste 'CA - SA' con gran claridad.",
  },
  {
    idEjercicio: 11,
    categoria: 'FONEMA BILABIAL',
    fonema: '/p/ - /a/ • PA - PÁ',
    palabraMostrar: 'PA - PÁ',
    paso1: 'Paso 1: Junta los labios y suelta el aire suavemente',
    indicadorTactil: 'Pulso Labial',
    aperturaBucal: 'CERRADO_SUAVE',
    retroalimentacionExito:
      "¡Excelente sellado labial! Tus labios hicieron el contacto perfecto para 'PA'.",
  },
  {
    idEjercicio: 13,
    categoria: 'REDONDEO LABIAL',
    fonema: '/s/ - /o/ • SO - PA',
    palabraMostrar: 'SO - PA',
    paso1: 'Paso 1: Redondea tus labios como un círculo para la "O"',
    indicadorTactil: 'Círculo Labial',
    aperturaBucal: 'REDONDEADO',
    retroalimentacionExito:
      "¡Excelente redondeo labial! Tus labios formaron el círculo perfecto para 'SO'.",
  },
];

export const ModuloArticulacionView: React.FC<ModuloArticulacionViewProps> = ({
  perfilActivo,
  palabraInicial,
  onRegistrarIntento,
  onNavigate,
}) => {
  const esNoLector = perfilActivo.nivel_lectura === 'NO_LECTOR';

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
  const [precisionLabial, setPrecisionLabial] = useState<number>(92);
  const [esExito, setEsExito] = useState<boolean>(true);
  const [mensajeFeedback, setMensajeFeedback] = useState<string>(
    inicial.retroalimentacionExito
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const intervalMs = camaraLenta ? 1500 : 850;
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
      }, 120);
    } catch {
      setCamaraEspejoActiva(false);
    }
  };

  const handleComprobarArticulacion = async (precisionSimulada: number) => {
    setComprobando(true);
    setPrecisionLabial(precisionSimulada);
    try {
      const resp = await onRegistrarIntento(
        fonemaActual.idEjercicio,
        precisionSimulada
      );
      if (precisionSimulada >= 75) {
        setEsExito(true);
        setMensajeFeedback(fonemaActual.retroalimentacionExito);
      } else {
        setEsExito(false);
        setCamaraLenta(true);
        setMensajeFeedback(
          `¡Casi! Intenta otra vez: ${resp.mensaje}`
        );
      }
    } finally {
      setComprobando(false);
    }
  };

  return (
    <section aria-labelledby="titulo-sesion-habla">
      {/* =====================================================================
          1. BARRA SUPERIOR IDÉNTICA AL MOCKUP 4 (Fase 2, Act. 6, p. 9)
             "← | Sesión de habla"
         ===================================================================== */}
      <div className="screen-back-header">
        <button
          type="button"
          className="btn-back-circle"
          onClick={() => onNavigate('CATALOGO_CUENTOS', '/cuentos')}
          aria-label="Volver al menú principal"
        >
          ←
        </button>
        <h1
          id="titulo-sesion-habla"
          style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, flex: 1 }}
        >
          {esNoLector ? '👄 Habla' : 'Sesión de habla'}
        </h1>

        {/* Selector compacto de sílabas de la BD */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {FONEMAS_DISPONIBLES.map((item) => {
            const activo = item.idEjercicio === fonemaActual.idEjercicio;
            return (
              <button
                key={item.idEjercicio}
                type="button"
                onClick={() => {
                  setFonemaActual(item);
                  setEsExito(true);
                  setMensajeFeedback(item.retroalimentacionExito);
                }}
                style={{
                  minHeight: '48px',
                  padding: '4px 8px',
                  borderRadius: '10px',
                  border: activo
                    ? '2px solid var(--primary-aaa)'
                    : '1.5px solid var(--border-subtle)',
                  backgroundColor: activo ? 'var(--bg-card-highlight)' : '#FFFFFF',
                  color: '#091326',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {item.palabraMostrar.replace(' - ', '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          2. TARJETA DE FONEMA IDÉNTICA AL MOCKUP 4 + BOCETO "Articulación oral"
             - "FONEMA BILABIAL" / "Di la palabra:"
             - "🔊 /m/ - /a/ • MA - MÁ" | "★★☆"
             - "💡 Paso 1: Presiona los labios con suavidad" | "〰 Vibración Nasal"
         ===================================================================== */}
      <div
        className="card-aaa"
        style={{
          padding: '14px 16px',
          marginBottom: '12px',
          borderRadius: '18px',
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
          <div>
            {!esNoLector && (
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#2563EB',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {fonemaActual.categoria} • Di la palabra:
              </div>
            )}
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#091326',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#DBEAFE',
                  color: '#1E40AF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                }}
                aria-hidden="true"
              >
                🔊
              </span>
              <span>
                {esNoLector ? fonemaActual.palabraMostrar : fonemaActual.fonema}
              </span>
            </div>
          </div>

          <div
            style={{
              color: '#F59E0B',
              fontSize: '1.1rem',
              letterSpacing: '1px',
            }}
            aria-label="2 de 3 estrellas"
          >
            ★★☆
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
          }}
        >
          {!esNoLector ? (
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
              }}
            >
              💡 {fonemaActual.paso1}
            </div>
          ) : (
            <div style={{ fontSize: '1.3rem' }} aria-hidden="true">
              💡 👄 ➡️ 😊
            </div>
          )}

          <span
            style={{
              backgroundColor: '#DCFCE7',
              color: '#065F46',
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '999px',
            }}
          >
            〰 {fonemaActual.indicadorTactil}
          </span>
        </div>
      </div>

      {/* =====================================================================
          3. TARJETA "Modelo Guía: Terapeuta" IDÉNTICA AL MOCKUP 4
             - Cabecera: "👤 Modelo Guía: Terapeuta" + botón circular azul "▶"
             - Centro: Boca animada + onda azul "Vibración Fonética Continua"
         ===================================================================== */}
      <div
        className="card-aaa"
        style={{
          padding: '14px 16px',
          marginBottom: '12px',
          borderRadius: '18px',
          backgroundColor: '#F8FAFC',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              fontSize: '0.84rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
            }}
          >
            👤 {esNoLector ? 'Guía' : 'Modelo Guía: Terapeuta'}
          </div>

          <button
            type="button"
            onClick={() => setCamaraLenta((prev) => !prev)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: '2px solid #1E3A8A',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Reproducir modelo guía de terapeuta"
          >
            ▶
          </button>
        </div>

        {/* Boca animada + Onda senoidal continua como en el Mockup 4 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.4rem', lineHeight: 1 }} aria-hidden="true">
            {etapaAnimacionBoca === 'CERRAR' ? '👄' : '🗣️'}
          </div>

          <svg
            width="100%"
            height="42"
            viewBox="0 0 320 42"
            aria-hidden="true"
            style={{ marginTop: '4px' }}
          >
            <path
              d="M 10 21 Q 35 3, 60 21 T 110 21 T 160 21 T 210 21 T 260 21 T 310 21"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>

          {!esNoLector && (
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#2563EB',
              }}
            >
              Vibración Fonética Continua {camaraLenta ? '(0.5x Lento)' : '(1.0x)'}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          4. TARJETA DE ESPEJO AR CON CÁMARA IDÉNTICA AL MOCKUP 4
             - Píldora verde superior izquierda: "✓ Alineado"
             - Silueta labial punteada en el centro sobre el video
             - Dos indicadores debajo: "👄 Cierre y Simetría Labial" | "¡Abre juntos! Correcto"
         ===================================================================== */}
      <div
        className="card-aaa"
        style={{
          padding: '12px',
          marginBottom: '12px',
          borderRadius: '18px',
        }}
      >
        <div
          className="ar-camera-stage"
          style={{
            minHeight: '190px',
            borderRadius: '16px',
            marginBottom: '10px',
          }}
        >
          {/* Píldora superior izquierda idéntica al Mockup 4: "✓ Alineado" */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 6,
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>✓</span>
            <span>{esNoLector ? 'OK' : 'Alineado'}</span>
          </div>

          <button
            type="button"
            onClick={toggleEspejoCamara}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 6,
              minHeight: '48px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              color: '#FFFFFF',
              border: '1.5px solid #94A3B8',
              borderRadius: '999px',
              padding: '4px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {camaraEspejoActiva ? '⏹ Espejo' : '📷 Activar espejo'}
          </button>

          {camaraEspejoActiva && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="ar-video-element"
              style={{ width: '100%', height: '190px' }}
              aria-label="Espejo de cámara frontal para articulación oral"
            />
          )}

          {/* Contorno guía labial punteado en el centro del espejo AR (Mockup 4) */}
          <div
            style={{
              position: 'relative',
              zIndex: 4,
              width: '150px',
              height: '92px',
              borderRadius: '48px',
              border: '2.5px dashed #34D399',
              backgroundColor: 'rgba(16, 185, 129, 0.14)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '2.3rem' }} aria-hidden="true">
              👄
            </span>
          </div>
        </div>

        {/* Dos indicadores inferiores lado a lado idénticos al Mockup 4 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '4px',
              }}
            >
              👄 {esNoLector ? 'Labios' : 'Cierre y Simetría Labial'}
            </div>
            <div className="progress-track-aaa" style={{ height: '8px' }}>
              <div
                className="progress-fill-aaa"
                style={{ width: `${precisionLabial}%` }}
              />
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#047857',
                marginBottom: '4px',
                textAlign: 'right',
              }}
            >
              {esNoLector ? '✓ OK' : '¡Abre juntos! Correcto'}
            </div>
            <div className="progress-track-aaa" style={{ height: '8px' }}>
              <div
                className="progress-fill-success"
                style={{ width: `${precisionLabial}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          5. FILA DE BOTONES IDÉNTICA AL MOCKUP 4:
             - Izquierda: "↻ Repetir / Ver fonema lento"
             - Derecha: "✓ ¡Listo! Comprobar"
         ===================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.35fr',
          gap: '10px',
          marginBottom: '10px',
        }}
      >
        <button
          type="button"
          className="btn-secondary-aaa"
          style={{
            borderRadius: '16px',
            flexDirection: 'column',
            gap: '2px',
            padding: '8px 10px',
          }}
          onClick={() => setCamaraLenta((prev) => !prev)}
        >
          <span style={{ fontSize: '0.92rem', fontWeight: 700 }}>
            ↻ {esNoLector ? '🐢' : 'Repetir'}
          </span>
          {!esNoLector && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {camaraLenta ? 'Velocidad 1.0x' : 'Ver fonema lento'}
            </span>
          )}
        </button>

        <button
          type="button"
          className="btn-primary-aaa"
          style={{
            borderRadius: '16px',
            backgroundColor: '#2563EB',
            fontSize: '0.96rem',
          }}
          disabled={comprobando}
          onClick={() => handleComprobarArticulacion(92)}
        >
          <span>✓</span>
          <span>
            {comprobando
              ? '...'
              : esNoLector
              ? '¡Listo!'
              : '¡Listo! Comprobar'}
          </span>
        </button>
      </div>

      {/* Botones rápidos de simulación (acierto / fallo) conectados a TABLA_METRICA_INTENTO */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          type="button"
          className="btn-success-aaa"
          style={{ flex: 1, fontSize: '0.8rem', padding: '6px 10px' }}
          disabled={comprobando}
          onClick={() => handleComprobarArticulacion(94)}
        >
          ✓ Simular acierto (+25 ★)
        </button>
        <button
          type="button"
          className="btn-secondary-aaa"
          style={{
            flex: 1,
            fontSize: '0.8rem',
            padding: '6px 10px',
            backgroundColor: 'var(--warn-bg)',
            color: 'var(--warn-text)',
            borderColor: 'var(--warn-border)',
          }}
          disabled={comprobando}
          onClick={() => handleComprobarArticulacion(60)}
        >
          ✗ Simular fallo
        </button>
      </div>

      {/* =====================================================================
          6. TARJETA VERDE MENTA INFERIOR IDÉNTICA AL MOCKUP 4:
             "😊 ¡Excelente sellado labial! Tus labios hicieron el contacto perfecto para 'MA'."
         ===================================================================== */}
      <div
        className="card-aaa"
        style={{
          padding: '14px 16px',
          borderRadius: '18px',
          backgroundColor: esExito ? '#DCFCE7' : 'var(--warn-bg)',
          border: `2px solid ${esExito ? '#10B981' : 'var(--warn-border)'}`,
          color: esExito ? '#064E3B' : 'var(--warn-text)',
        }}
        role="status"
        aria-live="polite"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.8rem' }} aria-hidden="true">
            {esExito ? '😊' : '💪'}
          </span>
          <div>
            <h2 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>
              {esExito
                ? '¡Excelente sellado labial!'
                : '¡Casi! Intenta otra vez'}
            </h2>
            {!esNoLector && (
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {mensajeFeedback}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
