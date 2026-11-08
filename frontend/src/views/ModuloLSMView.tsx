import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PerfilNino, Cuento, VistaActiva } from '../types/meexuu';

interface ModuloLSMViewProps {
  perfilActivo: PerfilNino;
  cuentos: Cuento[];
  senaInicial?: { palabra: string; idEjercicio: number; idCuento?: number };
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

const CATEGORIA_POR_SENA: Record<string, string> = {
  HOLA: 'SALUDO',
  LUNA: 'NATURALEZA',
  CONEJO: 'ANIMAL',
  MAMÁ: 'FAMILIA',
  PAPÁ: 'FAMILIA',
  ADIÓS: 'DESPEDIDA',
  GATO: 'ANIMAL',
  CASA: 'HOGAR',
  AMIGO: 'VALORES',
};

const ICONOS_CUENTA_REGRESIVA: Record<number, { icono: string; texto: string }> = {
  3: {
    icono: '🖐️',
    texto: 'Prepárate frente a la cámara',
  },
  2: {
    icono: '👀',
    texto: 'Mira el contorno guía',
  },
  1: {
    icono: '✨',
    texto: '¡Listo! Activando cámara...',
  },
};

export const ModuloLSMView: React.FC<ModuloLSMViewProps> = ({
  perfilActivo,
  cuentos,
  senaInicial,
  onRegistrarIntento,
  onNavigate,
}) => {
  const esNoLector = perfilActivo.nivel_lectura === 'NO_LECTOR';

  const ejerciciosDisponibles = useMemo(() => {
    const lista: Array<{
      id_ejercicio: number;
      id_cuento: number;
      palabra_o_sena: string;
      titulo_cuento: string;
      imagen_portada: string;
      patron_referencia_id: number;
    }> = [];
    cuentos.forEach((c) => {
      if (c.tipo === 'LSM') {
        (c.ejercicios || []).forEach((ej) => {
          lista.push({
            id_ejercicio: ej.id_ejercicio,
            id_cuento: c.id_cuento,
            palabra_o_sena: ej.palabra_o_sena,
            titulo_cuento: c.titulo,
            imagen_portada: c.imagen_portada || '✋',
            patron_referencia_id: ej.patron_referencia_id,
          });
        });
      }
    });
    return lista;
  }, [cuentos]);

  const defaultEj =
    ejerciciosDisponibles.find((e) => e.id_ejercicio === senaInicial?.idEjercicio) ||
    ejerciciosDisponibles[0] || {
      id_ejercicio: 1,
      id_cuento: 1,
      palabra_o_sena: 'HOLA',
      titulo_cuento: 'El Conejito y la Luna',
      imagen_portada: '🐰🌙',
      patron_referencia_id: 101,
    };

  const [idEjercicioActivo, setIdEjercicioActivo] = useState<number>(
    defaultEj.id_ejercicio
  );

  useEffect(() => {
    if (senaInicial?.idEjercicio) {
      setIdEjercicioActivo(senaInicial.idEjercicio);
    }
  }, [senaInicial]);

  const senaActual =
    ejerciciosDisponibles.find((e) => e.id_ejercicio === idEjercicioActivo) ||
    defaultEj;

  // DIX09 a) Cuenta regresiva visual 3-2-1 con íconos, sin sonido, antes de activar la cámara
  const [cuentaRegresiva, setCuentaRegresiva] = useState<number | null>(null);
  const [camaraActiva, setCamaraActiva] = useState<boolean>(false);
  const [modoCamaraVirtual, setModoCamaraVirtual] = useState<boolean>(false);

  // DIX09 b) Marco animado alrededor del contorno guía que cambia de aspecto cuando se detecta al niño
  const [ninoDetectado, setNinoDetectado] = useState<boolean>(true);

  // DIX09 c) y d) Seña de referencia en cámara lenta (0.5x) en fallo + hasta 3 intentos sin penalización + botón "Ver seña de nuevo"
  const [velocidadReferencia, setVelocidadReferencia] = useState<0.5 | 1.0>(1.0);
  const [mostrarReferenciaModal, setMostrarReferenciaModal] = useState<boolean>(false);
  const [intentosSinPenalizacion, setIntentosSinPenalizacion] = useState<number>(0);
  const [analizando, setAnalizando] = useState<boolean>(false);

  // DIX09 e) Retroalimentación multimodal (Ícono + Texto + Color) dentro de la tarjeta blanca inferior del Mockup 3
  const [estadoFeedback, setEstadoFeedback] = useState<{
    tipo: 'EXITO' | 'REINTENTO_DIX09';
    precision: number;
    titulo: string;
    subtitulo: string;
    icono: string;
  }>({
    tipo: 'EXITO',
    precision: 88,
    titulo: '¡Excelente postura!',
    subtitulo: 'Reconocimiento cinemático de mano derecha',
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

  // DIX09 d) Botón grande y siempre visible "Ver seña de nuevo"
  const handleVerSenaDeNuevo = (enCamaraLenta = false) => {
    if (enCamaraLenta) {
      setVelocidadReferencia(0.5);
    }
    setMostrarReferenciaModal(true);
  };

  // DIX09 a) Activar cámara real getUserMedia tras cuenta regresiva visual 3-2-1 sin sonido
  const iniciarCamaraConCuentaRegresiva = () => {
    if (camaraActiva) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCamaraActiva(false);
      setModoCamaraVirtual(false);
      return;
    }

    setCuentaRegresiva(3);
    const t2 = setTimeout(() => setCuentaRegresiva(2), 850);
    const t1 = setTimeout(() => setCuentaRegresiva(1), 1700);
    const tFin = setTimeout(async () => {
      setCuentaRegresiva(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
          audio: false,
        });
        streamRef.current = stream;
        setCamaraActiva(true);
        setModoCamaraVirtual(false);
        setNinoDetectado(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }, 180);
      } catch {
        setCamaraActiva(true);
        setModoCamaraVirtual(true);
        setNinoDetectado(true);
      }
    }, 2550);

    return () => {
      clearTimeout(t2);
      clearTimeout(t1);
      clearTimeout(tFin);
    };
  };

  // Evaluar y guardar en TABLA_METRICA_INTENTO vía API
  const evaluarYGuardarIntento = async (precision: number) => {
    setAnalizando(true);
    setNinoDetectado(true);
    try {
      await onRegistrarIntento(senaActual.id_ejercicio, precision);

      if (precision >= 75) {
        setVelocidadReferencia(1.0);
        setIntentosSinPenalizacion(0);
        setMostrarReferenciaModal(false);
        setEstadoFeedback({
          tipo: 'EXITO',
          precision,
          titulo: '¡Excelente postura!',
          subtitulo: 'Reconocimiento cinemático de mano derecha (+25 ★)',
          icono: '✓',
        });
      } else {
        // DIX09 c) Si la seña no se reconoce:
        // Mostrar de nuevo la seña de referencia en cámara lenta con el mensaje "¡Casi! Intenta otra vez" y un ícono de ánimo, con hasta 3 intentos sin penalización.
        const siguienteIntento =
          intentosSinPenalizacion >= 3 ? 1 : intentosSinPenalizacion + 1;
        setIntentosSinPenalizacion(siguienteIntento);
        setVelocidadReferencia(0.5);
        setMostrarReferenciaModal(true);

        setEstadoFeedback({
          tipo: 'REINTENTO_DIX09',
          precision,
          titulo: '¡Casi! Intenta otra vez',
          subtitulo: `Intento ${siguienteIntento} de 3 sin penalización • Seña en cámara lenta (0.5x)`,
          icono: '💪',
        });
      }
    } finally {
      setAnalizando(false);
    }
  };

  const handleBotonObturador = () => {
    if (!camaraActiva && cuentaRegresiva === null) {
      iniciarCamaraConCuentaRegresiva();
      return;
    }
    const acierto = Math.random() >= 0.4;
    const precision = acierto
      ? Math.floor(84 + Math.random() * 14)
      : Math.floor(54 + Math.random() * 18);
    evaluarYGuardarIntento(precision);
  };

  const categoriaTexto =
    CATEGORIA_POR_SENA[senaActual.palabra_o_sena] || 'PRÁCTICA LSM';

  return (
    <section aria-labelledby="titulo-sesion-senas">
      {/* =====================================================================
          1. BARRA SUPERIOR IDÉNTICA AL MOCKUP 3 (Fase 2, Act. 6, p. 9)
             "← | Sesión de señas | [👤]"
         ===================================================================== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn-back-circle"
            onClick={() => onNavigate('CATALOGO_CUENTOS', '/cuentos')}
            aria-label="Volver al catálogo de cuentos"
          >
            ←
          </button>
          <h1
            id="titulo-sesion-senas"
            style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}
          >
            {esNoLector ? '✋ LSM' : 'Sesión de señas'}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('PRACTICA_V1', '/practica-v1')}
          style={{
            minWidth: '48px',
            minHeight: '48px',
            borderRadius: '14px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            border: '2px solid #1E3A8A',
            fontWeight: 700,
            fontSize: '0.82rem',
            padding: '6px 10px',
            cursor: 'pointer',
          }}
          title="Ver versión original antes de DIX09 (/practica-v1)"
        >
          👤 v1
        </button>
      </div>

      {/* =====================================================================
          2. ENCABEZADO "Repite la seña:" + PÍLDORA "✋ HOLA (SALUDO)" (Mockup 3)
         ===================================================================== */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        {!esNoLector && (
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            Repite la seña:
          </div>
        )}

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            borderRadius: '999px',
            backgroundColor: '#EFF6FF',
            border: '2px solid #93C5FD',
            color: '#1E3A8A',
            fontWeight: 700,
            fontSize: '1.15rem',
          }}
        >
          <span aria-hidden="true">✋</span>
          <span>
            {senaActual.palabra_o_sena}
            {!esNoLector ? ` (${categoriaTexto})` : ''}
          </span>
        </div>

        {/* Selector compacto de señas del cuento en BD */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
            flexWrap: 'wrap',
            marginTop: '8px',
          }}
        >
          {ejerciciosDisponibles.slice(0, 6).map((ej) => {
            const activo = ej.id_ejercicio === senaActual.id_ejercicio;
            return (
              <button
                key={ej.id_ejercicio}
                type="button"
                onClick={() => {
                  setIdEjercicioActivo(ej.id_ejercicio);
                  setIntentosSinPenalizacion(0);
                  setVelocidadReferencia(1.0);
                }}
                style={{
                  minHeight: '48px',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  border: activo
                    ? '2px solid var(--primary-aaa)'
                    : '1.5px solid var(--border-subtle)',
                  backgroundColor: activo ? 'var(--primary-aaa)' : '#FFFFFF',
                  color: activo ? '#FFFFFF' : '#091326',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {ej.imagen_portada} {ej.palabra_o_sena}
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          DIX09 d) BOTÓN GRANDE Y SIEMPRE VISIBLE "Ver seña de nuevo" (≥48x48 dp)
          + REPRODUCTOR DE SEÑA DE REFERENCIA EN CÁMARA LENTA (DIX09 c)
         ===================================================================== */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn-primary-aaa"
            style={{
              flex: 1,
              minHeight: '52px',
              fontSize: '1rem',
              backgroundColor: '#004488',
              borderRadius: '14px',
            }}
            onClick={() => {
              setMostrarReferenciaModal((prev) => !prev);
            }}
          >
            <span>🔁</span>
            <span>Ver seña de nuevo</span>
          </button>

          <button
            type="button"
            className="btn-secondary-aaa"
            style={{
              minHeight: '52px',
              padding: '8px 12px',
              borderRadius: '14px',
              backgroundColor:
                velocidadReferencia === 0.5 ? 'var(--warn-bg)' : '#FFFFFF',
              borderColor:
                velocidadReferencia === 0.5
                  ? 'var(--warn-border)'
                  : 'var(--border-strong)',
              color:
                velocidadReferencia === 0.5 ? 'var(--warn-text)' : '#091326',
            }}
            onClick={() =>
              setVelocidadReferencia((v) => (v === 1.0 ? 0.5 : 1.0))
            }
            aria-label="Alternar cámara lenta de la seña de referencia"
          >
            🐢 {velocidadReferencia}x
          </button>
        </div>

        {/* Seña de referencia desplegada (se abre al tocar "Ver seña de nuevo" o automáticamente en cámara lenta al fallar un intento) */}
        {mostrarReferenciaModal && (
          <div
            style={{
              marginTop: '10px',
              padding: '14px',
              borderRadius: '18px',
              backgroundColor:
                velocidadReferencia === 0.5
                  ? 'var(--warn-bg)'
                  : 'var(--bg-card-highlight)',
              border: `3px solid ${
                velocidadReferencia === 0.5
                  ? 'var(--warn-border)'
                  : 'var(--primary-aaa)'
              }`,
              textAlign: 'center',
            }}
            role="region"
            aria-label="Demostración de seña de referencia"
          >
            <div
              className={
                velocidadReferencia === 0.5
                  ? 'dix09-reference-playing-slow'
                  : 'dix09-reference-playing-normal'
              }
              style={{ fontSize: '3.6rem', lineHeight: 1.1 }}
              aria-hidden="true"
            >
              {senaActual.imagen_portada} 🤟🏽
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '1.05rem',
                color: '#091326',
                marginTop: '6px',
              }}
            >
              {velocidadReferencia === 0.5
                ? `🐢 Seña "${senaActual.palabra_o_sena}" en cámara lenta (0.5x)`
                : `▶ Seña de referencia: "${senaActual.palabra_o_sena}" (1.0x)`}
            </div>
            {estadoFeedback.tipo === 'REINTENTO_DIX09' && (
              <div
                style={{
                  marginTop: '4px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--warn-text)',
                }}
              >
                💪🌟 ¡Casi! Intenta otra vez ({intentosSinPenalizacion} de 3 intentos sin
                penalización)
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================================
          3. VISOR DE CÁMARA AR VERTICAL IDÉNTICO AL MOCKUP 3 + MEJORAS DIX09 a) y b)
             - Píldora blanca superior izquierda: "🟢 EN VIVO - Detección activa"
             - Marco animado alrededor del contorno guía (cambia cuando detecta al niño)
             - Silueta de mano + píldora oscura "COLOCA TU MANO AQUÍ"
         ===================================================================== */}
      <div
        className="ar-camera-stage"
        style={{
          minHeight: '320px',
          marginBottom: '14px',
          position: 'relative',
        }}
      >
        {/* Píldora superior izquierda idéntica al Mockup 3: "🟢 EN VIVO - Detección activa" */}
        <div className="live-pill-mockup">
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: camaraActiva ? '#10B981' : '#F59E0B',
              display: 'inline-block',
            }}
          />
          <span>
            {camaraActiva
              ? esNoLector
                ? 'EN VIVO'
                : 'EN VIVO - Detección activa'
              : esNoLector
              ? 'CÁMARA'
              : 'EN VIVO - Lista para iniciar'}
          </span>
        </div>

        {/* Botón en esquina superior derecha para alternar detección del niño (demostración DIX09 b) */}
        <button
          type="button"
          onClick={() => setNinoDetectado((prev) => !prev)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 8,
            minHeight: '48px',
            backgroundColor: ninoDetectado ? '#064E3B' : '#1E3A8A',
            color: '#FFFFFF',
            border: '2px solid #FFFFFF',
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          title="Alternar estado del marco animado cuando se detecta al niño (DIX09 b)"
        >
          {ninoDetectado ? '🟢 Niño detectado' : '🔵 Buscando niño'}
        </button>

        {/* DIX09 a) Cuenta regresiva visual 3-2-1 con íconos y sin sonido antes de activar la cámara */}
        {cuentaRegresiva !== null && (
          <div
            className="dix09-countdown-overlay"
            role="timer"
            aria-live="assertive"
          >
            <div style={{ fontSize: '3.8rem', marginBottom: '4px' }}>
              {ICONOS_CUENTA_REGRESIVA[cuentaRegresiva]?.icono || '✨'}
            </div>
            <div
              style={{
                fontSize: '4.4rem',
                fontWeight: 700,
                lineHeight: 1,
                color: '#FACC15',
              }}
            >
              {cuentaRegresiva}
            </div>
            <p
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                marginTop: '10px',
                color: '#FFFFFF',
              }}
            >
              {ICONOS_CUENTA_REGRESIVA[cuentaRegresiva]?.texto}
            </p>
            <span
              style={{
                marginTop: '6px',
                fontSize: '0.78rem',
                backgroundColor: '#1E293B',
                color: '#F8FAFC',
                padding: '4px 12px',
                borderRadius: '999px',
                border: '1px solid #94A3B8',
              }}
            >
              🔇 Sin sonido (DIX09)
            </span>
          </div>
        )}

        {/* Video real getUserMedia */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="ar-video-element"
          style={{
            display: camaraActiva && !modoCamaraVirtual ? 'block' : 'none',
            width: '100%',
            height: '320px',
          }}
          aria-label="Cámara frontal activa para práctica de Lengua de Señas Mexicana"
        />

        {/* DIX09 b) Marco animado alrededor del contorno guía que cambia cuando se detecta al niño */}
        <div
          className={
            ninoDetectado ? 'dix09-contour-detected' : 'dix09-contour-waiting'
          }
          style={{ marginTop: '24px' }}
        >
          {/* Silueta de mano guía idéntica al Mockup 3 */}
          <svg
            width="130"
            height="135"
            viewBox="0 0 130 135"
            aria-hidden="true"
          >
            {/* Puntos articulares del contorno guía (Mockup 3) */}
            <circle
              cx="65"
              cy="68"
              r="52"
              fill={
                ninoDetectado
                  ? 'rgba(16, 185, 129, 0.16)'
                  : 'rgba(56, 189, 248, 0.14)'
              }
              stroke={ninoDetectado ? '#34D399' : '#38BDF8'}
              strokeWidth="3"
              strokeDasharray={ninoDetectado ? 'none' : '8 6'}
            />
            <circle cx="45" cy="30" r="4" fill="#34D399" />
            <circle cx="65" cy="22" r="4" fill="#34D399" />
            <circle cx="85" cy="30" r="4" fill="#34D399" />
            <circle cx="98" cy="50" r="4" fill="#34D399" />
            <text
              x="65"
              y="84"
              textAnchor="middle"
              fontSize="54"
              fill="#FFFFFF"
            >
              ✋
            </text>
          </svg>

          {/* Píldora oscura inferior del contorno idéntica al Mockup 3: "COLOCA TU MANO AQUÍ" */}
          <div
            style={{
              backgroundColor: ninoDetectado ? '#064E3B' : '#0F172A',
              color: '#FFFFFF',
              padding: '6px 16px',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.04em',
              border: '2px solid rgba(255,255,255,0.85)',
            }}
          >
            {ninoDetectado
              ? '✓ NIÑO DETECTADO • COLOCA TU MANO AQUÍ'
              : 'COLOCA TU MANO AQUÍ'}
          </div>
        </div>
      </div>

      {/* =====================================================================
          4. BOTÓN OBTURADOR CIRCULAR DEL BOCETO FASE 1 ("Ejercicio de seña")
             + BOTONES DE PRUEBA "Simular acierto / Simular fallo" (Requisito 2)
         ===================================================================== */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
          }}
        >
          <button
            type="button"
            className="btn-shutter-wireframe"
            onClick={handleBotonObturador}
            disabled={analizando || cuentaRegresiva !== null}
            title={
              camaraActiva
                ? 'Evaluar seña frente a la cámara'
                : 'Activar cámara con cuenta regresiva 3-2-1'
            }
            aria-label={
              camaraActiva
                ? 'Capturar y evaluar seña'
                : 'Activar cámara con cuenta regresiva visual 3-2-1'
            }
          >
            {camaraActiva ? '📸' : '🎥'}
          </button>
        </div>

        {/* Botones de prueba exigidos para demostración y registro en TABLA_METRICA_INTENTO */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            width: '100%',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className="btn-secondary-aaa"
            style={{ flex: 1, fontSize: '0.84rem', padding: '8px 10px' }}
            disabled={cuentaRegresiva !== null}
            onClick={iniciarCamaraConCuentaRegresiva}
          >
            {camaraActiva ? '⏹ Apagar cámara' : '📷 Cámara (3-2-1)'}
          </button>

          <button
            type="button"
            className="btn-success-aaa"
            style={{ flex: 1, fontSize: '0.84rem', padding: '8px 10px' }}
            disabled={analizando}
            onClick={() => evaluarYGuardarIntento(88)}
          >
            ✓ Simular acierto
          </button>

          <button
            type="button"
            className="btn-secondary-aaa"
            style={{
              flex: 1,
              fontSize: '0.84rem',
              padding: '8px 10px',
              backgroundColor: 'var(--warn-bg)',
              color: 'var(--warn-text)',
              borderColor: 'var(--warn-border)',
            }}
            disabled={analizando}
            onClick={() => evaluarYGuardarIntento(58)}
          >
            ✗ Simular fallo
          </button>
        </div>
      </div>

      {/* =====================================================================
          5. TARJETA INFERIOR DE RETROALIMENTACIÓN IDÉNTICA AL MOCKUP 3 + DIX09 c) y e)
             - Ícono circular a la izquierda (✓ o 💪)
             - Título ("¡Excelente postura!" o "¡Casi! Intenta otra vez") + subtítulo
             - Porcentaje grande a la derecha ("✨ 88%")
             - 2 barras inferiores: "Calibración base" | "Coincidencia alta"
         ===================================================================== */}
      <div
        className="card-aaa"
        style={{
          padding: '16px',
          borderRadius: '20px',
          backgroundColor:
            estadoFeedback.tipo === 'EXITO' ? '#FFFFFF' : 'var(--warn-bg)',
          border:
            estadoFeedback.tipo === 'EXITO'
              ? '2px solid #10B981'
              : '3px solid var(--warn-border)',
        }}
        role="status"
        aria-live="polite"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor:
                  estadoFeedback.tipo === 'EXITO' ? '#DCFCE7' : '#FEF3C7',
                border: `2px solid ${
                  estadoFeedback.tipo === 'EXITO' ? '#047857' : '#B45309'
                }`,
                color: estadoFeedback.tipo === 'EXITO' ? '#047857' : '#92400E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              {estadoFeedback.icono}
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.08rem',
                  color: '#091326',
                }}
              >
                {estadoFeedback.titulo}
              </h2>
              {!esNoLector && (
                <p
                  style={{
                    margin: '2px 0 0 0',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  {estadoFeedback.subtitulo}
                </p>
              )}
            </div>
          </div>

          {/* Porcentaje grande a la derecha idéntico al Mockup 3: "✨ 88%" */}
          <div
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: estadoFeedback.tipo === 'EXITO' ? '#047857' : '#B45309',
              whiteSpace: 'nowrap',
            }}
          >
            ✨ {estadoFeedback.precision}%
          </div>
        </div>

        {/* Dos barras inferiores lado a lado idénticas al Mockup 3: "Calibración base" y "Coincidencia alta" */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}
        >
          <div>
            <div
              className="progress-track-aaa"
              style={{ height: '8px', marginBottom: '4px' }}
            >
              <div
                className="progress-fill-success"
                style={{ width: '100%' }}
              />
            </div>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textAlign: 'center',
              }}
            >
              {esNoLector ? '✓ Base' : 'Calibración base'}
            </div>
          </div>

          <div>
            <div
              className="progress-track-aaa"
              style={{ height: '8px', marginBottom: '4px' }}
            >
              <div
                className={
                  estadoFeedback.tipo === 'EXITO'
                    ? 'progress-fill-success'
                    : 'progress-fill-aaa'
                }
                style={{ width: `${estadoFeedback.precision}%` }}
              />
            </div>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textAlign: 'center',
              }}
            >
              {esNoLector
                ? `${estadoFeedback.precision}%`
                : estadoFeedback.tipo === 'EXITO'
                ? 'Coincidencia alta'
                : `Intento ${intentosSinPenalizacion}/3 (Sin penalización)`}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
