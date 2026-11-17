import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { PerfilNino, Cuento, VistaActiva } from '../types/meexuu';
import {
  obtenerReglaSenaLSM,
  evaluarManoContraSena,
} from '../utils/lsmClassifier';

/* =============================================================================
 * MÓDULO 1 — SESIÓN DE SEÑAS (/practica-v2)
 * Con Clasificador Real de Señas LSM sobre MediaPipe HandLandmarker (21 puntos 3D)
 * y Videos Oficiales de Referencia de WikiSigns.org (https://www.wikisigns.org/list/es/lsm)
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
  ÁRBOL: '🌳',
  PERRO: '🐕',
  PELOTA: '⚽',
  'BUENOS DÍAS': '🌅',
  LIBRO: '📖',
  GRACIAS: '🙏',
  FAMILIA: '👨‍👩‍👧',
  COMER: '🍎',
  FELIZ: '😊',
};

const IMAGEN_POR_SENA: Record<string, string> = {
  HOLA: '/hola.png',
  LUNA: '/luna.png',
  CONEJO: '/conejo.jpeg',
  MAMÁ: '/mam%C3%A1.jpeg',
  PAPÁ: '/pap%C3%A1.jpeg',
};

interface EjercicioLSMItem {
  id_ejercicio: number;
  id_cuento: number;
  titulo_cuento: string;
  palabra_o_sena: string;
  orden_en_cuento: number;
  imagen_sena: string | null;
  aprobada: boolean;
}

const EJERCICIOS_LSM_RESPALDO: EjercicioLSMItem[] = [
  { id_ejercicio: 1, id_cuento: 1, titulo_cuento: 'El Conejito y la Luna', palabra_o_sena: 'HOLA', orden_en_cuento: 1, imagen_sena: '/hola.png', aprobada: false },
  { id_ejercicio: 2, id_cuento: 1, titulo_cuento: 'El Conejito y la Luna', palabra_o_sena: 'LUNA', orden_en_cuento: 2, imagen_sena: '/luna.png', aprobada: false },
  { id_ejercicio: 3, id_cuento: 1, titulo_cuento: 'El Conejito y la Luna', palabra_o_sena: 'CONEJO', orden_en_cuento: 3, imagen_sena: '/conejo.jpeg', aprobada: false },
  { id_ejercicio: 4, id_cuento: 2, titulo_cuento: 'Mis Primeros Saludos', palabra_o_sena: 'MAMÁ', orden_en_cuento: 1, imagen_sena: '/mam%C3%A1.jpeg', aprobada: false },
  { id_ejercicio: 5, id_cuento: 2, titulo_cuento: 'Mis Primeros Saludos', palabra_o_sena: 'PAPÁ', orden_en_cuento: 2, imagen_sena: '/pap%C3%A1.jpeg', aprobada: false },
  { id_ejercicio: 6, id_cuento: 2, titulo_cuento: 'Mis Primeros Saludos', palabra_o_sena: 'ADIÓS', orden_en_cuento: 3, imagen_sena: null, aprobada: false },
  { id_ejercicio: 10, id_cuento: 4, titulo_cuento: 'El Gato Mimoso en Casa', palabra_o_sena: 'GATO', orden_en_cuento: 1, imagen_sena: null, aprobada: false },
  { id_ejercicio: 11, id_cuento: 4, titulo_cuento: 'El Gato Mimoso en Casa', palabra_o_sena: 'CASA', orden_en_cuento: 2, imagen_sena: null, aprobada: false },
  { id_ejercicio: 12, id_cuento: 4, titulo_cuento: 'El Gato Mimoso en Casa', palabra_o_sena: 'AMIGO', orden_en_cuento: 3, imagen_sena: null, aprobada: false },
  { id_ejercicio: 13, id_cuento: 5, titulo_cuento: 'Colores en el Parque', palabra_o_sena: 'ÁRBOL', orden_en_cuento: 1, imagen_sena: null, aprobada: false },
  { id_ejercicio: 14, id_cuento: 5, titulo_cuento: 'Colores en el Parque', palabra_o_sena: 'PERRO', orden_en_cuento: 2, imagen_sena: null, aprobada: false },
  { id_ejercicio: 15, id_cuento: 5, titulo_cuento: 'Colores en el Parque', palabra_o_sena: 'PELOTA', orden_en_cuento: 3, imagen_sena: null, aprobada: false },
  { id_ejercicio: 19, id_cuento: 7, titulo_cuento: 'La Escuela de los Amigos', palabra_o_sena: 'BUENOS DÍAS', orden_en_cuento: 1, imagen_sena: null, aprobada: false },
  { id_ejercicio: 20, id_cuento: 7, titulo_cuento: 'La Escuela de los Amigos', palabra_o_sena: 'LIBRO', orden_en_cuento: 2, imagen_sena: null, aprobada: false },
  { id_ejercicio: 21, id_cuento: 7, titulo_cuento: 'La Escuela de los Amigos', palabra_o_sena: 'GRACIAS', orden_en_cuento: 3, imagen_sena: null, aprobada: false },
  { id_ejercicio: 22, id_cuento: 8, titulo_cuento: 'Un Día con mi Familia', palabra_o_sena: 'FAMILIA', orden_en_cuento: 1, imagen_sena: null, aprobada: false },
  { id_ejercicio: 23, id_cuento: 8, titulo_cuento: 'Un Día con mi Familia', palabra_o_sena: 'COMER', orden_en_cuento: 2, imagen_sena: null, aprobada: false },
  { id_ejercicio: 24, id_cuento: 8, titulo_cuento: 'Un Día con mi Familia', palabra_o_sena: 'FELIZ', orden_en_cuento: 3, imagen_sena: null, aprobada: false },
];

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
  onNavigate,
}) => {
  const esNoLector = perfilActivo.nivel_lectura === 'NO_LECTOR';

  const todosEjerciciosLSM = useMemo<EjercicioLSMItem[]>(() => {
    const desdeApi = cuentos
      .filter((c) => c.tipo === 'LSM')
      .flatMap((c) =>
        (c.ejercicios || [])
          .slice()
          .sort((a, b) => a.orden_en_cuento - b.orden_en_cuento)
          .map((ej) => {
            const palabra = ej.palabra_o_sena.trim().toLocaleUpperCase('es');
            return {
              id_ejercicio: ej.id_ejercicio,
              id_cuento: c.id_cuento,
              titulo_cuento: c.titulo,
              palabra_o_sena: palabra,
              orden_en_cuento: ej.orden_en_cuento,
              imagen_sena: ej.imagen_sena || IMAGEN_POR_SENA[palabra] || null,
              aprobada: Boolean(ej.aprobada),
            };
          })
      );
    return desdeApi.length > 0 ? desdeApi : EJERCICIOS_LSM_RESPALDO;
  }, [cuentos]);

  const [idEjercicioSeleccionado, setIdEjercicioSeleccionado] = useState<number>(
    senaInicial?.idEjercicio ?? 1
  );

  useEffect(() => {
    if (senaInicial?.idEjercicio) {
      setIdEjercicioSeleccionado(senaInicial.idEjercicio);
    }
  }, [senaInicial?.idEjercicio]);

  const senaActual = useMemo(() => {
    const elegido =
      todosEjerciciosLSM.find((e) => e.id_ejercicio === idEjercicioSeleccionado) ||
      todosEjerciciosLSM[0];
    return {
      id_ejercicio: elegido.id_ejercicio,
      id_cuento: elegido.id_cuento,
      titulo_cuento: elegido.titulo_cuento,
      palabra: elegido.palabra_o_sena,
      imagen_sena: elegido.imagen_sena,
      aprobada: elegido.aprobada,
    };
  }, [todosEjerciciosLSM, idEjercicioSeleccionado]);

  const reglaLSM = useMemo(
    () => obtenerReglaSenaLSM(senaActual.palabra),
    [senaActual.palabra]
  );
  const categoria = reglaLSM.categoria;
  const iconoSena = ICONO_POR_SENA[senaActual.palabra] || '✋';

  const [verVideoWikisigns, setVerVideoWikisigns] = useState(false);
  const [fase, setFase] = useState<Fase>('REFERENCIA');
  const [cuentaReferencia, setCuentaReferencia] = useState(5);
  const [referenciaPausada, setReferenciaPausada] = useState(false);
  const [pasoPreparacion, setPasoPreparacion] = useState(0);
  const [preparacionPausada, setPreparacionPausada] = useState(false);
  const [videoReal, setVideoReal] = useState(false);
  const [ninoDetectado, setNinoDetectado] = useState(true);

  const [referencia, setReferencia] = useState<'OCULTA' | 'NORMAL' | 'LENTA'>(
    'OCULTA'
  );
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [analizando, setAnalizando] = useState(false);
  const [resultado, setResultado] = useState<Resultado>('EXITO_INICIAL');
  const [precision, setPrecision] = useState<number>(88);
  const [precisionEnVivo, setPrecisionEnVivo] = useState<number>(0);
  const [pistaEnVivo, setPistaEnVivo] = useState<string>(
    reglaLSM.instruccionCorta
  );
  const [senaDetectadaEnVivo, setSenaDetectadaEnVivo] =
    useState<string>('NINGUNA');
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
  const muestrasPrecisionRef = useRef<number[]>([]);
  const precisionEnVivoRef = useRef<number>(0);
  const palabraObjetivoRef = useRef<string>(senaActual.palabra);

  useEffect(() => {
    palabraObjetivoRef.current = senaActual.palabra;
    setPistaEnVivo(obtenerReglaSenaLSM(senaActual.palabra).instruccionCorta);
  }, [senaActual.palabra]);

  const visualSena = (pequena = false, lenta = false) => {
    if (!pequena && verVideoWikisigns && reglaLSM.youtubeId) {
      return (
        <div
          style={{
            width: '100%',
            maxWidth: '340px',
            margin: '0 auto',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '2px solid #93C5FD',
            backgroundColor: '#000',
          }}
        >
          <iframe
            width="100%"
            height="195"
            src={`https://www.youtube.com/embed/${reglaLSM.youtubeId}?rel=0`}
            title={`Video WikiSigns LSM: ${senaActual.palabra}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ display: 'block', border: 0 }}
          />
        </div>
      );
    }

    return senaActual.imagen_sena ? (
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
  };

  const detenerCamara = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => detenerCamara, [detenerCamara]);

  const registrarIntento = useCallback(
    async (valor: number) => {
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
        const esperaRestante = 800 - (Date.now() - inicio);
        if (esperaRestante > 0) {
          await new Promise((resolve) =>
            window.setTimeout(resolve, esperaRestante)
          );
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
        if (!aprobado) {
          setReferencia('LENTA');
        }
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
    },
    [onRegistrarIntento, senaActual.id_ejercicio]
  );

  // Detección y Clasificación Geométrica en Tiempo Real con MediaPipe HandLandmarker
  useEffect(() => {
    let activo = true;
    let frame = 0;
    let ultimo = -1;
    let frameCounter = 0;

    const iniciar = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm'
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });
        if (!activo) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;

        const detectar = () => {
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

            const manos = landmarker.detectForVideo(
              video,
              performance.now()
            ).landmarks;
            const presente = manos.length > 0;

            if (presente !== manoPresenteRef.current) {
              manoPresenteRef.current = presente;
              setManosDetectadas(presente);
              setNinoDetectado(presente);
              if (
                presente &&
                !capturaActivaRef.current &&
                !guardandoRef.current &&
                !intentoFinalizadoRef.current
              ) {
                capturaActivaRef.current = true;
                muestrasPrecisionRef.current = [];
                setCuenta(5);
              }
            }

            if (capturaActivaRef.current && !presente) {
              capturaActivaRef.current = false;
              muestrasPrecisionRef.current = [];
              setCuenta(null);
              setGuardando(false);
            }

            if (presente) {
              const evaluacion = evaluarManoContraSena(
                palabraObjetivoRef.current,
                manos
              );

              precisionEnVivoRef.current = evaluacion.porcentajeCoincidencia;
              if (capturaActivaRef.current) {
                muestrasPrecisionRef.current.push(
                  evaluacion.porcentajeCoincidencia
                );
              }

              frameCounter += 1;
              if (frameCounter % 3 === 0) {
                setPrecisionEnVivo(evaluacion.porcentajeCoincidencia);
                setPistaEnVivo(evaluacion.pista);
                setSenaDetectadaEnVivo(evaluacion.senaReconocida);
              }

              const conexiones = HandLandmarker.HAND_CONNECTIONS;
              ctx.lineWidth = 3.5;
              ctx.strokeStyle = evaluacion.posturaCorrecta
                ? '#34D399'
                : '#FBBF24';

              for (const puntos of manos) {
                for (const { start, end } of conexiones) {
                  ctx.beginPath();
                  ctx.moveTo(
                    puntos[start].x * canvas.width,
                    puntos[start].y * canvas.height
                  );
                  ctx.lineTo(
                    puntos[end].x * canvas.width,
                    puntos[end].y * canvas.height
                  );
                  ctx.stroke();
                }

                const dedoDePunto = (idx: number): boolean => {
                  if (idx >= 1 && idx <= 4) return evaluacion.estadoDedos.pulgar;
                  if (idx >= 5 && idx <= 8) return evaluacion.estadoDedos.indice;
                  if (idx >= 9 && idx <= 12) return evaluacion.estadoDedos.medio;
                  if (idx >= 13 && idx <= 16)
                    return evaluacion.estadoDedos.anular;
                  if (idx >= 17 && idx <= 20)
                    return evaluacion.estadoDedos.menique;
                  return evaluacion.posturaCorrecta;
                };

                puntos.forEach((p, idx) => {
                  ctx.fillStyle = dedoDePunto(idx) ? '#34D399' : '#F97316';
                  ctx.beginPath();
                  ctx.arc(
                    p.x * canvas.width,
                    p.y * canvas.height,
                    5,
                    0,
                    Math.PI * 2
                  );
                  ctx.fill();
                });
              }
            }
          }
          frame = requestAnimationFrame(detectar);
        };
        frame = requestAnimationFrame(detectar);
      } catch {
        setManosDetectadas(false);
      }
    };

    if (fase === 'CAMARA' && videoReal) void iniciar();
    return () => {
      activo = false;
      cancelAnimationFrame(frame);
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [fase, videoReal]);

  // Cuenta regresiva 5, 4, 3, 2, 1 que al llegar a 0 califica automáticamente sin bloquearse
  useEffect(() => {
    if (cuenta === null || !capturaActivaRef.current) return;
    if (cuenta > 0) {
      const timer = window.setTimeout(
        () => setCuenta((n) => (n === null ? null : n - 1)),
        1000
      );
      return () => window.clearTimeout(timer);
    }
    capturaActivaRef.current = false;
    setCuenta(null);

    const muestras = muestrasPrecisionRef.current.slice();
    let calificacionFinal = precisionEnVivoRef.current || 75;
    if (muestras.length > 0) {
      muestras.sort((a, b) => b - a);
      const topCount = Math.max(1, Math.ceil(muestras.length * 0.45));
      const topSlice = muestras.slice(0, topCount);
      calificacionFinal = Math.round(
        topSlice.reduce((acc, v) => acc + v, 0) / topSlice.length
      );
    }
    void registrarIntento(calificacionFinal);
  }, [cuenta, registrarIntento]);

  // Al cambiar de seña se reinicia el estado del intento, pero si la cámara ya estaba encendida permanece encendida
  useEffect(() => {
    setIntentosFallidos(0);
    setResultado('EXITO_INICIAL');
    setPrecision(88);
    setPrecisionEnVivo(0);
    precisionEnVivoRef.current = 0;
    setReferencia('OCULTA');
    setMostrarResultado(false);
    setCuentoCompletado(false);
    setErrorIntento(null);
    setUltimoIntentoAprobado(false);
    intentoFinalizadoRef.current = false;
    manoPresenteRef.current = false;
    capturaActivaRef.current = false;
    muestrasPrecisionRef.current = [];
    setCuenta(null);
    if (!streamRef.current) {
      setFase('REFERENCIA');
      setCuentaReferencia(5);
      setReferenciaPausada(false);
      setPasoPreparacion(0);
      setPreparacionPausada(false);
    }
  }, [senaActual.id_ejercicio]);

  const encenderCamara = useCallback(async () => {
    setFase('CAMARA');
    setNinoDetectado(false);
    if (streamRef.current) {
      setVideoReal(true);
      if (videoRef.current && videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      return;
    }
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
    if (fase !== 'REFERENCIA' || referenciaPausada || verVideoWikisigns) return;
    if (cuentaReferencia === 0) {
      setFase('PREPARACION');
      return;
    }

    const timer = window.setTimeout(
      () => setCuentaReferencia((c) => Math.max(0, c - 1)),
      1000
    );
    return () => window.clearTimeout(timer);
  }, [fase, cuentaReferencia, referenciaPausada, verVideoWikisigns]);

  useEffect(() => {
    if (fase !== 'PREPARACION' || preparacionPausada) return;
    const t = setTimeout(() => {
      if (pasoPreparacion < PASOS_PREPARACION.length - 1) {
        setPasoPreparacion((p) => p + 1);
      } else {
        encenderCamara();
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [fase, pasoPreparacion, preparacionPausada, encenderCamara]);

  const evaluarIntento = (valor: number) => {
    setNinoDetectado(true);
    void registrarIntento(valor);
  };

  const ejerciciosDelCuentoActual = useMemo(
    () =>
      todosEjerciciosLSM.filter((e) => e.id_cuento === senaActual.id_cuento),
    [todosEjerciciosLSM, senaActual.id_cuento]
  );

  const indiceGlobalActual = todosEjerciciosLSM.findIndex(
    (e) => e.id_ejercicio === senaActual.id_ejercicio
  );
  const siguienteSenaGlobal =
    indiceGlobalActual >= 0 &&
    indiceGlobalActual < todosEjerciciosLSM.length - 1
      ? todosEjerciciosLSM[indiceGlobalActual + 1]
      : todosEjerciciosLSM[0];

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

      {/* 2. Pastilla de la seña actual + selector de señas del cuento y del catálogo completo */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
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

        {/* Botones rápidos de las señas del cuento activo + selector desplegable de todas las 18 señas LSM */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          {ejerciciosDelCuentoActual.map((ej, idx) => {
            const esActual = ej.id_ejercicio === senaActual.id_ejercicio;
            return (
              <button
                key={ej.id_ejercicio}
                type="button"
                onClick={() => setIdEjercicioSeleccionado(ej.id_ejercicio)}
                style={{
                  minHeight: '48px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '0.84rem',
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

          <select
            aria-label="Cambiar a otra seña del catálogo LSM"
            className="form-input-aaa"
            value={senaActual.id_ejercicio}
            onChange={(e) =>
              setIdEjercicioSeleccionado(Number(e.target.value))
            }
            style={{
              minHeight: '48px',
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '0.84rem',
              fontWeight: 700,
              maxWidth: '220px',
            }}
          >
            {todosEjerciciosLSM.map((ej) => (
              <option key={ej.id_ejercicio} value={ej.id_ejercicio}>
                {ej.aprobada ? '✓ ' : '✋ '}
                {ej.palabra_o_sena} ({ej.titulo_cuento})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjeta superior con la guía de la seña y acceso al video de WikiSigns.org */}
      {fase !== 'REFERENCIA' && (
        <div
          className="sena-preview-card"
          style={{
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '8px',
          }}
          aria-label={`Guía de la seña: ${senaActual.palabra}`}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {visualSena(true)}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                  Seña: {senaActual.palabra}
                </div>
                {!esNoLector && (
                  <div
                    style={{
                      fontSize: '0.84rem',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    {manosDetectadas ? pistaEnVivo : reglaLSM.instruccionCorta}
                  </div>
                )}
              </div>
            </div>

            {manosDetectadas && (
              <span
                className="pill-label"
                style={{
                  backgroundColor:
                    precisionEnVivo > 60 ? '#DCFCE7' : '#FEF3C7',
                  color: precisionEnVivo > 60 ? '#065F46' : '#92400E',
                  border: `2px solid ${
                    precisionEnVivo > 60 ? '#047857' : '#B45309'
                  }`,
                }}
              >
                {precisionEnVivo > 60 ? '✓ ' : '🖐️ '}
                En vivo: {precisionEnVivo}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3. Visor de cámara AR con MediaPipe HandLandmarker y Clasificador LSM */}
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
        <canvas
          ref={canvasRef}
          className="hand-landmarks-canvas"
          aria-hidden="true"
        />

        {/* Etiqueta "EN VIVO · Detección activa" (Wireframe 3) */}
        <div className="live-pill-mockup">
          <span
            aria-hidden="true"
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: manosDetectadas ? '#10B981' : '#F59E0B',
              display: 'inline-block',
            }}
          />
          <span>
            {esNoLector
              ? 'EN VIVO'
              : manosDetectadas
              ? `EN VIVO · Detectado: ${senaDetectadaEnVivo} (${precisionEnVivo}%)`
              : 'EN VIVO · Detección activa'}
          </span>
        </div>

        {cuenta !== null && (
          <div
            className="hand-countdown"
            role="status"
            aria-live="assertive"
          >
            {cuenta}
          </div>
        )}
        {guardando && (
          <div className="hand-saving" role="status" aria-live="polite">
            <span className="hand-loader" aria-hidden="true" />
            Calificando seña ({precisionEnVivoRef.current || precisionEnVivo}%)
          </div>
        )}

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

          {cuenta === null && !guardando && !manosDetectadas && (
            <>
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
            </>
          )}
        </div>

        {/* Pantalla inicial de observación de la seña (Imagen + Video WikiSigns LSM) */}
        {fase === 'REFERENCIA' && (
          <div
            className="prep-overlay sena-intro-overlay"
            role="status"
            aria-live="polite"
            style={{ overflowY: 'auto', padding: '16px' }}
          >
            <p className="sena-intro-title" style={{ margin: 0 }}>
              Observa cómo hacer la seña
            </p>
            <div className="sena-intro-visual">{visualSena()}</div>
            <p className="sena-intro-word" style={{ margin: '4px 0' }}>
              {senaActual.palabra}
            </p>
            {!esNoLector && (
              <p
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '0.88rem',
                  maxWidth: '340px',
                  color: '#E2E8F0',
                }}
              >
                {reglaLSM.instruccionCorta}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <button
                type="button"
                className="btn-secondary-aaa"
                onClick={() => {
                  setVerVideoWikisigns((v) => !v);
                  setReferenciaPausada(true);
                }}
              >
                {verVideoWikisigns
                  ? '🖼️ Ver ilustración'
                  : '🎬 Ver video WikiSigns LSM'}
              </button>
              <button
                type="button"
                className="btn-primary-aaa"
                onClick={() => setFase('PREPARACION')}
              >
                ▶ Practicar ahora ({cuentaReferencia}s)
              </button>
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
            style={{ overflowY: 'auto' }}
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
                fontSize: '0.95rem',
              }}
            >
              {referencia === 'LENTA'
                ? `🐢 Guía paso a paso: ${senaActual.palabra}`
                : `▶ Seña: ${senaActual.palabra}`}
            </span>
            {!esNoLector && (
              <div
                style={{
                  fontSize: '0.85rem',
                  color: '#F8FAFC',
                  maxWidth: '340px',
                  textAlign: 'left',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                }}
              >
                {reglaLSM.pasos.map((paso) => (
                  <div key={paso}>{paso}</div>
                ))}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <button
                type="button"
                className="btn-secondary-aaa"
                onClick={() => setVerVideoWikisigns((v) => !v)}
              >
                {verVideoWikisigns
                  ? '🖼️ Ver imagen'
                  : '🎬 Video WikiSigns (YouTube)'}
              </button>
              <button
                type="button"
                className="btn-success-aaa"
                onClick={() => {
                  setReferencia('OCULTA');
                  intentoFinalizadoRef.current = false;
                  manoPresenteRef.current = false;
                  setMostrarResultado(false);
                }}
              >
                ✓ {esNoLector ? '¡Listo!' : '¡Listo, intentar de nuevo!'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controles principales debajo del visor: "Ver seña de nuevo" y "Calificar seña ahora" */}
      {fase !== 'REFERENCIA' && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary-aaa"
            style={{
              flex: 1,
              minHeight: '56px',
              fontSize: '1rem',
              borderRadius: '16px',
            }}
            onClick={() => setReferencia('NORMAL')}
          >
            <span aria-hidden="true">🔁</span>
            <span>Ver seña de nuevo</span>
          </button>

          {fase === 'CAMARA' && !mostrarResultado && (
            <button
              type="button"
              className="btn-primary-aaa"
              style={{
                flex: 1,
                minHeight: '56px',
                fontSize: '1rem',
                borderRadius: '16px',
              }}
              disabled={analizando || guardando}
              onClick={() => {
                capturaActivaRef.current = false;
                setCuenta(null);
                const muestras = muestrasPrecisionRef.current.slice();
                let puntaje = precisionEnVivoRef.current || precisionEnVivo;
                if (muestras.length > 0) {
                  muestras.sort((a, b) => b - a);
                  const top = muestras.slice(
                    0,
                    Math.max(1, Math.ceil(muestras.length * 0.45))
                  );
                  puntaje = Math.round(
                    top.reduce((a, b) => a + b, 0) / top.length
                  );
                } else if (!puntaje) {
                  puntaje = manosDetectadas ? 82 : 48;
                }
                void registrarIntento(puntaje);
              }}
            >
              <span aria-hidden="true">✓</span>
              <span>
                {manosDetectadas
                  ? `Calificar ahora (${precisionEnVivo}%)`
                  : 'Calificar seña'}
              </span>
            </button>
          )}
        </div>
      )}

      {/* 4. Tarjeta inferior idéntica al Wireframe 3:
             "¡Excelente postura! 88%" con "Calibración base / Coincidencia alta" */}
      {mostrarResultado && (
        <div
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
                      ? `Intento ${intentosFallidos} de ${MAX_INTENTOS} sin penalización · ${reglaLSM.instruccionCorta}`
                      : `Seña "${senaActual.palabra}" validada correctamente (+25 ★)`}
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
            onClick={() =>
              setIdEjercicioSeleccionado(siguienteSenaGlobal.id_ejercicio)
            }
          >
            Practicar siguiente seña ({siguienteSenaGlobal.palabra_o_sena}) →
          </button>
          <button
            type="button"
            className="btn-secondary-aaa"
            onClick={() => {
              detenerCamara();
              onNavigate('CATALOGO_CUENTOS', '/cuentos');
            }}
          >
            Ver cuentos
          </button>
        </div>
      ) : (
        puedeReintentar && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              className="btn-secondary-aaa"
              disabled={analizando}
              onClick={() => {
                intentoFinalizadoRef.current = false;
                manoPresenteRef.current = false;
                capturaActivaRef.current = false;
                muestrasPrecisionRef.current = [];
                setCuenta(null);
                setManosDetectadas(false);
                setReferencia('OCULTA');
                setMostrarResultado(false);
                setErrorIntento(null);
                setUltimoIntentoAprobado(false);
              }}
            >
              Intentar de nuevo
            </button>

            <button
              type="button"
              className="btn-primary-aaa"
              disabled={analizando}
              onClick={() =>
                setIdEjercicioSeleccionado(siguienteSenaGlobal.id_ejercicio)
              }
            >
              Siguiente seña: {siguienteSenaGlobal.palabra_o_sena} →
            </button>
          </div>
        )
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
              disabled={analizando}
              onClick={() => evaluarIntento(92)}
            >
              ✓ Simular acierto (+25 ★)
            </button>
            <button
              type="button"
              className="btn-secondary-aaa"
              style={{ flex: 1 }}
              disabled={analizando}
              onClick={() => evaluarIntento(52)}
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
