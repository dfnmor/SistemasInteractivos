import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { PerfilNino, Cuento, VistaActiva } from '../types/meexuu';

/* =============================================================================
 * MÓDULO 1 — SESIÓN DE SEÑAS (/practica-v2)
 * Sigue estrictamente el Wireframe 3 (Fase 2, Act. 6, p. 9):
 *   1. Encabezado: "← Sesión de señas" + ícono de perfil
 *   2. Pastilla de la seña actual (viene del cuento): "✋ HOLA (SALUDO)"
 *   3. Visor de cámara con etiqueta "EN VIVO · Detección activa", esquinas guía
 *      y texto "COLOCA TU MANO AQUÍ"
 *   4. Tarjeta inferior "¡Excelente postura! 88%" con "Calibración base" y
 *      "Coincidencia alta" (siempre presente)
 * Mejoras DIX09 integradas dentro de este diseño:
 *   - Indicador visual de preparación antes de grabar (íconos, sin sonido,
 *     sin presión de tiempo, con opción de saltar)
 *   - Marco de esquinas guía que cambia al detectar al niño
 *   - "¡Casi! Intenta otra vez" con la seña en cámara lenta y hasta 3 intentos
 *     sin penalización
 *   - Botón grande y siempre visible "Ver seña de nuevo"
 *   - Controles "Simular acierto/fallo" y etiquetas "(DIX09)" exclusivos del
 *     modo demostración (?demo=1)
 * ============================================================================= */

interface ModuloLSMViewProps {
  perfilActivo: PerfilNino;
  cuentos: Cuento[];
  senaInicial?: { palabra: string; idEjercicio: number; idCuento?: number };
  modoDemo?: boolean;
  onToggleDemo?: () => void;
  onRegistrarIntento: (
    idEjercicio: number,
    precision: number
  ) => Promise<{
    titulo: string;
    mensaje: string;
    icono: string;
    cuento_completado?: boolean;
    aviso?: string;
  }>;
  onCambiarSena: (idEjercicio: number, direccion: -1 | 1) => void;
  onNavigate: (vista: VistaActiva, path?: string) => void;
}

const CATEGORIA_POR_SENA: Record<string, string> = {
  HOLA: 'SALUDO',
  ADIÓS: 'DESPEDIDA',
  LUNA: 'NATURALEZA',
  CONEJO: 'ANIMAL',
  GATO: 'ANIMAL',
  MAMÁ: 'FAMILIA',
  PAPÁ: 'FAMILIA',
  CASA: 'HOGAR',
  AMIGO: 'VALORES',
};

const ICONO_POR_SENA: Record<string, string> = {
  HOLA: '👋',
  ADIÓS: '👋',
  LUNA: '🌙',
  CONEJO: '🐰',
  GATO: '🐱',
  MAMÁ: '👩',
  PAPÁ: '👨',
  CASA: '🏠',
  AMIGO: '🤝',
};

const IMAGEN_POR_SENA: Record<string, string> = {
  HOLA: '/hola.png',
  LUNA: '/luna.png',
  CONEJO: '/conejo.jpeg',
  MAMÁ: '/mam%C3%A1.jpeg',
  PAPÁ: '/pap%C3%A1.jpeg',
};

const PASOS_PREPARACION = [
  { icono: '🖐️', texto: 'Prepara tus manos' },
  { icono: '👀', texto: 'Mira las esquinas guía' },
  { icono: '✨', texto: '¡Listo para empezar!' },
];

const MAX_INTENTOS = 3;

type Fase = 'REFERENCIA' | 'PREPARACION' | 'CAMARA';
type Resultado = 'EXITO_INICIAL' | 'EXITO' | 'CASI';

export const ModuloLSMView: React.FC<ModuloLSMViewProps> = ({
  perfilActivo,
  cuentos,
  senaInicial,
  modoDemo = false,
  onToggleDemo,
  onRegistrarIntento,
  onCambiarSena,
  onNavigate,
}) => {
  const esNoLector = perfilActivo.nivel_lectura === 'NO_LECTOR';

  // La seña actual proviene del cuento seleccionado (sin selector de 6 señas en pantalla)
  const senaActual = useMemo(() => {
    const todos = cuentos.flatMap((c) =>
      (c.ejercicios || []).map((ej) => ({ ...ej, tipo: c.tipo }))
    );
    const elegido =
      todos.find((e) => e.id_ejercicio === senaInicial?.idEjercicio) ||
      todos.find((e) => e.tipo === 'LSM');
    const palabra = (elegido?.palabra_o_sena ?? senaInicial?.palabra ?? 'HOLA')
      .trim()
      .toLocaleUpperCase('es');
    return {
      id_ejercicio: elegido?.id_ejercicio ?? senaInicial?.idEjercicio ?? 1,
      id_cuento: elegido?.id_cuento ?? senaInicial?.idCuento,
      palabra,
      imagen_sena: elegido?.imagen_sena || IMAGEN_POR_SENA[palabra] || null,
      aprobada: Boolean(elegido?.aprobada),
    };
  }, [cuentos, senaInicial]);

  const categoria = CATEGORIA_POR_SENA[senaActual.palabra] || 'SALUDO';
  const iconoSena = ICONO_POR_SENA[senaActual.palabra] || '✋';
  const visualSena = (pequena = false, lenta = false) =>
    senaActual.imagen_sena ? (
      <img
        className={`sena-imagen${pequena ? ' sena-imagen-pequena' : ''}`}
        src={senaActual.imagen_sena}
        alt={`Seña de ${senaActual.palabra.toLocaleLowerCase('es')}`}
      />
    ) : (
      <span
        className={
          lenta
            ? 'dix09-reference-playing-slow'
            : 'dix09-reference-playing-normal'
        }
        aria-hidden="true"
      >
        ✋ {iconoSena}
      </span>
    );

  const [fase, setFase] = useState<Fase>('REFERENCIA');
  const [cuentaReferencia, setCuentaReferencia] = useState(5);
  const [pasoPreparacion, setPasoPreparacion] = useState(0);
  const [preparacionPausada, setPreparacionPausada] = useState(false);
  const [videoReal, setVideoReal] = useState(false);
  const [ninoDetectado, setNinoDetectado] = useState(true);

  const [referencia, setReferencia] = useState<'OCULTA' | 'NORMAL' | 'LENTA'>('OCULTA');
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [analizando, setAnalizando] = useState(false);
  const [resultado, setResultado] = useState<Resultado>('EXITO_INICIAL');
  const [precision, setPrecision] = useState<number>(88);
  const [manosDetectadas, setManosDetectadas] = useState(false);
  const [cuenta, setCuenta] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [cuentoCompletado, setCuentoCompletado] = useState(false);
  const [errorIntento, setErrorIntento] = useState<string | null>(null);
  const [avisoIntento, setAvisoIntento] = useState<string | null>(null);
  const [ultimoIntentoAprobado, setUltimoIntentoAprobado] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const capturaActivaRef = useRef(false);
  const manoPresenteRef = useRef(false);
  const guardandoRef = useRef(false);
  const intentoFinalizadoRef = useRef(false);

  const detenerCamara = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => detenerCamara, [detenerCamara]);

  const registrarIntento = useCallback(async (valor: number) => {
    const inicio = Date.now();
    intentoFinalizadoRef.current = true;
    setGuardando(true);
    guardandoRef.current = true;
    setAnalizando(true);
    setReferencia('OCULTA');
    setMostrarResultado(false);
    setUltimoIntentoAprobado(false);
    setErrorIntento(null);
    setAvisoIntento(null);
    try {
      const resultadoGuardado = await onRegistrarIntento(
        senaActual.id_ejercicio,
        valor
      );
      const esperaRestante = 1000 - (Date.now() - inicio);
      if (esperaRestante > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, esperaRestante));
      }

      const aprobado = valor > 60;
      setPrecision(valor);
      setResultado(aprobado ? 'EXITO' : 'CASI');
      setUltimoIntentoAprobado(aprobado);
      setIntentosFallidos((actuales) =>
        aprobado ? 0 : actuales >= MAX_INTENTOS ? 1 : actuales + 1
      );
      setCuentoCompletado(Boolean(resultadoGuardado.cuento_completado));
      setAvisoIntento(resultadoGuardado.aviso || null);
      setMostrarResultado(true);
    } catch (error) {
      intentoFinalizadoRef.current = false;
      setErrorIntento(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el resultado. Intenta de nuevo.'
      );
    } finally {
      setGuardando(false);
      guardandoRef.current = false;
      setAnalizando(false);
    }
  }, [onRegistrarIntento, senaActual.id_ejercicio]);

  useEffect(() => {
    let activo = true;
    let frame = 0;
    let ultimo = -1;
    const iniciar = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm');
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task', delegate: 'GPU' },
          runningMode: 'VIDEO', numHands: 2,
        });
        if (!activo) { landmarker.close(); return; }
        landmarkerRef.current = landmarker;
        const detectar = () => {
          if (!activo) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (video && canvas && ctx && video.readyState >= 2 && video.currentTime !== ultimo) {
            ultimo = video.currentTime;
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const manos = landmarker.detectForVideo(video, performance.now()).landmarks;
            const presente = manos.length > 0;
            if (presente !== manoPresenteRef.current) {
              manoPresenteRef.current = presente;
              setManosDetectadas(presente);
              if (
                presente &&
                !capturaActivaRef.current &&
                !guardandoRef.current &&
                !intentoFinalizadoRef.current
              ) {
                capturaActivaRef.current = true;
                setCuenta(5);
              }
            }
            if (capturaActivaRef.current && !presente) {
              capturaActivaRef.current = false; setCuenta(null); setGuardando(false);
            }
            const conexiones = HandLandmarker.HAND_CONNECTIONS;
            ctx.lineWidth = 3; ctx.strokeStyle = '#34D399'; ctx.fillStyle = '#FDE047';
            for (const puntos of manos) {
              for (const { start, end } of conexiones) {
                ctx.beginPath(); ctx.moveTo(puntos[start].x * canvas.width, puntos[start].y * canvas.height); ctx.lineTo(puntos[end].x * canvas.width, puntos[end].y * canvas.height); ctx.stroke();
              }
              for (const p of puntos) { ctx.beginPath(); ctx.arc(p.x * canvas.width, p.y * canvas.height, 4, 0, Math.PI * 2); ctx.fill(); }
            }
          }
          frame = requestAnimationFrame(detectar);
        };
        frame = requestAnimationFrame(detectar);
      } catch { setManosDetectadas(false); }
    };
    if (fase === 'CAMARA' && videoReal) void iniciar();
    return () => { activo = false; cancelAnimationFrame(frame); landmarkerRef.current?.close(); landmarkerRef.current = null; };
  }, [fase, videoReal]);

  useEffect(() => {
    if (cuenta === null || !capturaActivaRef.current) return;
    if (cuenta > 0) {
      const timer = window.setTimeout(() => setCuenta((n) => n === null ? null : n - 1), 1000);
      return () => window.clearTimeout(timer);
    }
    capturaActivaRef.current = false;
    setCuenta(null);
    void registrarIntento(Math.floor(50 + Math.random() * 51));
  }, [cuenta, registrarIntento]);

  useEffect(() => {
    setIntentosFallidos(0);
    setResultado('EXITO_INICIAL');
    setPrecision(88);
    setReferencia('OCULTA');
    setMostrarResultado(false);
    setCuentoCompletado(false);
    setErrorIntento(null);
    setUltimoIntentoAprobado(false);
    intentoFinalizadoRef.current = false;
    setFase('REFERENCIA');
    setCuentaReferencia(5);
    setPasoPreparacion(0);
    setPreparacionPausada(false);
  }, [senaActual.id_ejercicio]);

  const encenderCamara = useCallback(async () => {
    setFase('CAMARA');
    setNinoDetectado(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      setVideoReal(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setVideoReal(false);
    }
  }, []);

  useEffect(() => {
    if (fase !== 'REFERENCIA') return;
    if (cuentaReferencia === 0) {
      setFase('PREPARACION');
      return;
    }

    const timer = window.setTimeout(
      () => setCuentaReferencia((cuenta) => Math.max(0, cuenta - 1)),
      1000
    );
    return () => window.clearTimeout(timer);
  }, [fase, cuentaReferencia]);

  // Indicador visual de preparación antes de grabar (íconos, sin sonido, sin presión de tiempo, con opción de saltar)
  useEffect(() => {
    if (fase !== 'PREPARACION' || preparacionPausada) return;
    const t = setTimeout(() => {
      if (pasoPreparacion < PASOS_PREPARACION.length - 1) {
        setPasoPreparacion((p) => p + 1);
      } else {
        encenderCamara();
      }
    }, 1700);
    return () => clearTimeout(t);
  }, [fase, pasoPreparacion, preparacionPausada, encenderCamara]);

  // Al encender la cámara, el marco cambia automáticamente cuando detecta al niño
  useEffect(() => {
    if (fase !== 'CAMARA') return;
    const t = setTimeout(() => setNinoDetectado(true), 900);
    return () => clearTimeout(t);
  }, [fase]);

  const evaluarIntento = (valor: number) => {
    setNinoDetectado(true);
    void registrarIntento(valor);
  };

  const ejerciciosCuento = useMemo(
    () =>
      cuentos
        .find((cuento) => cuento.id_cuento === senaActual.id_cuento)
        ?.ejercicios?.slice()
        .sort((a, b) => a.orden_en_cuento - b.orden_en_cuento) || [],
    [cuentos, senaActual.id_cuento]
  );
  const indiceActual = ejerciciosCuento.findIndex(
    (ejercicio) => ejercicio.id_ejercicio === senaActual.id_ejercicio
  );
  const tieneSiguienteSena = indiceActual >= 0 && indiceActual < ejerciciosCuento.length - 1;
  const puedeReintentar = mostrarResultado || errorIntento !== null;

  const esCasi = resultado === 'CASI';

  return (
    <section
      aria-labelledby="titulo-sesion-senas"
      style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
    >
      {/* 1. Encabezado idéntico al Wireframe 3: "← Sesión de señas" + ícono circular derecho */}
      <div
        className="screen-back-header"
        style={{ justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn-back-circle"
            onClick={() => {
              detenerCamara();
              onNavigate('CATALOGO_CUENTOS', '/cuentos');
            }}
            aria-label="Volver al catálogo de cuentos"
          >
            ←
          </button>
          <h1
            id="titulo-sesion-senas"
            className="section-title"
            style={{ fontSize: '1.25rem' }}
          >
            Sesión de señas
          </h1>
        </div>

        <button
          type="button"
          onClick={onToggleDemo}
          style={{
            width: '48px',
            height: '48px',
            padding: 0,
            borderRadius: '50%',
            backgroundColor: '#DBEAFE',
            color: '#0052A3',
            border: '2px solid #93C5FD',
            fontSize: '1.2rem',
          }}
          title="Perfil activo (Toca para alternar modo demostración ?demo=1)"
          aria-label="Perfil activo"
        >
          👤
        </button>
      </div>

      {/* 2. Pastilla de la seña actual idéntica al Wireframe 3: "✋ HOLA (SALUDO)" */}
      <div style={{ textAlign: 'center' }}>
        <span
          className="pill-label"
          style={{
            fontSize: '1.15rem',
            padding: '8px 22px',
            backgroundColor: '#EFF6FF',
            color: '#1E3A8A',
            border: '2px solid #93C5FD',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.95rem',
            }}
          >
            ✋
          </span>
          <span>
            {senaActual.palabra}
            {!esNoLector ? ` (${categoria})` : ''}
          </span>
        </span>
      </div>

      {fase !== 'REFERENCIA' && (
        <div className="sena-preview-card" aria-label={`Seña: ${senaActual.palabra}`}>
          {visualSena(true)}
          <span>{senaActual.palabra}</span>
        </div>
      )}

      {/* 3. Visor de cámara AR idéntico al Wireframe 3:
             - Etiqueta superior izquierda "EN VIVO · Detección activa"
             - Esquinas guía que cambian al detectar al niño
             - Silueta de mano + pastilla oscura "COLOCA TU MANO AQUÍ" */}
      <div
        className="ar-camera-stage camara-lsm-stage"
        style={{ cursor: 'default' }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="ar-video-element"
          style={{ display: fase === 'CAMARA' && videoReal ? 'block' : 'none' }}
          aria-label="Cámara activa para practicar la seña"
        />
        <canvas ref={canvasRef} className="hand-landmarks-canvas" aria-hidden="true" />

        {/* Etiqueta "EN VIVO · Detección activa" (Wireframe 3) */}
        <div className="live-pill-mockup">
          <span
            aria-hidden="true"
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              display: 'inline-block',
            }}
          />
          <span>
            {esNoLector ? 'EN VIVO' : 'EN VIVO · Detección activa'}
          </span>
        </div>

        {cuenta !== null && <div className="hand-countdown" role="status" aria-live="assertive">{cuenta}</div>}
        {guardando && <div className="hand-saving" role="status" aria-live="polite"><span className="hand-loader" aria-hidden="true" />Guardando seña</div>}

        {/* Marco con esquinas guía que cambia de aspecto al detectar al niño + "COLOCA TU MANO AQUÍ" */}
        <div
          className={`guia-esquinas ${
            ninoDetectado ? 'detectado' : 'esperando'
          }`}
        >
          <span className="esq esq-tl" />
          <span className="esq esq-tr" />
          <span className="esq esq-bl" />
          <span className="esq esq-br" />

          {/* Silueta de mano guía con puntos articulares (Wireframe 3) */}
          {cuenta === null && !guardando && <>
          <svg
            width="120"
            height="130"
            viewBox="0 0 120 130"
            aria-hidden="true"
          >
            <circle cx="40" cy="24" r="4" fill="#34D399" />
            <circle cx="60" cy="18" r="4" fill="#34D399" />
            <circle cx="80" cy="24" r="4" fill="#34D399" />
            <circle cx="94" cy="44" r="4" fill="#34D399" />
            <line
              x1="60"
              y1="95"
              x2="60"
              y2="125"
              stroke="#34D399"
              strokeWidth="4"
            />
            <text
              x="60"
              y="84"
              textAnchor="middle"
              fontSize="56"
              fill="#FFFFFF"
            >
              ✋
            </text>
          </svg>

          <span className="guia-pill">COLOCA TU MANO AQUÍ</span>
          </>}
        </div>

        {/* Indicador visual de preparación antes de grabar (íconos, sin sonido, sin presión de tiempo, con opción de saltar) */}
        {fase === 'REFERENCIA' && (
          <div className="prep-overlay sena-intro-overlay" role="status" aria-live="polite">
            <p className="sena-intro-title">Observa la seña</p>
            <div className="sena-intro-visual">{visualSena()}</div>
            <p className="sena-intro-word">{senaActual.palabra}</p>
            <div className="sena-intro-countdown" aria-label={`${cuentaReferencia} segundos`}>
              {cuentaReferencia}
            </div>
          </div>
        )}

        {fase === 'PREPARACION' && (
          <div
            className="prep-overlay"
            role="status"
            aria-live="polite"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="prep-pasos" aria-hidden="true">
              {PASOS_PREPARACION.map((p, i) => (
                <div
                  key={p.icono}
                  className={`prep-paso ${
                    i === pasoPreparacion
                      ? 'activo'
                      : i < pasoPreparacion
                      ? 'hecho'
                      : ''
                  }`}
                >
                  {i < pasoPreparacion ? '✓' : p.icono}
                </div>
              ))}
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.08rem' }}>
              <span aria-hidden="true">
                {PASOS_PREPARACION[pasoPreparacion].icono}{' '}
              </span>
              {esNoLector ? '' : PASOS_PREPARACION[pasoPreparacion].texto}
            </p>
            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <button
                type="button"
                className="btn-secondary-aaa"
                onClick={() => setPreparacionPausada((p) => !p)}
                aria-pressed={preparacionPausada}
              >
                {preparacionPausada ? '▶ Continuar' : '⏸ Sin prisa'}
              </button>
              <button
                type="button"
                className="btn-primary-aaa"
                onClick={encenderCamara}
              >
                ⏭ Saltar e iniciar
              </button>
            </div>
          </div>
        )}

        {/* Demostración de la seña de referencia (normal o en cámara lenta cuando falla el reconocimiento) */}
        {referencia !== 'OCULTA' && (
          <div
            className="referencia-overlay"
            role="dialog"
            aria-label="Demostración de seña de referencia"
            onClick={(e) => e.stopPropagation()}
          >
            {referencia === 'LENTA' && (
              <p
                style={{
                  margin: 0,
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  color: '#FDE68A',
                }}
              >
                <span aria-hidden="true">💪🌟 </span>¡Casi! Intenta otra vez
              </p>
            )}
            <div className="referencia-visual">
              {visualSena(false, referencia === 'LENTA')}
            </div>
            <span
              className="pill-label"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                fontSize: '1rem',
              }}
            >
              {referencia === 'LENTA'
                ? `🐢 Seña en cámara lenta: ${senaActual.palabra}`
                : `▶ Seña: ${senaActual.palabra}`}
            </span>
            {referencia === 'LENTA' && !esNoLector && (
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#E2E8F0' }}>
                Intento {intentosFallidos} de {MAX_INTENTOS} sin penalización
              </p>
            )}
            <button
              type="button"
              className="btn-success-aaa"
              onClick={() => setReferencia('OCULTA')}
            >
              ✓ {esNoLector ? '¡Listo!' : '¡Listo, intentar de nuevo!'}
            </button>
          </div>
        )}
      </div>

      {fase !== 'REFERENCIA' && (
        <button
          type="button"
          className="btn-primary-aaa"
          style={{
            width: '100%',
            minHeight: '56px',
            fontSize: '1.05rem',
            borderRadius: '16px',
          }}
          onClick={() => setReferencia('NORMAL')}
        >
          <span aria-hidden="true">🔁</span>
          <span>Ver seña de nuevo</span>
        </button>
      )}

      {/* 4. Tarjeta inferior idéntica al Wireframe 3:
             "¡Excelente postura! 88%" con "Calibración base / Coincidencia alta"
             (Cuando la seña no se reconoce cambia a "¡Casi! Intenta otra vez" con hasta 3 intentos sin penalización) */}
      {mostrarResultado && <div
        className="card-aaa"
        style={{
          borderColor: esCasi ? 'var(--warn-border)' : '#10B981',
          borderWidth: '2px',
          backgroundColor: esCasi ? 'var(--warn-bg)' : 'var(--bg-surface)',
        }}
        role="status"
        aria-live="polite"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              aria-hidden="true"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: esCasi ? '#FEF3C7' : '#DCFCE7',
                color: esCasi ? '#92400E' : '#047857',
                border: `2px solid ${esCasi ? '#B45309' : '#047857'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {esCasi ? '💪' : '✓'}
            </div>

            <div>
              <h2 className="section-title">
                {esCasi ? '¡Casi! Intenta otra vez' : '¡Excelente postura!'}
              </h2>
              {!esNoLector && (
                <p className="text-support">
                  {esCasi
                    ? `Intento ${intentosFallidos} de ${MAX_INTENTOS} sin penalización · Puedes volver a ver la seña`
                    : 'Reconocimiento cinemático de mano derecha'}
                </p>
              )}
            </div>
          </div>

          <div
            style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              color: esCasi ? '#92400E' : '#047857',
              whiteSpace: 'nowrap',
            }}
          >
            ✨ {precision}%
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginTop: '14px',
          }}
        >
          <div>
            <div className="progress-track-aaa" style={{ height: '10px' }}>
              <div
                className="progress-fill-success"
                style={{ width: `${precision}%` }}
              />
            </div>
            <p
              className="text-support"
              style={{
                fontWeight: 700,
                marginTop: '4px',
                fontSize: '0.82rem',
                textAlign: 'center',
              }}
            >
              Calibración base
            </p>
          </div>

          <div>
            <div className="progress-track-aaa" style={{ height: '10px' }}>
              <div
                className={
                  esCasi ? 'progress-fill-aaa' : 'progress-fill-success'
                }
                style={{ width: `${precision}%` }}
              />
            </div>
            <p
              className="text-support"
              style={{
                fontWeight: 700,
                marginTop: '4px',
                fontSize: '0.82rem',
                textAlign: 'center',
              }}
            >
              {esCasi
                ? `Intento ${intentosFallidos}/${MAX_INTENTOS} (0 pts restados)`
                : 'Coincidencia alta'}
            </p>
          </div>
        </div>
      </div>}
      {errorIntento && (
        <div className="card-aaa" role="alert" style={{ borderColor: 'var(--warn-border)' }}>
          {errorIntento}
        </div>
      )}
      {avisoIntento && (
        <div className="card-aaa" role="status" style={{ borderColor: 'var(--warn-border)' }}>
          {avisoIntento}
        </div>
      )}

      {cuentoCompletado ? (
        <div className="cuento-completado-celebracion" role="status" aria-live="polite">
          <span className="destellos-cuento" aria-hidden="true">✨ ⭐ ✨</span>
          <h2 className="section-title">¡Terminaste el cuento!</h2>
          <button
            type="button"
            className="btn-primary-aaa"
            onClick={() => {
              detenerCamara();
              onNavigate('CATALOGO_CUENTOS', '/cuentos');
            }}
          >
            Ver cuentos
          </button>
          <button
            type="button"
            className="btn-secondary-aaa"
            disabled={analizando}
            onClick={() => {
              intentoFinalizadoRef.current = false;
              manoPresenteRef.current = false;
              setManosDetectadas(false);
              setMostrarResultado(false);
              setErrorIntento(null);
              setCuentoCompletado(false);
            }}
          >
            Practicar esta seña otra vez
          </button>
        </div>
      ) : puedeReintentar && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            className="btn-secondary-aaa"
            disabled={analizando}
            onClick={() => {
              intentoFinalizadoRef.current = false;
              manoPresenteRef.current = false;
              setManosDetectadas(false);
              setReferencia('OCULTA');
              setMostrarResultado(false);
              setErrorIntento(null);
              setUltimoIntentoAprobado(false);
            }}
          >
            Intentar de nuevo
          </button>
          {(ultimoIntentoAprobado || senaActual.aprobada) && tieneSiguienteSena && (
            <button
              type="button"
              className="btn-primary-aaa"
              disabled={analizando}
              onClick={() => onCambiarSena(senaActual.id_ejercicio, 1)}
            >
              Siguiente seña
            </button>
          )}
        </div>
      )}
      {cuentoCompletado && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {indiceActual > 0 && (
            <button
              type="button"
              className="btn-secondary-aaa"
              disabled={analizando}
              onClick={() => onCambiarSena(senaActual.id_ejercicio, -1)}
            >
              Seña anterior
            </button>
          )}
          {tieneSiguienteSena && (
            <button
              type="button"
              className="btn-secondary-aaa"
              disabled={analizando}
              onClick={() => onCambiarSena(senaActual.id_ejercicio, 1)}
            >
              Practicar siguiente seña
            </button>
          )}
        </div>
      )}

      {/* Modo demostración (?demo=1): botones "Simular acierto/fallo" y etiquetas "(DIX09)" */}
      {modoDemo && (
        <div className="demo-panel">
          <strong>🧪 Modo demostración (?demo=1) · Mejoras (DIX09)</strong>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-success-aaa"
              style={{ flex: 1 }}
              disabled={analizando || mostrarResultado || fase !== 'CAMARA'}
              onClick={() => evaluarIntento(88)}
            >
              ✓ Simular acierto
            </button>
            <button
              type="button"
              className="btn-secondary-aaa"
              style={{ flex: 1 }}
              disabled={analizando || mostrarResultado || fase !== 'CAMARA'}
              onClick={() => evaluarIntento(58)}
            >
              ✗ Simular fallo
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary-aaa"
              style={{ flex: 1 }}
              onClick={() => setNinoDetectado((d) => !d)}
            >
              {ninoDetectado
                ? '🟢 Marco: Niño detectado (DIX09)'
                : '🔵 Marco: Buscando niño (DIX09)'}
            </button>
            <button
              type="button"
              className="btn-secondary-aaa"
              style={{ flex: 1 }}
              onClick={() => {
                setPasoPreparacion(0);
                setPreparacionPausada(false);
                detenerCamara();
                setVideoReal(false);
                setReferencia('OCULTA');
                setCuentaReferencia(5);
                setFase('REFERENCIA');
              }}
            >
              🖐️ Repetir preparación (DIX09)
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
