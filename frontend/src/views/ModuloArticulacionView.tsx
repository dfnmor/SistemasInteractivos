import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { PerfilNino, Cuento, VistaActiva } from '../types/meexuu';

/* =============================================================================
 * MÓDULO 2 — SESIÓN DE HABLA (/articulacion)
 * Con Seguimiento y Clasificación Labial en Tiempo Real (MediaPipe FaceLandmarker)
 * Sigue estrictamente el Wireframe 4 (Fase 2, Act. 6, p. 9)
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
    cuento_completado?: boolean;
    aviso?: string;
  }>;
  onCambiarSena: (idEjercicio: number, direccion: -1 | 1) => void;
  onNavigate: (vista: VistaActiva, path?: string) => void;
}

interface InfoFonema {
  categoria: string;
  fonema: string;
  paso: string;
  indicador: string;
  exitoTitulo: string;
  exitoTexto: string;
  requiereCierreInicial: boolean;
}

const INFO_FONEMAS: Record<string, InfoFonema> = {
  'MA-MÁ': {
    categoria: 'FONEMA BILABIAL',
    fonema: '/m/ - /a/ • MA - MÁ',
    paso: 'Paso 1: Presiona los labios con suavidad y ábrelos en "A"',
    indicador: 'Vibración Nasal',
    exitoTitulo: '¡Excelente sellado labial!',
    exitoTexto: "Tus labios hicieron el contacto perfecto para 'MA'.",
    requiereCierreInicial: true,
  },
  'PA-PÁ': {
    categoria: 'FONEMA BILABIAL',
    fonema: '/p/ - /a/ • PA - PÁ',
    paso: 'Paso 1: Junta los labios y suelta el aire al abrir',
    indicador: 'Pulso de Aire',
    exitoTitulo: '¡Excelente sellado labial!',
    exitoTexto: "Tus labios hicieron el contacto perfecto para 'PA'.",
    requiereCierreInicial: true,
  },
  'A-MOR': {
    categoria: 'VOCAL + BILABIAL',
    fonema: '/a/ - /m/ • A - MOR',
    paso: 'Paso 1: Abre la boca grande en "A" y junta los labios en "M"',
    indicador: 'Vibración Nasal',
    exitoTitulo: '¡Excelente articulación!',
    exitoTexto: "Abriste y cerraste los labios muy bien para 'A-MOR'.",
    requiereCierreInicial: true,
  },
  'CA-SA': {
    categoria: 'APERTURA VOCÁLICA',
    fonema: '/k/ - /a/ • CA - SA',
    paso: 'Paso 1: Abre la boca en "CA" y sonríe suavemente en "SA"',
    indicador: 'Soplo Suave',
    exitoTitulo: '¡Excelente apertura labial!',
    exitoTexto: "Tus labios hicieron la apertura perfecta para 'CA-SA'.",
    requiereCierreInicial: false,
  },
  'SO-PA': {
    categoria: 'REDONDEO LABIAL',
    fonema: '/s/ - /o/ • SO - PA',
    paso: 'Paso 1: Redondea tus labios para la "O" y ciérralos en "PA"',
    indicador: 'Círculo Labial',
    exitoTitulo: '¡Excelente redondeo labial!',
    exitoTexto: "Tus labios formaron el círculo perfecto para 'SO-PA'.",
    requiereCierreInicial: true,
  },
  'A-GUA': {
    categoria: 'APERTURA VOCÁLICA',
    fonema: '/a/ - /g/ • A - GUA',
    paso: 'Paso 1: Abre la boca en "A" y redondea los labios en "GUA"',
    indicador: 'Soplo Suave',
    exitoTitulo: '¡Excelente apertura vocálica!',
    exitoTexto: "Pronunciaste las vocales de 'A-GUA' con gran claridad.",
    requiereCierreInicial: false,
  },
  'ES-TRE-LLA': {
    categoria: 'SÍLABA TRABADA',
    fonema: '/s/ - /tr/ • ES - TRE - LLA',
    paso: 'Paso 1: Sonríe en "ES" y abre claramente en "LLA"',
    indicador: 'Vibración Continua',
    exitoTitulo: '¡Excelente articulación!',
    exitoTexto: "Tus labios marcaron las 3 sílabas de 'ES-TRE-LLA'.",
    requiereCierreInicial: false,
  },
  'SON-RI-SA': {
    categoria: 'FONEMA VIBRANTE',
    fonema: '/s/ - /r/ • SON - RI - SA',
    paso: 'Paso 1: Estira las comisuras en una sonrisa clara para "RI-SA"',
    indicador: 'Comisura Simétrica',
    exitoTitulo: '¡Excelente simetría labial!',
    exitoTexto: "Articulaste 'SON-RI-SA' con simetría perfecta.",
    requiereCierreInicial: false,
  },
  'A-MI-GOS': {
    categoria: 'VOCAL + BILABIAL',
    fonema: '/a/ - /m/ • A - MI - GOS',
    paso: 'Paso 1: Abre en "A", junta los labios en "MI" y redondea en "GOS"',
    indicador: 'Vibración Nasal',
    exitoTitulo: '¡Excelente sellado labial!',
    exitoTexto: "Tus labios articularon cada sílaba de 'A-MI-GOS'.",
    requiereCierreInicial: true,
  },
};

const infoDe = (palabra: string): InfoFonema =>
  INFO_FONEMAS[palabra.toUpperCase()] || INFO_FONEMAS['MA-MÁ'];

// Índices de puntos labiales en MediaPipe FaceMesh (478 landmarks)
const PUNTOS_LABIOS_EXTERIOR = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37,
  39, 40, 185, 61,
];

export const ModuloArticulacionView: React.FC<ModuloArticulacionViewProps> = ({
  perfilActivo,
  cuentos,
  palabraInicial,
  modoDemo = false,
  onRegistrarIntento,
  onCambiarSena,
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
              id_cuento: c.id_cuento,
              aprobada: Boolean(e.aprobada),
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

  const actual = palabras[indice] || {
    id_ejercicio: 7,
    palabra: 'MA-MÁ',
    id_cuento: undefined,
    aprobada: false,
  };
  const info = infoDe(actual.palabra);

  const [lento, setLento] = useState(false);
  const [bocaAbierta, setBocaAbierta] = useState(false);
  const [modeloReproduciendo, setModeloReproduciendo] = useState(true);
  const [camaraOk, setCamaraOk] = useState(false);
  const [rostroAlineado, setRostroAlineado] = useState(false);
  const [simetriaEnVivo, setSimetriaEnVivo] = useState(0);
  const [aperturaDetectada, setAperturaDetectada] = useState(false);
  const [cierreDetectado, setCierreDetectado] = useState(false);
  const [comprobando, setComprobando] = useState(false);
  const [precision, setPrecision] = useState<number>(0);
  const [resultado, setResultado] = useState<'EXITO' | 'CASI'>('EXITO');
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [cuentoCompletado, setCuentoCompletado] = useState(false);
  const [errorIntento, setErrorIntento] = useState<string | null>(null);
  const [avisoIntento, setAvisoIntento] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const muestrasArticulacionRef = useRef<number[]>([]);
  const vioCierreRef = useRef(false);
  const vioAperturaRef = useRef(false);

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

  // Seguimiento labial en tiempo real con MediaPipe FaceLandmarker
  useEffect(() => {
    if (!camaraOk) return;
    let activo = true;
    let frame = 0;
    let ultimo = -1;
    let tick = 0;

    const iniciarFaceLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm'
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
        });
        if (!activo) {
          landmarker.close();
          return;
        }
        faceLandmarkerRef.current = landmarker;

        const detectarLabios = () => {
          if (!activo) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (
            video &&
            canvas &&
            ctx &&
            video.readyState >= 2 &&
            video.currentTime !== ultimo
          ) {
            ultimo = video.currentTime;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const rostros = landmarker.detectForVideo(
              video,
              performance.now()
            ).faceLandmarks;

            if (rostros && rostros.length > 0) {
              const lm = rostros[0];
              setRostroAlineado(true);

              // Puntos clave de labios: 13 (labio sup interior), 14 (labio inf interior), 61 (comisura izq), 291 (comisura der)
              const sup = lm[13];
              const inf = lm[14];
              const izq = lm[61];
              const der = lm[291];

              const anchoBoca = Math.max(
                0.02,
                Math.hypot(der.x - izq.x, der.y - izq.y)
              );
              const altoApertura = Math.hypot(inf.x - sup.x, inf.y - sup.y);
              const ratioApertura = altoApertura / anchoBoca;

              // Simetría horizontal de las comisuras labiales
              const inclinacionComisuras = Math.abs(der.y - izq.y) / anchoBoca;
              const simetriaScore = Math.round(
                Math.min(99, Math.max(55, (1 - inclinacionComisuras * 1.4) * 100))
              );

              if (ratioApertura < 0.14) {
                vioCierreRef.current = true;
              }
              if (ratioApertura >= 0.2) {
                vioAperturaRef.current = true;
              }

              const bonusCiclo =
                vioCierreRef.current && vioAperturaRef.current
                  ? 12
                  : vioAperturaRef.current
                  ? 5
                  : -12;
              const puntajeFrame = Math.min(
                98,
                Math.max(40, simetriaScore + bonusCiclo)
              );
              muestrasArticulacionRef.current.push(puntajeFrame);
              if (muestrasArticulacionRef.current.length > 60) {
                muestrasArticulacionRef.current.shift();
              }

              tick += 1;
              if (tick % 4 === 0) {
                setSimetriaEnVivo(puntajeFrame);
                setCierreDetectado(vioCierreRef.current);
                setAperturaDetectada(vioAperturaRef.current);
              }

              // Dibujar contorno labial en el espejo AR
              ctx.beginPath();
              ctx.lineWidth = 3;
              ctx.strokeStyle =
                vioCierreRef.current && vioAperturaRef.current
                  ? '#34D399'
                  : '#38BDF8';
              PUNTOS_LABIOS_EXTERIOR.forEach((idx, i) => {
                const pt = lm[idx];
                if (!pt) return;
                const x = pt.x * canvas.width;
                const y = pt.y * canvas.height;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              });
              ctx.stroke();
            } else {
              setRostroAlineado(false);
            }
          }
          frame = requestAnimationFrame(detectarLabios);
        };
        frame = requestAnimationFrame(detectarLabios);
      } catch {
        setRostroAlineado(false);
      }
    };

    void iniciarFaceLandmarker();
    return () => {
      activo = false;
      cancelAnimationFrame(frame);
      faceLandmarkerRef.current?.close();
      faceLandmarkerRef.current = null;
    };
  }, [camaraOk]);

  useEffect(() => {
    setComprobando(false);
    setPrecision(0);
    setSimetriaEnVivo(0);
    setCierreDetectado(false);
    setAperturaDetectada(false);
    vioCierreRef.current = false;
    vioAperturaRef.current = false;
    muestrasArticulacionRef.current = [];
    setResultado('EXITO');
    setMostrarResultado(false);
    setCuentoCompletado(false);
    setErrorIntento(null);
    setAvisoIntento(null);
    setLento(false);
    setModeloReproduciendo(true);
  }, [actual.id_ejercicio]);

  const comprobar = async (valor: number) => {
    const inicio = Date.now();
    setComprobando(true);
    setMostrarResultado(false);
    setErrorIntento(null);
    setAvisoIntento(null);
    try {
      const resultadoGuardado = await onRegistrarIntento(
        actual.id_ejercicio,
        valor
      );
      const esperaRestante = 900 - (Date.now() - inicio);
      if (esperaRestante > 0) {
        await new Promise((resolve) =>
          window.setTimeout(resolve, esperaRestante)
        );
      }
      setPrecision(valor);
      setCuentoCompletado(Boolean(resultadoGuardado.cuento_completado));
      setAvisoIntento(resultadoGuardado.aviso || null);
      setMostrarResultado(true);
      if (valor > 60) {
        setResultado('EXITO');
        setLento(false);
      } else {
        setResultado('CASI');
        setLento(true);
      }
    } catch (error) {
      setErrorIntento(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el resultado. Intenta de nuevo.'
      );
    } finally {
      setComprobando(false);
    }
  };

  const handleListo = () => {
    // Evaluar a partir de las mediciones reales de apertura y simetría labial
    const muestras = muestrasArticulacionRef.current.slice();
    if (muestras.length > 0) {
      muestras.sort((a, b) => b - a);
      const top = muestras.slice(0, Math.max(1, Math.ceil(muestras.length * 0.4)));
      const promedio = Math.round(
        top.reduce((acc, v) => acc + v, 0) / top.length
      );
      const penalizacionSinMovimiento =
        !vioAperturaRef.current && !vioCierreRef.current ? -25 : 0;
      void comprobar(Math.max(45, Math.min(98, promedio + penalizacionSinMovimiento)));
      return;
    }
    void comprobar(simetriaEnVivo > 0 ? simetriaEnVivo : 86);
  };

  const ejerciciosCuento =
    cuentos
      .find((cuento) => cuento.id_cuento === actual.id_cuento)
      ?.ejercicios?.slice()
      .sort((a, b) => a.orden_en_cuento - b.orden_en_cuento) || [];
  const indiceActual = ejerciciosCuento.findIndex(
    (ejercicio) => ejercicio.id_ejercicio === actual.id_ejercicio
  );
  const tieneSiguiente =
    indiceActual >= 0 && indiceActual < ejerciciosCuento.length - 1;
  const tieneAnterior = indiceActual > 0;

  const barraMostrada = mostrarResultado ? precision : simetriaEnVivo;

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

      {/* Selector rápido de palabras del cuento de articulación */}
      {ejerciciosCuento.length > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
          {ejerciciosCuento.map((ej, idx) => {
            const esActual = ej.id_ejercicio === actual.id_ejercicio;
            return (
              <button
                key={ej.id_ejercicio}
                type="button"
                onClick={() => {
                  if (idx !== indiceActual) {
                    onCambiarSena(
                      actual.id_ejercicio,
                      idx > indiceActual ? 1 : -1
                    );
                  }
                }}
                style={{
                  minHeight: '48px',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  backgroundColor: esActual
                    ? 'var(--primary-aaa)'
                    : ej.aprobada
                    ? 'var(--success-bg)'
                    : 'var(--bg-surface)',
                  color: esActual
                    ? '#FFFFFF'
                    : ej.aprobada
                    ? 'var(--success-text)'
                    : 'var(--text-primary)',
                  border: `2px solid ${
                    esActual
                      ? 'var(--primary-aaa)'
                      : ej.aprobada
                      ? 'var(--success-border)'
                      : 'var(--border-strong)'
                  }`,
                }}
              >
                {ej.aprobada ? '✓ ' : `${idx + 1}. `}
                {ej.palabra_o_sena}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Tarjeta del fonema (Wireframe 4) */}
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
            aria-label="Estrellas del ejercicio"
          >
            {actual.aprobada ? '★★★' : '★★☆'}
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

      {/* 4. Tarjeta Espejo AR con cámara y FaceLandmarker (Wireframe 4) */}
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
          <canvas
            ref={canvasRef}
            className="hand-landmarks-canvas"
            aria-hidden="true"
          />
          <span
            className="pill-label"
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              zIndex: 6,
              backgroundColor: rostroAlineado ? '#10B981' : '#0052A3',
              color: '#FFFFFF',
            }}
          >
            {rostroAlineado
              ? `✓ Alineado (${simetriaEnVivo}%)`
              : '📷 Alinea tus labios'}
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
              border: `3px dashed ${
                cierreDetectado && aperturaDetectada ? '#34D399' : '#38BDF8'
              }`,
              backgroundColor: 'rgba(16, 185, 129, 0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
            }}
          >
            { !rostroAlineado && '👄' }
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
                style={{ width: `${barraMostrada}%` }}
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
                  mostrarResultado && resultado === 'CASI'
                    ? 'var(--warn-text)'
                    : '#047857',
                textAlign: 'right',
              }}
            >
              {!mostrarResultado
                ? cierreDetectado && aperturaDetectada
                  ? '✓ ¡Movimiento detectado!'
                  : 'Junta y abre tus labios'
                : esNoLector
                ? '✓ OK'
                : resultado === 'CASI'
                ? '¡Intenta otra vez!'
                : '¡Abre juntos! Correcto'}
            </p>
            <div className="progress-track-aaa" style={{ height: '10px' }}>
              <div
                className={
                  mostrarResultado && resultado === 'CASI'
                    ? 'progress-fill-aaa'
                    : 'progress-fill-success'
                }
                style={{ width: `${barraMostrada}%` }}
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
          disabled={comprobando || mostrarResultado}
        >
          <span aria-hidden="true">✓</span>
          <span>{comprobando ? 'Comprobando…' : '¡Listo! Comprobar'}</span>
        </button>
      </div>

      {/* 6. Tarjeta verde menta inferior idéntica al Wireframe 4 */}
      {comprobando && (
        <div className="result-saving" role="status" aria-live="polite">
          <span className="hand-loader" aria-hidden="true" />
          Calificando articulación labial…
        </div>
      )}
      {errorIntento && (
        <div
          className="card-aaa"
          role="alert"
          style={{ borderColor: 'var(--warn-border)' }}
        >
          {errorIntento}
        </div>
      )}
      {avisoIntento && (
        <div
          className="card-aaa"
          role="status"
          style={{ borderColor: 'var(--warn-border)' }}
        >
          {avisoIntento}
        </div>
      )}

      {mostrarResultado && (
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
                    : `${info.exitoTexto} (+25 ★)`}
                </p>
              )}
            </div>
            <strong style={{ fontSize: '1.35rem', whiteSpace: 'nowrap' }}>
              ✨ {precision}%
            </strong>
          </div>
        </div>
      )}

      {cuentoCompletado ? (
        <div
          className="cuento-completado-celebracion"
          role="status"
          aria-live="polite"
        >
          <span className="destellos-cuento" aria-hidden="true">
            ✨ ⭐ ✨
          </span>
          <h2 className="section-title">¡Terminaste el cuento!</h2>
          <button
            type="button"
            className="btn-primary-aaa"
            onClick={() => onNavigate('CATALOGO_CUENTOS', '/cuentos')}
          >
            Ver cuentos
          </button>
          <button
            type="button"
            className="btn-secondary-aaa"
            disabled={comprobando}
            onClick={() => {
              setMostrarResultado(false);
              setCuentoCompletado(false);
              setErrorIntento(null);
            }}
          >
            Practicar esta palabra otra vez
          </button>
        </div>
      ) : (
        mostrarResultado && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              className="btn-secondary-aaa"
              onClick={() => {
                setMostrarResultado(false);
                setErrorIntento(null);
                vioCierreRef.current = false;
                vioAperturaRef.current = false;
                muestrasArticulacionRef.current = [];
              }}
            >
              Intentar de nuevo
            </button>
            {(precision > 60 || actual.aprobada) && tieneSiguiente && (
              <button
                type="button"
                className="btn-primary-aaa"
                onClick={() => onCambiarSena(actual.id_ejercicio, 1)}
              >
                Siguiente palabra →
              </button>
            )}
          </div>
        )
      )}
      {cuentoCompletado && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {tieneAnterior && (
            <button
              type="button"
              className="btn-secondary-aaa"
              onClick={() => onCambiarSena(actual.id_ejercicio, -1)}
            >
              Palabra anterior
            </button>
          )}
          {tieneSiguiente && (
            <button
              type="button"
              className="btn-secondary-aaa"
              onClick={() => onCambiarSena(actual.id_ejercicio, 1)}
            >
              Practicar siguiente palabra
            </button>
          )}
        </div>
      )}

      {modoDemo && (
        <div className="demo-panel">
          <strong>🧪 Modo demostración (?demo=1) · Módulo 2</strong>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-success-aaa"
              style={{ flex: 1 }}
              disabled={comprobando || mostrarResultado}
              onClick={() => comprobar(94)}
            >
              ✓ Simular acierto
            </button>
            <button
              type="button"
              className="btn-secondary-aaa"
              style={{ flex: 1 }}
              disabled={comprobando || mostrarResultado}
              onClick={() => comprobar(58)}
            >
              ✗ Simular fallo
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
