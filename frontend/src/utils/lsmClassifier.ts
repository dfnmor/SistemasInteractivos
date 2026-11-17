import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

/* =============================================================================
 * CLASIFICADOR GEOMÉTRICO Y CINEMÁTICO ESTRICTO DE SEÑAS LSM (MediaPipe)
 * + CATÁLOGO DE VIDEOS DE REFERENCIA DE WIKISIGNS.ORG (LSM MEXICANO)
 * Fuente de videos: https://www.wikisigns.org/list/es/lsm
 * ============================================================================= */

export interface ReglaSenaLSM {
  palabra: string;
  categoria: string;
  wikisignsUrl: string;
  youtubeId: string;
  instruccionCorta: string;
  pasos: string[];
  /**
   * Estado estricto esperado de cada dedo:
   * - 'EXT': extendido/estirado
   * - 'FLEX': flexionado/doblado hacia la palma
   * - 'PINZA': curvado haciendo pinza o capullo
   * - 'LIBRE': opcional
   */
  dedosEsperados: {
    pulgar: 'EXT' | 'FLEX' | 'PINZA' | 'LIBRE';
    indice: 'EXT' | 'FLEX' | 'PINZA' | 'LIBRE';
    medio: 'EXT' | 'FLEX' | 'PINZA' | 'LIBRE';
    anular: 'EXT' | 'FLEX' | 'PINZA' | 'LIBRE';
    menique: 'EXT' | 'FLEX' | 'PINZA' | 'LIBRE';
  };
  separacionIndiceMedio?: 'JUNTOS' | 'SEPARADOS_V';
  pinzaPulgarIndice?: boolean;
  capulloYemas?: boolean;
  requiereDosManos?: boolean;
  requiereMovimiento?: boolean;
}

export const CATALOGO_SENAS_WIKISIGNS: Record<string, ReglaSenaLSM> = {
  HOLA: {
    palabra: 'HOLA',
    categoria: 'SALUDO',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/hola',
    youtubeId: 'q51NPnFAmgA',
    instruccionCorta:
      'Estira SOLO índice, medio (juntos) y pulgar. Dobla anular y meñique hacia la palma.',
    pasos: [
      '1. Estira los dedos índice y medio juntos (configuración H).',
      '2. Dobla completamente el anular y el meñique hacia la palma.',
      '3. Mantén el pulgar abierto y desliza la mano desde tu sien.',
    ],
    dedosEsperados: {
      pulgar: 'EXT',
      indice: 'EXT',
      medio: 'EXT',
      anular: 'FLEX',
      menique: 'FLEX',
    },
    separacionIndiceMedio: 'JUNTOS',
  },
  LUNA: {
    palabra: 'LUNA',
    categoria: 'NATURALEZA',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/Luna%20de%20Miel',
    youtubeId: 'GSQGr1qD8vI',
    instruccionCorta:
      'Estira SOLO el pulgar y el índice formando una L (media luna). Cierra medio, anular y meñique.',
    pasos: [
      '1. Estira únicamente el dedo índice y el pulgar formando una L.',
      '2. Dobla por completo los dedos medio, anular y meñique.',
      '3. Eleva la mano cerca de tu rostro.',
    ],
    dedosEsperados: {
      pulgar: 'EXT',
      indice: 'EXT',
      medio: 'FLEX',
      anular: 'FLEX',
      menique: 'FLEX',
    },
  },
  CONEJO: {
    palabra: 'CONEJO',
    categoria: 'ANIMAL',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/conejo',
    youtubeId: 'd-zlDTSgek4',
    instruccionCorta:
      'Levanta SOLO índice y medio como orejitas. Guarda pulgar, anular y meñique.',
    pasos: [
      '1. Extiende los dedos índice y medio hacia arriba como dos orejitas.',
      '2. Dobla el anular, el meñique y el pulgar hacia la palma.',
      '3. Coloca la mano cerca de tu cabeza y mueve las orejitas.',
    ],
    dedosEsperados: {
      pulgar: 'FLEX',
      indice: 'EXT',
      medio: 'EXT',
      anular: 'FLEX',
      menique: 'FLEX',
    },
  },
  MAMÁ: {
    palabra: 'MAMÁ',
    categoria: 'FAMILIA',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/mam%C3%A1',
    youtubeId: 'vhhmntwwyUU',
    instruccionCorta:
      'Estira 3 dedos juntos (índice, medio y anular — letra M) y dobla meñique y pulgar.',
    pasos: [
      '1. Estira los dedos índice, medio y anular juntos.',
      '2. Dobla el dedo meñique y guarda el pulgar.',
      '3. Acerca la mano suavemente a tu barbilla.',
    ],
    dedosEsperados: {
      pulgar: 'FLEX',
      indice: 'EXT',
      medio: 'EXT',
      anular: 'EXT',
      menique: 'FLEX',
    },
    separacionIndiceMedio: 'JUNTOS',
  },
  PAPÁ: {
    palabra: 'PAPÁ',
    categoria: 'FAMILIA',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/pap%C3%A1',
    youtubeId: 'U73KZTHs5TU',
    instruccionCorta:
      'Abre índice y medio bien separados en V (letra P) y dobla anular y meñique.',
    pasos: [
      '1. Extiende el dedo índice y el dedo medio separados formando una V.',
      '2. Dobla por completo el anular y el meñique.',
      '3. Coloca la mano cerca de tu barbilla.',
    ],
    dedosEsperados: {
      pulgar: 'LIBRE',
      indice: 'EXT',
      medio: 'EXT',
      anular: 'FLEX',
      menique: 'FLEX',
    },
    separacionIndiceMedio: 'SEPARADOS_V',
  },
  ADIÓS: {
    palabra: 'ADIÓS',
    categoria: 'DESPEDIDA',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/adi%C3%B3s',
    youtubeId: '4daW7-o4vBg',
    instruccionCorta:
      'Abre los 5 dedos de tu mano y muévela de un lado a otro saludando.',
    pasos: [
      '1. Abre la palma extendiendo los cinco dedos.',
      '2. Mueve la mano de izquierda a derecha frente a la cámara.',
    ],
    dedosEsperados: {
      pulgar: 'EXT',
      indice: 'EXT',
      medio: 'EXT',
      anular: 'EXT',
      menique: 'EXT',
    },
    requiereMovimiento: true,
  },
  GATO: {
    palabra: 'GATO',
    categoria: 'ANIMAL',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/gato',
    youtubeId: '7_hUckVK_W0',
    instruccionCorta:
      'Une las puntas de índice y pulgar (pinza F) y estira medio, anular y meñique.',
    pasos: [
      '1. Junta la yema del dedo índice con la del pulgar formando un círculo.',
      '2. Mantén los dedos medio, anular y meñique bien estirados.',
      '3. Desliza desde tu mejilla como los bigotes de un gato.',
    ],
    dedosEsperados: {
      pulgar: 'PINZA',
      indice: 'PINZA',
      medio: 'EXT',
      anular: 'EXT',
      menique: 'EXT',
    },
    pinzaPulgarIndice: true,
  },
  CASA: {
    palabra: 'CASA',
    categoria: 'HOGAR',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/casa',
    youtubeId: 'QwSIl0vO2zg',
    instruccionCorta:
      'Coloca AMBAS manos frente a la cámara e inclínalas uniendo las puntas como un techo.',
    pasos: [
      '1. Levanta ambas manos con los dedos estirados.',
      '2. Une las puntas de las dos manos arriba formando el techo de una casa.',
    ],
    dedosEsperados: {
      pulgar: 'LIBRE',
      indice: 'EXT',
      medio: 'EXT',
      anular: 'EXT',
      menique: 'EXT',
    },
    requiereDosManos: true,
  },
  AMIGO: {
    palabra: 'AMIGO',
    categoria: 'VALORES',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/Amigo',
    youtubeId: 'APW6yD3mPCw',
    instruccionCorta:
      'Estira SOLO el dedo índice (dobla medio, anular y meñique) para enganchar los índices.',
    pasos: [
      '1. Estira únicamente el dedo índice.',
      '2. Dobla los dedos medio, anular y meñique hacia la palma.',
      '3. Engancha los índices en señal de amistad.',
    ],
    dedosEsperados: {
      pulgar: 'FLEX',
      indice: 'EXT',
      medio: 'FLEX',
      anular: 'FLEX',
      menique: 'FLEX',
    },
  },
  ÁRBOL: {
    palabra: 'ÁRBOL',
    categoria: 'NATURALEZA',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/%C3%81rbol%20de%20navidad',
    youtubeId: 'DVXgYnUOXfQ',
    instruccionCorta:
      'Abre los 5 dedos bien separados hacia arriba y mueve la mano como las ramas de un árbol.',
    pasos: [
      '1. Levanta la mano con los 5 dedos separados.',
      '2. Agita suavemente la mano de lado a lado como las hojas del árbol.',
    ],
    dedosEsperados: {
      pulgar: 'EXT',
      indice: 'EXT',
      medio: 'EXT',
      anular: 'EXT',
      menique: 'EXT',
    },
    separacionIndiceMedio: 'SEPARADOS_V',
    requiereMovimiento: true,
  },
  PERRO: {
    palabra: 'PERRO',
    categoria: 'ANIMAL',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/perro',
    youtubeId: 'kx1XmiJAHnU',
    instruccionCorta:
      'Une pulgar y dedo medio mientras mantienes anular y meñique doblados.',
    pasos: [
      '1. Extiende índice y medio con el pulgar activo.',
      '2. Dobla anular y meñique y mueve la mano llamando al perrito.',
    ],
    dedosEsperados: {
      pulgar: 'EXT',
      indice: 'EXT',
      medio: 'EXT',
      anular: 'FLEX',
      menique: 'FLEX',
    },
    requiereMovimiento: true,
  },
  PELOTA: {
    palabra: 'PELOTA',
    categoria: 'JUEGO',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/casa',
    youtubeId: 'QwSIl0vO2zg',
    instruccionCorta:
      'Curva los dedos en forma de garra/esfera (letra C) sin estirarlos por completo.',
    pasos: [
      '1. Semidobla todos los dedos como sosteniendo una pelota redonda.',
      '2. No dejes la palma totalmente plana ni en puño cerrado.',
    ],
    dedosEsperados: {
      pulgar: 'EXT',
      indice: 'PINZA',
      medio: 'PINZA',
      anular: 'PINZA',
      menique: 'PINZA',
    },
  },
  'BUENOS DÍAS': {
    palabra: 'BUENOS DÍAS',
    categoria: 'SALUDO',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/buenos%20d%C3%ADas',
    youtubeId: 'KCmq76G3oXI',
    instruccionCorta:
      'Estira los 4 dedos juntos (índice, medio, anular y meñique) y dobla el pulgar sobre la palma (letra B).',
    pasos: [
      '1. Estira índice, medio, anular y meñique bien pegados entre sí.',
      '2. Dobla el pulgar hacia el centro de tu palma (configuración B).',
    ],
    dedosEsperados: {
      pulgar: 'FLEX',
      indice: 'EXT',
      medio: 'EXT',
      anular: 'EXT',
      menique: 'EXT',
    },
    separacionIndiceMedio: 'JUNTOS',
  },
  LIBRO: {
    palabra: 'LIBRO',
    categoria: 'ESCUELA',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/Libro%20%28A%29',
    youtubeId: 'NVTYaHtBayU',
    instruccionCorta:
      'Muestra AMBAS manos abiertas frente a la cámara como las dos páginas de un libro.',
    pasos: [
      '1. Coloca tus dos manos frente a la cámara con los dedos juntos.',
      '2. Ábrelas como si abrieras un libro para leer.',
    ],
    dedosEsperados: {
      pulgar: 'LIBRE',
      indice: 'EXT',
      medio: 'EXT',
      anular: 'EXT',
      menique: 'EXT',
    },
    requiereDosManos: true,
  },
  GRACIAS: {
    palabra: 'GRACIAS',
    categoria: 'CORTESÍA',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/gracias',
    youtubeId: 'JH4GfJncYdw',
    instruccionCorta:
      'Abre la mano pero dobla el dedo medio hacia adelante (configuración de Gracias en LSM).',
    pasos: [
      '1. Mantén estirados el pulgar, índice, anular y meñique.',
      '2. Flexiona el dedo medio hacia adelante.',
      '3. Lleva la mano hacia el frente.',
    ],
    dedosEsperados: {
      pulgar: 'EXT',
      indice: 'EXT',
      medio: 'FLEX',
      anular: 'EXT',
      menique: 'EXT',
    },
  },
  FAMILIA: {
    palabra: 'FAMILIA',
    categoria: 'FAMILIA',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/familia',
    youtubeId: '44yC0Y8DQxE',
    instruccionCorta:
      'Une pulgar e índice en círculo (letra F) y estira medio, anular y meñique.',
    pasos: [
      '1. Une la punta del dedo índice con el pulgar (letra F).',
      '2. Estira completamente los dedos medio, anular y meñique.',
    ],
    dedosEsperados: {
      pulgar: 'PINZA',
      indice: 'PINZA',
      medio: 'EXT',
      anular: 'EXT',
      menique: 'EXT',
    },
    pinzaPulgarIndice: true,
  },
  COMER: {
    palabra: 'COMER',
    categoria: 'ACCIÓN',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/comer',
    youtubeId: 'dh5rXj3karc',
    instruccionCorta:
      'Junta todas las yemas de tus dedos con el pulgar formando un capullo cerrado hacia tu boca.',
    pasos: [
      '1. Une las puntas de los dedos con la punta del pulgar.',
      '2. Dobla el anular y meñique y acerca la mano hacia tu boca.',
    ],
    dedosEsperados: {
      pulgar: 'PINZA',
      indice: 'PINZA',
      medio: 'PINZA',
      anular: 'FLEX',
      menique: 'FLEX',
    },
    capulloYemas: true,
  },
  FELIZ: {
    palabra: 'FELIZ',
    categoria: 'EMOCIÓN',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/Feliz',
    youtubeId: '4f38YRFz7kw',
    instruccionCorta:
      'Forma la letra F (une índice y pulgar, estira medio, anular y meñique) y muévela con alegría.',
    pasos: [
      '1. Une las yemas de índice y pulgar (letra F).',
      '2. Mantén estirados medio, anular y meñique y mueve la mano.',
    ],
    dedosEsperados: {
      pulgar: 'PINZA',
      indice: 'PINZA',
      medio: 'EXT',
      anular: 'EXT',
      menique: 'EXT',
    },
    pinzaPulgarIndice: true,
  },
};

export function obtenerReglaSenaLSM(palabraRaw: string): ReglaSenaLSM {
  const clave = palabraRaw.trim().toLocaleUpperCase('es');
  return (
    CATALOGO_SENAS_WIKISIGNS[clave] || CATALOGO_SENAS_WIKISIGNS['HOLA']
  );
}

function dist3D(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function dist2D(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export interface CaracteristicasMano {
  pulgarExt: number;
  indiceExt: number;
  medioExt: number;
  anularExt: number;
  meniqueExt: number;
  separacionIndiceMedio: number;
  pinzaPulgarIndice: number;
  agrupacionYemas: number;
  centroX: number;
  centroY: number;
}

export function extraerCaracteristicasMano(
  lm: NormalizedLandmark[]
): CaracteristicasMano {
  const wrist = lm[0];
  const palmSize = Math.max(
    0.05,
    (dist3D(wrist, lm[5]) + dist3D(wrist, lm[9]) + dist3D(wrist, lm[17])) / 3
  );

  const calcExt = (mcp: number, pip: number, _dip: number, tip: number): number => {
    const dWristTip = dist2D(wrist, lm[tip]);
    const dWristPip = dist2D(wrist, lm[pip]);
    const dMcpTip = dist2D(lm[mcp], lm[tip]);
    const dMcpPip = Math.max(0.01, dist2D(lm[mcp], lm[pip]));

    const ratioWrist = dWristTip / Math.max(0.01, dWristPip);
    const ratioMcp = dMcpTip / dMcpPip;

    const scoreWrist = Math.min(1, Math.max(0, (ratioWrist - 0.94) / 0.3));
    const scoreMcp = Math.min(1, Math.max(0, (ratioMcp - 1.08) / 0.62));
    return scoreWrist * 0.55 + scoreMcp * 0.45;
  };

  const indiceExt = calcExt(5, 6, 7, 8);
  const medioExt = calcExt(9, 10, 11, 12);
  const anularExt = calcExt(13, 14, 15, 16);
  const meniqueExt = calcExt(17, 18, 19, 20);

  const dThumbIndexMcp = dist2D(lm[4], lm[5]) / palmSize;
  const dThumbPinkyMcp = dist2D(lm[4], lm[17]) / palmSize;
  const pulgarExt = Math.min(
    1,
    Math.max(
      0,
      ((dThumbIndexMcp - 0.44) / 0.42) * 0.6 +
        ((dThumbPinkyMcp - 0.88) / 0.52) * 0.4
    )
  );

  const separacionIndiceMedio = dist2D(lm[8], lm[12]) / palmSize;
  const pinzaPulgarIndice = dist2D(lm[4], lm[8]) / palmSize;
  const agrupacionYemas =
    (dist2D(lm[4], lm[8]) + dist2D(lm[4], lm[12]) + dist2D(lm[4], lm[16])) /
    (3 * palmSize);

  return {
    pulgarExt,
    indiceExt,
    medioExt,
    anularExt,
    meniqueExt,
    separacionIndiceMedio,
    pinzaPulgarIndice,
    agrupacionYemas,
    centroX: lm[9].x,
    centroY: lm[9].y,
  };
}

export interface ResultadoEvaluacionFrame {
  porcentajeCoincidencia: number;
  senaReconocida: string;
  posturaCorrecta: boolean;
  pista: string;
  estadoDedos: {
    pulgar: boolean;
    indice: boolean;
    medio: boolean;
    anular: boolean;
    menique: boolean;
  };
}

function evaluarDedoEstricto(
  valorExt: number,
  esperado: 'EXT' | 'FLEX' | 'PINZA' | 'LIBRE',
  pinzaDist: number
): { score: number; ok: boolean } {
  if (esperado === 'LIBRE') {
    return { score: 1.0, ok: true };
  }
  if (esperado === 'EXT') {
    const ok = valorExt >= 0.58;
    const score = ok
      ? 0.8 + ((valorExt - 0.58) / 0.42) * 0.2
      : Math.max(0, (valorExt / 0.58) * 0.45);
    return { score, ok };
  }
  if (esperado === 'FLEX') {
    // Debe estar doblado (valorExt <= 0.45). Si está estirado (> 0.45), reprueba este dedo.
    const ok = valorExt <= 0.45;
    const score = ok
      ? 0.8 + ((0.45 - valorExt) / 0.45) * 0.2
      : Math.max(0, ((1 - valorExt) / 0.55) * 0.35);
    return { score, ok };
  }
  // 'PINZA': no debe estar totalmente recto (valorExt < 0.82) o debe tocar pulgar-índice (pinzaDist < 0.62)
  const ok = pinzaDist <= 0.62 || (valorExt >= 0.12 && valorExt <= 0.78);
  const score = ok ? 0.88 : 0.25;
  return { score, ok };
}

/**
 * Clasifica qué seña está realizando realmente la mano en este momento
 */
function identificarArquetipoMano(
  feat: CaracteristicasMano,
  numManos: number
): string {
  const i = feat.indiceExt >= 0.58;
  const m = feat.medioExt >= 0.58;
  const a = feat.anularExt >= 0.55;
  const p = feat.meniqueExt >= 0.55;
  const t = feat.pulgarExt >= 0.52;

  if (feat.pinzaPulgarIndice <= 0.55 && m && a && p) {
    return 'GATO / FAMILIA (Pinza F)';
  }
  if (feat.agrupacionYemas <= 0.68 && !a && !p) {
    return 'COMER';
  }
  if (i && m && a && p && t) {
    return numManos >= 2 ? 'CASA / LIBRO (2 manos)' : 'MANO ABIERTA (5 dedos)';
  }
  if (i && m && a && p && !t) {
    return 'BUENOS DÍAS (Letra B)';
  }
  if (i && !m && a && p) {
    return 'GRACIAS';
  }
  if (i && m && a && !p) {
    return 'MAMÁ (3 dedos - M)';
  }
  if (i && m && !a && !p) {
    if (feat.separacionIndiceMedio >= 0.38) {
      return 'PAPÁ (2 dedos en V)';
    }
    return t ? 'HOLA (Configuración H)' : 'CONEJO (2 dedos juntos)';
  }
  if (i && !m && !a && !p) {
    return t ? 'LUNA (Configuración L)' : 'AMIGO (Índice)';
  }
  if (!i && !m && !a && !p) {
    return 'PUÑO CERRADO';
  }
  return 'POSTURA INCOMPLETA';
}

export function evaluarManoContraSena(
  palabraObjetivo: string,
  manos: NormalizedLandmark[][],
  movimientoReciente = 0
): ResultadoEvaluacionFrame {
  if (!manos || manos.length === 0) {
    return {
      porcentajeCoincidencia: 0,
      senaReconocida: 'SIN MANO',
      posturaCorrecta: false,
      pista: 'Coloca tu mano frente a la cámara dentro de las esquinas guía.',
      estadoDedos: {
        pulgar: false,
        indice: false,
        medio: false,
        anular: false,
        menique: false,
      },
    };
  }

  const regla = obtenerReglaSenaLSM(palabraObjetivo);
  const feat = extraerCaracteristicasMano(manos[0]);
  const arquetipoDetectado = identificarArquetipoMano(feat, manos.length);

  const evPulgar = evaluarDedoEstricto(
    feat.pulgarExt,
    regla.dedosEsperados.pulgar,
    feat.pinzaPulgarIndice
  );
  const evIndice = evaluarDedoEstricto(
    feat.indiceExt,
    regla.dedosEsperados.indice,
    feat.pinzaPulgarIndice
  );
  const evMedio = evaluarDedoEstricto(
    feat.medioExt,
    regla.dedosEsperados.medio,
    feat.pinzaPulgarIndice
  );
  const evAnular = evaluarDedoEstricto(
    feat.anularExt,
    regla.dedosEsperados.anular,
    feat.pinzaPulgarIndice
  );
  const evMenique = evaluarDedoEstricto(
    feat.meniqueExt,
    regla.dedosEsperados.menique,
    feat.pinzaPulgarIndice
  );

  // Contar cuántos dedos obligatorios están en posición INCORRECTA (en naranja)
  const dedosObligatorios: Array<{
    nombre: string;
    esperado: 'EXT' | 'FLEX' | 'PINZA' | 'LIBRE';
    ok: boolean;
    score: number;
  }> = [
    {
      nombre: 'pulgar',
      esperado: regla.dedosEsperados.pulgar,
      ok: evPulgar.ok,
      score: evPulgar.score,
    },
    {
      nombre: 'índice',
      esperado: regla.dedosEsperados.indice,
      ok: evIndice.ok,
      score: evIndice.score,
    },
    {
      nombre: 'medio',
      esperado: regla.dedosEsperados.medio,
      ok: evMedio.ok,
      score: evMedio.score,
    },
    {
      nombre: 'anular',
      esperado: regla.dedosEsperados.anular,
      ok: evAnular.ok,
      score: evAnular.score,
    },
    {
      nombre: 'meñique',
      esperado: regla.dedosEsperados.menique,
      ok: evMenique.ok,
      score: evMenique.score,
    },
  ].filter((d) => d.esperado !== 'LIBRE');

  const dedosIncorrectos = dedosObligatorios.filter((d) => !d.ok);
  const promedioDedos =
    dedosObligatorios.reduce((acc, d) => acc + d.score, 0) /
    Math.max(1, dedosObligatorios.length);

  // Verificar restricciones geométricas adicionales de la seña
  let restriccionExtraOk = true;
  let pistaRestriccion = '';

  if (regla.separacionIndiceMedio === 'JUNTOS') {
    if (feat.separacionIndiceMedio > 0.42) {
      restriccionExtraOk = false;
      pistaRestriccion = 'Junta tus dedos índice y medio (no los separes en V).';
    }
  } else if (regla.separacionIndiceMedio === 'SEPARADOS_V') {
    if (feat.separacionIndiceMedio < 0.34) {
      restriccionExtraOk = false;
      pistaRestriccion = 'Separa tus dedos índice y medio formando una V clara.';
    }
  }

  if (regla.pinzaPulgarIndice && feat.pinzaPulgarIndice > 0.58) {
    restriccionExtraOk = false;
    pistaRestriccion = 'Une la punta de tu dedo índice con la punta del pulgar.';
  }

  if (regla.capulloYemas && feat.agrupacionYemas > 0.72) {
    restriccionExtraOk = false;
    pistaRestriccion = 'Une todas las yemas de tus dedos con el pulgar.';
  }

  if (regla.requiereDosManos && manos.length < 2) {
    restriccionExtraOk = false;
    pistaRestriccion = `Coloca AMBAS manos en la cámara para hacer la seña "${regla.palabra}".`;
  }

  if (regla.requiereMovimiento && movimientoReciente < 0.018) {
    restriccionExtraOk = false;
    pistaRestriccion = `Mueve tu mano de lado a lado para completar la seña "${regla.palabra}".`;
  }

  // Cálculo estricto del porcentaje:
  // - Si hay 2 o más dedos en posición incorrecta (ej. mano abierta cuando se pide HOLA), el puntaje máximo es 34%.
  // - Si hay 1 dedo en posición incorrecta, el puntaje máximo es 52% (NO aprueba).
  // - Si los dedos están bien pero falta la restricción especial (V, juntos, pinza, 2 manos, movimiento), máximo 56% (NO aprueba).
  // - Solo cuando TODOS los dedos obligatorios y la restricción se cumplen, supera el 60% (76% - 98%).
  let porcentajeCoincidencia: number;

  if (dedosIncorrectos.length >= 2) {
    porcentajeCoincidencia = Math.round(
      Math.min(36, Math.max(15, promedioDedos * 42))
    );
  } else if (dedosIncorrectos.length === 1) {
    porcentajeCoincidencia = Math.round(
      Math.min(54, Math.max(38, promedioDedos * 58))
    );
  } else if (!restriccionExtraOk) {
    porcentajeCoincidencia = 56;
  } else {
    porcentajeCoincidencia = Math.round(
      Math.min(98, Math.max(76, 72 + promedioDedos * 26))
    );
  }

  const posturaCorrecta = porcentajeCoincidencia > 60;

  // Construir retroalimentación específica indicando exactamente qué dedo corregir
  let pista = `¡Postura correcta para "${regla.palabra}"! Mantén la seña (${porcentajeCoincidencia}%).`;
  if (!posturaCorrecta) {
    const debenDoblarse = dedosIncorrectos
      .filter((d) => d.esperado === 'FLEX')
      .map((d) => d.nombre);
    const debenEstirarse = dedosIncorrectos
      .filter((d) => d.esperado === 'EXT')
      .map((d) => d.nombre);

    if (debenDoblarse.length > 0) {
      pista = `Estás mostrando ${arquetipoDetectado}. Dobla: ${debenDoblarse.join(', ')}.`;
    } else if (debenEstirarse.length > 0) {
      pista = `Estás mostrando ${arquetipoDetectado}. Estira: ${debenEstirarse.join(', ')}.`;
    } else if (pistaRestriccion) {
      pista = pistaRestriccion;
    } else {
      pista = regla.instruccionCorta;
    }
  }

  return {
    porcentajeCoincidencia,
    senaReconocida: posturaCorrecta ? regla.palabra : arquetipoDetectado,
    posturaCorrecta,
    pista,
    estadoDedos: {
      pulgar: evPulgar.ok,
      indice: evIndice.ok,
      medio: evMedio.ok,
      anular: evAnular.ok,
      menique: evMenique.ok,
    },
  };
}
