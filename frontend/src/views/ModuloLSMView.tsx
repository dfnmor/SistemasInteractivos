import React, { useState, useRef, useEffect } from 'react';
import { PerfilNino, VistaActiva } from '../types/meexuu';

interface ModuloLSMViewProps {
  perfilActivo: PerfilNino;
  senaInicial?: { palabra: string; idEjercicio: number };
  onRegistrarIntento: (
    idEjercicio: number,
    precision: number
  ) => Promise<{
    titulo: string;
    mensaje: string;
    icono: string;
  }>;
  onNavigate: (vista: VistaActiva) => void;
}

interface SenaCatalogoItem {
  idEjercicio: number;
  palabra: string;
  emoji: string;
  instruccionVisual: string;
  puntosDactilares: string;
  marcadorArUco: string;
}

const SENAS_DISPONIBLES: SenaCatalogoItem[] = [
  {
    idEjercicio: 1,
    palabra: 'HOLA (SALUDO)',
    emoji: '👋🏽',
    instruccionVisual:
      'Levanta tu mano derecha a la altura de la frente y deslízala suavemente hacia afuera como un saludo.',
    puntosDactilares: '5 dedos extendidos • Palma frontal abierta',
    marcadorArUco: 'TUI-01 #AR-101',
  },
  {
    idEjercicio: 4,
    palabra: 'GATO',
    emoji: '🐱',
    instruccionVisual:
      'Coloca tus dedos índice y pulgar cerca de tus mejillas simulando los bigotes suaves del gatito.',
    puntosDactilares: 'Pinza índice-pulgar • Movimiento lateral en mejilla',
    marcadorArUco: 'TUI-01 #AR-201',
  },
  {
    idEjercicio: 2,
    palabra: 'LUNA',
    emoji: '🌙',
    instruccionVisual:
      'Forma una media luna con tu dedo índice y pulgar en forma de C cerca de tu sien derecha.',
    puntosDactilares: 'Configuración en C • Elevación suave',
    marcadorArUco: 'TUI-01 #AR-102',
  },
  {
    idEjercicio: 3,
    palabra: 'CONEJO',
    emoji: '🐰',
    instruccionVisual:
      'Extiende tus dedos índice y medio simulando las orejitas del conejo y muévelos dos veces.',
    puntosDactilares: 'Configuración en V • Flexión rítmica doble',
    marcadorArUco: 'TUI-01 #AR-103',
  },
  {
    idEjercicio: 5,
    palabra: 'CASA',
    emoji: '🏠',
    instruccionVisual:
      'Une las puntas de los dedos de ambas manos formando el techo inclinado de una casita.',
    puntosDactilares: 'Ambas manos simétricas • Ángulo piramidal 45°',
    marcadorArUco: 'TUI-01 #AR-202',
  },
];

export const ModuloLSMView: React.FC<ModuloLSMViewProps> = ({
  perfilActivo,
  senaInicial,
  onRegistrarIntento,
  onNavigate,
}) => {
  const inicial =
    SENAS_DISPONIBLES.find((s) => s.idEjercicio === senaInicial?.idEjercicio) ||
    SENAS_DISPONIBLES[0];

  const [senaActual, setSenaActual] = useState<SenaCatalogoItem>(inicial);
  const [camaraRealActiva, setCamaraRealActiva] = useState(false);
  const [estadoCamara, setEstadoCamara] = useState<
    'DISPONIBLE' | 'NO_DISPONIBLE' | 'FUERA_DE_ENCUADRE'
  >('DISPONIBLE');
  const [analizando, setAnalizando] = useState(false);
  const [precisionActual, setPrecisionActual] = useState<number>(88);
  const [velocidadModelo, setVelocidadModelo] = useState<0.5 | 1.0>(1.0);
  const [rotacionModelo, setRotacionModelo] = useState<number>(0);
  const [feedback, setFeedback] = useState<{
    titulo: string;
    mensaje: string;
    icono: string;
  }>({
    titulo: '¡Excelente postura!',
    mensaje: 'Reconocimiento cinemático de mano derecha (88% de coincidencia)',
    icono: '✓',
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleCamaraWebRTC = async () => {
    if (camaraRealActiva) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCamaraRealActiva(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      setCamaraRealActiva(true);
      setEstadoCamara('DISPONIBLE');
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      // Camino alternativo 1 (Fase 2, Actividad 5.2): Cámara no disponible
      setEstadoCamara('NO_DISPONIBLE');
      setCamaraRealActiva(false);
    }
  };

  const ejecutarReconocimientoVisionArtificial = async (precisionSimulada: number) => {
    if (estadoCamara !== 'DISPONIBLE') {
      setEstadoCamara('DISPONIBLE');
    }
    setAnalizando(true);
    setPrecisionActual(precisionSimulada);

    setTimeout(async () => {
      const resp = await onRegistrarIntento(
        senaActual.idEjercicio,
        precisionSimulada
      );
      setFeedback(resp);
      setAnalizando(false);
    }, 650);
  };

  return (
    <section aria-labelledby="titulo-modulo-lsm">
      {/* Barra Superior de Sesión de Señas (Mockup 3 - Actividad 6) */}
      <div
        className="card-aaa"
        style={{
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="btn-secondary-aaa"
            onClick={() => onNavigate('CATALOGO_CUENTOS')}
          >
            ← Regresar
          </button>
          <div>
            <span className="badge-aaa badge-lsm">
              Módulo 1 • Realidad Aumentada Móvil + NUI (Tracking de Manos)
            </span>
            <h1 id="titulo-modulo-lsm" style={{ margin: '4px 0 0 0', fontSize: '1.7rem' }}>
              Sesión de señas — Repite la seña: {senaActual.palabra}
            </h1>
          </div>
        </div>

        {/* Selector de Señas del Catálogo */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {SENAS_DISPONIBLES.map((item) => (
            <button
              key={item.idEjercicio}
              type="button"
              className={
                senaActual.idEjercicio === item.idEjercicio
                  ? 'btn-primary-aaa'
                  : 'btn-secondary-aaa'
              }
              onClick={() => setSenaActual(item)}
            >
              <span>{item.emoji}</span>
              <span>{item.palabra.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenedor Principal en 2 Columnas: Avatar de Referencia (MOD-3D-01) y Visor de Cámara AR */}
      <div className="grid-2-cols" style={{ marginBottom: '24px' }}>
        {/* Columna Izquierda: Referencia Visual y Modelo 3D Gesticulador */}
        <div className="card-aaa" style={{ border: '3px solid var(--primary-aaa)' }}>
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
            <span className="badge-aaa badge-lsm">
              🤖 Patrón de Referencia: {senaActual.marcadorArUco}
            </span>
            <span className="badge-aaa badge-articulacion">
              Rigging Dactilar • {velocidadModelo}x • {rotacionModelo}°
            </span>
          </div>

          {/* Visualizador del Avatar Gesticulador MOD-3D-01 */}
          <div
            style={{
              backgroundColor: 'var(--bg-card-highlight)',
              border: '3px solid var(--primary-aaa)',
              borderRadius: '18px',
              padding: '26px 20px',
              textAlign: 'center',
              marginBottom: '16px',
              transform: `rotateY(${rotacionModelo}deg)`,
              transition: 'transform 0.35s ease',
            }}
          >
            <div style={{ fontSize: '5rem', lineHeight: 1.1 }} aria-hidden="true">
              {senaActual.emoji} 🤟🏽
            </div>
            <h2 style={{ margin: '10px 0 6px 0', fontSize: '1.8rem' }}>
              {senaActual.palabra}
            </h2>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: 'var(--bg-surface)',
                padding: '6px 14px',
                borderRadius: '999px',
                border: '2px solid var(--border-strong)',
                fontWeight: 700,
                fontSize: '0.92rem',
              }}
            >
              🖐️ {senaActual.puntosDactilares}
            </div>
          </div>

          {/* Instrucción paso a paso sin dependencia auditiva (RF-06 / RNF-02) */}
          <div
            style={{
              backgroundColor: 'var(--bg-app)',
              padding: '14px 16px',
              borderRadius: '14px',
              border: '2px solid var(--border-subtle)',
              marginBottom: '16px',
            }}
          >
            <strong>👁️ Guía Visual Paso a Paso (DUA Principio 1):</strong>
            <p style={{ margin: '6px 0 0 0', fontSize: '1.05rem' }}>
              {senaActual.instruccionVisual}
            </p>
          </div>

          {/* Controles del Modelo 3D (Fase 2, Actividad 2: Velocidad 0.5x/1.0x y Rotación 360°) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              type="button"
              className="btn-secondary-aaa"
              style={{ flex: 1 }}
              onClick={() => setVelocidadModelo((v) => (v === 1.0 ? 0.5 : 1.0))}
            >
              🐢 Velocidad: {velocidadModelo}x
            </button>
            <button
              type="button"
              className="btn-secondary-aaa"
              style={{ flex: 1 }}
              onClick={() => setRotacionModelo((r) => (r + 45) % 360)}
            >
              🔄 Rotar Perfil 360° ({rotacionModelo}°)
            </button>
          </div>
        </div>

        {/* Columna Derecha: Visor de Cámara AR en Vivo y Reconocimiento de Visión Artificial (Mockup 3) */}
        <div className="card-aaa" style={{ border: '3px solid var(--primary-aaa)' }}>
          <div className="ar-camera-stage">
            <div className="live-badge">
              <span>🟢</span>
              <span>EN VIVO • Detección activa (1-2s RNF-03)</span>
            </div>

            {camaraRealActiva && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="ar-video-element"
                aria-label="Vista en vivo de la cámara frontal para reconocimiento de LSM"
              />
            )}

            {/* Caminos Alternativos del Diagrama de Flujo (Fase 2, Actividad 5.2) */}
            {estadoCamara === 'NO_DISPONIBLE' ? (
              <div className="ar-hand-guide-box" style={{ borderColor: '#FBBF24' }}>
                <div style={{ fontSize: '3rem' }}>📷⚠️</div>
                <h3 style={{ margin: '8px 0' }}>Cámara física no detectada</h3>
                <p style={{ fontSize: '0.95rem', margin: '0 0 12px 0' }}>
                  Ruta Alternativa Act. 5.2: Puedes usar el Simulador de Visión Artificial o
                  escanear tu tarjeta física TUI-01 sin perder tu avance.
                </p>
                <button
                  type="button"
                  className="btn-primary-aaa"
                  onClick={() => setEstadoCamara('DISPONIBLE')}
                >
                  ✓ Continuar con Simulación AR
                </button>
              </div>
            ) : estadoCamara === 'FUERA_DE_ENCUADRE' ? (
              <div className="ar-hand-guide-box" style={{ borderColor: '#FBBF24' }}>
                <div style={{ fontSize: '3.2rem' }}>🙌🏽🎯</div>
                <h3 style={{ margin: '8px 0' }}>Guía de Posición (Act. 5.2)</h3>
                <p style={{ fontSize: '0.95rem', margin: '0 0 12px 0' }}>
                  Acerca tu mano derecha al centro del recuadro punteado para que la cámara
                  vea tus dedos con claridad.
                </p>
                <button
                  type="button"
                  className="btn-primary-aaa"
                  onClick={() => setEstadoCamara('DISPONIBLE')}
                >
                  ✓ ¡Ya estoy en posición!
                </button>
              </div>
            ) : (
              !camaraRealActiva && (
                <div className="ar-hand-guide-box">
                  <div style={{ fontSize: '4.2rem', marginBottom: '6px' }}>🖐🏽✨</div>
                  <div
                    style={{
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: '#38BDF8',
                      marginBottom: '6px',
                    }}
                  >
                    COLOCA TU MANO AQUÍ
                  </div>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: '#E2E8F0' }}>
                    Malla NUI de 21 puntos articulares lista para evaluar la seña{' '}
                    <strong>&quot;{senaActual.palabra}&quot;</strong>
                  </p>
                </div>
              )
            )}
          </div>

          {/* Botones de Acción de Cámara y Simulación de Visión Artificial */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginTop: '16px',
            }}
          >
            <button
              type="button"
              className="btn-primary-aaa"
              style={{ flex: '1 1 220px' }}
              disabled={analizando}
              onClick={() => ejecutarReconocimientoVisionArtificial(91)}
            >
              {analizando
                ? '🔍 Analizando postura dactilar...'
                : `🟢 Capturar Seña "${senaActual.palabra.split(' ')[0]}" (Acierto ~91%)`}
            </button>

            <button
              type="button"
              className="btn-secondary-aaa"
              disabled={analizando}
              onClick={() => ejecutarReconocimientoVisionArtificial(68)}
              title="Prueba la ruta no punitiva (RNF-08) cuando el niño requiere un nuevo intento"
            >
              🔄 Simular Reintento Amigable (68%)
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginTop: '10px',
            }}
          >
            <button
              type="button"
              className="btn-secondary-aaa"
              style={{ flex: 1 }}
              onClick={toggleCamaraWebRTC}
            >
              {camaraRealActiva
                ? '⏹ Detener Cámara Web Real'
                : '📹 Activar Cámara Web del Dispositivo'}
            </button>
            <button
              type="button"
              className="btn-secondary-aaa"
              onClick={() => setEstadoCamara('FUERA_DE_ENCUADRE')}
            >
              📐 Probar Guía de Encuadre
            </button>
            <button
              type="button"
              className="btn-secondary-aaa"
              onClick={() => ejecutarReconocimientoVisionArtificial(95)}
            >
              🃏 Tarjeta Física {senaActual.marcadorArUco}
            </button>
          </div>
        </div>
      </div>

      {/* Tarjeta de Retroalimentación Inmediata de Visión Artificial (Mockup 3 - Actividad 6) */}
      <div
        className="card-aaa"
        style={{
          backgroundColor:
            precisionActual >= 75 ? 'var(--success-bg)' : 'var(--warn-bg)',
          borderColor:
            precisionActual >= 75 ? 'var(--success-border)' : 'var(--warn-border)',
          borderWidth: '3px',
        }}
        role="status"
        aria-live="polite"
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                border: '2px solid currentColor',
              }}
            >
              {feedback.icono}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem' }}>{feedback.titulo}</h2>
              <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>{feedback.mensaje}</p>
            </div>
          </div>

          <div
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              padding: '8px 20px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-surface)',
              border: '2px solid var(--border-strong)',
            }}
          >
            {precisionActual.toFixed(0)}%
          </div>
        </div>

        {/* Indicadores de Calibración base y Coincidencia alta (Mockup 3) */}
        <div className="grid-2-cols">
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700,
                fontSize: '0.9rem',
                marginBottom: '4px',
              }}
            >
              <span>Calibración base (Encuadre NUI)</span>
              <span>94%</span>
            </div>
            <div className="progress-track-aaa">
              <div className="progress-fill-success" style={{ width: '94%' }} />
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700,
                fontSize: '0.9rem',
                marginBottom: '4px',
              }}
            >
              <span>
                Coincidencia cinemática ({perfilActivo.nombre_apodo.split('(')[0].trim()})
              </span>
              <span>{precisionActual.toFixed(0)}%</span>
            </div>
            <div className="progress-track-aaa">
              <div
                className={
                  precisionActual >= 75 ? 'progress-fill-success' : 'progress-fill-aaa'
                }
                style={{ width: `${precisionActual}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
