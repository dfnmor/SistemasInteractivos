import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

/* =============================================================================
 * CLASIFICADOR GEOMÉTRICO Y CINEMÁTICO DE SEÑAS LSM (MediaPipe HandLandmarker)
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
   * Estado esperado de cada dedo:
   * - 'EXT': extendido (1)
   * - 'FLEX': flexionado/cerrado (0)
   * - 'CURVO': semi-curvado o en pinza
   * - 'LIBRE': opcional / variable según variante regional
   */
  dedosEsperados: {
    pulgar: 'EXT' | 'FLEX' | 'CURVO' | 'LIBRE';
    indice: 'EXT' | 'FLEX' | 'CURVO' | 'LIBRE';
    medio: 'EXT' | 'FLEX' | 'CURVO' | 'LIBRE';
    anular: 'EXT' | 'FLEX' | 'CURVO' | 'LIBRE';
    menique: 'EXT' | 'FLEX' | 'CURVO' | 'LIBRE';
  };
  separacionIndiceMedio?: 'JUNTOS' | 'SEPARADOS_V' | 'LIBRE';
  pinzaPulgarIndice?: boolean;
  capulloYemas?: boolean;
  dosManosPreferido?: boolean;
}

export const CATALOGO_SENAS_WIKISIGNS: Record<string, ReglaSenaLSM> = {
  HOLA: {
    palabra: 'HOLA',
    categoria: 'SALUDO',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/hola',
    youtubeId: 'q51NPnFAmgA',
    instruccionCorta:
      'Extiende índice y medio juntos (configuración H) cerca de tu frente y desliza hacia afuera.',
    pasos: [
      '1. Estira los dedos índice y medio juntos.',
      '2. Dobla el anular y el meñique hacia la palma.',
      '3. Coloca tu mano a la altura de la frente y muévela suavemente hacia afuera.',
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
      'Extiende el pulgar y el índice formando una media luna (L/C) y dobla los demás dedos.',
    pasos: [
      '1. Estira únicamente el dedo índice y el pulgar formando una media luna.',
      '2. Mantén cerrados los dedos medio, anular y meñique.',
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
      'Levanta índice y medio como orejitas de conejo y mueve las puntas hacia adelante.',
    pasos: [
      '1. Extiende los dedos índice y medio hacia arriba como dos orejitas.',
      '2. Guarda el anular y el meñique en la palma.',
      '3. Coloca la mano cerca de tu sien y mueve las orejitas.',
    ],
    dedosEsperados: {
      pulgar: 'LIBRE',
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
      'Extiende tres dedos juntos (índice, medio y anular — letra M) y acércalos a tu barbilla.',
    pasos: [
      '1. Estira los dedos índice, medio y anular juntos.',
      '2. Dobla el dedo meñique y el pulgar.',
      '3. Acerca las yemas suavemente a tu barbilla.',
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
      'Abre índice y medio en forma de V (configuración P) con anular y meñique doblados.',
    pasos: [
      '1. Extiende el dedo índice y el dedo medio separados en V.',
      '2. Dobla el anular y el meñique hacia la palma.',
      '3. Coloca la mano cerca de la barbilla con pequeños toques.',
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
      'Abre toda tu palma con los 5 dedos estirados y muévela saludando de lado a lado.',
    pasos: [
      '1. Abre la mano extendiendo los cinco dedos.',
      '2. Muestra la palma hacia la cámara.',
      '3. Mueve la mano suavemente de un lado a otro.',
    ],
    dedosEsperados: {
      pulgar: 'EXT',
      indice: 'EXT',
      medio: 'EXT',
      anular: 'EXT',
      menique: 'EXT',
    },
  },
  GATO: {
    palabra: 'GATO',
    categoria: 'ANIMAL',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/gato',
    youtubeId: '7_hUckVK_W0',
    instruccionCorta:
      'Une las yemas de índice y pulgar (pinza F) dejando medio, anular y meñique estirados como bigotes.',
    pasos: [
      '1. Junta la punta del dedo índice con el pulgar.',
      '2. Mantén los dedos medio, anular y meñique extendidos.',
      '3. Desliza la mano desde tu mejilla hacia afuera como bigotes de gato.',
    ],
    dedosEsperados: {
      pulgar: 'CURVO',
      indice: 'CURVO',
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
      'Extiende tus manos con los dedos juntos e inclínalas formando el techo de una casita.',
    pasos: [
      '1. Estira los dedos de ambas manos.',
      '2. Inclina las manos uniendo las puntas arriba como el techo de una casa.',
      '3. Mantén la figura frente a la cámara.',
    ],
    dedosEsperados: {
      pulgar: 'LIBRE',
      indice: 'EXT',
      medio: 'EXT',
      anular: 'EXT',
      menique: 'EXT',
    },
    dosManosPreferido: true,
  },
  AMIGO: {
    palabra: 'AMIGO',
    categoria: 'VALORES',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/Amigo',
    youtubeId: 'APW6yD3mPCw',
    instruccionCorta:
      'Extiende el dedo índice (o entrelaza ambos índices) para representar amistad.',
    pasos: [
      '1. Estira el dedo índice manteniendo anular y meñique doblados.',
      '2. Si usas ambas manos, engancha los dos dedos índices en el centro.',
    ],
    dedosEsperados: {
      pulgar: 'LIBRE',
      indice: 'EXT',
      medio: 'LIBRE',
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
      'Levanta tu mano abierta con los 5 dedos bien separados hacia arriba como las ramas de un árbol.',
    pasos: [
      '1. Levanta el antebrazo verticalmente.',
      '2. Abre los 5 dedos bien extendidos como las ramas.',
      '3. Gira suavemente la muñeca.',
    ],
    dedosEsperados: {
      pulgar: 'EXT',
      indice: 'EXT',
      medio: 'EXT',
      anular: 'EXT',
      menique: 'EXT',
    },
  },
  PERRO: {
    palabra: 'PERRO',
    categoria: 'ANIMAL',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/perro',
    youtubeId: 'kx1XmiJAHnU',
    instruccionCorta:
      'Extiende índice, medio y pulgar haciendo el gesto de llamar a un perrito.',
    pasos: [
      '1. Extiende los dedos índice y medio con el pulgar activo.',
      '2. Realiza un movimiento suave llamando al perrito.',
    ],
    dedosEsperados: {
      pulgar: 'EXT',
      indice: 'EXT',
      medio: 'EXT',
      anular: 'LIBRE',
      menique: 'LIBRE',
    },
  },
  PELOTA: {
    palabra: 'PELOTA',
    categoria: 'JUEGO',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/casa',
    youtubeId: 'QwSIl0vO2zg',
    instruccionCorta:
      'Curva tus dedos formando una esfera (letra C amplia) como si sostuvieras una pelota.',
    pasos: [
      '1. Abre la mano y curva todos los dedos en forma de C redonda.',
      '2. Si usas ambas manos, rodea una pelota imaginaria frente a ti.',
    ],
    dedosEsperados: {
      pulgar: 'EXT',
      indice: 'CURVO',
      medio: 'CURVO',
      anular: 'CURVO',
      menique: 'CURVO',
    },
    dosManosPreferido: true,
  },
  'BUENOS DÍAS': {
    palabra: 'BUENOS DÍAS',
    categoria: 'SALUDO',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/buenos%20d%C3%ADas',
    youtubeId: 'KCmq76G3oXI',
    instruccionCorta:
      'Coloca los 4 dedos extendidos juntos (letra B) desde el pecho hacia adelante.',
    pasos: [
      '1. Estira índice, medio, anular y meñique juntos.',
      '2. Lleva la mano desde el pecho hacia adelante en señal de "Buenos".',
    ],
    dedosEsperados: {
      pulgar: 'LIBRE',
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
      'Extiende las palmas planas con los dedos juntos y ábrelas como las páginas de un libro.',
    pasos: [
      '1. Junta tus manos planas con todos los dedos estirados.',
      '2. Ábrelas hacia los lados como al abrir un libro.',
    ],
    dedosEsperados: {
      pulgar: 'EXT',
      indice: 'EXT',
      medio: 'EXT',
      anular: 'EXT',
      menique: 'EXT',
    },
    dosManosPreferido: true,
  },
  GRACIAS: {
    palabra: 'GRACIAS',
    categoria: 'CORTESÍA',
    wikisignsUrl: 'https://www.wikisigns.org/es/lsm/gracias',
    youtubeId: 'JH4GfJncYdw',
    instruccionCorta:
      'Extiende la mano abierta inclinando el dedo medio o llévala desde tu barbilla hacia adelante.',
    pasos: [
      '1. Abre la palma con los dedos extendidos.',
      '2. Lleva la mano desde la barbilla o palma hacia el frente en señal de gratitud.',
    ],
    dedosEsperados: {
      pulgar: 'EXT',
      indice: 'EXT',
      medio: 'LIBRE',
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
      'Une pulgar e índice en círculo (letra F) con medio, anular y meñique estirados arriba.',
    pasos: [
      '1. Une la yema del índice con el pulgar formando la letra F.',
      '2. Estira hacia arriba los dedos medio, anular y meñique.',
    ],
    dedosEsperados: {
      pulgar: 'CURVO',
      indice: 'CURVO',
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
      'Une las puntas de los dedos con el pulgar (capullo) y acércalos hacia tu boca.',
    pasos: [
      '1. Junta las yemas de todos tus dedos con el pulgar.',
      '2. Acerca la mano hacia tu boca un par de veces.',
    ],
    dedosEsperados: {
      pulgar: 'CURVO',
      indice: 'CURVO',
      medio: 'CURVO',
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
      'Abre la mano (o en configuración F) con los dedos extendidos y muévela hacia arriba con alegría.',
    pasos: [
      '1. Extiende los dedos de tu mano mostrando apertura.',
      '2. Realiza un movimiento ascendente frente a ti.',
    ],
    dedosEsperados: {
      pulgar: 'LIBRE',
      indice: 'LIBRE',
      medio: 'EXT',
      anular: 'EXT',
      menique: 'EXT',
    },
  },
};

export function obtenerReglaSenaLSM(palabraRaw: string): ReglaSenaLSM {
  const clave = palabraRaw.trim().toLocaleUpperCase('es');
  return (
    CATALOGO_SENAS_WIKISIGNS[clave] || {
      palabra: clave,
      categoria: 'LSM',
      wikisignsUrl: 'https://www.wikisigns.org/list/es/lsm',
      youtubeId: 'q51NPnFAmgA',
      instruccionCorta: `Realiza la seña "${clave}" frente a la cámara siguiendo el modelo visual.`,
      pasos: [
        '1. Observa el video o imagen de referencia.',
        '2. Coloca tu mano dentro de las esquinas guía.',
      ],
      dedosEsperados: {
        pulgar: 'EXT',
        indice: 'EXT',
        medio: 'EXT',
        anular: 'LIBRE',
        menique: 'LIBRE',
      },
    }
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
  alturaY: number;
}

export function extraerCaracteristicasMano(
  lm: NormalizedLandmark[]
): CaracteristicasMano {
  const wrist = lm[0];
  const palmSize = Math.max(
    0.05,
    (dist3D(wrist, lm[5]) + dist3D(wrist, lm[9]) + dist3D(wrist, lm[17])) / 3
  );

  const calcExt = (mcp: number, pip: number, dip: number, tip: number): number => {
    const dWristTip = dist2D(wrist, lm[tip]);
    const dWristPip = dist2D(wrist, lm[pip]);
    const dMcpTip = dist2D(lm[mcp], lm[tip]);
    const dMcpPip = Math.max(0.01, dist2D(lm[mcp], lm[pip]));

    const ratioWrist = dWristTip / Math.max(0.01, dWristPip);
    const ratioMcp = dMcpTip / dMcpPip;

    // Si ratioWrist >= 1.18 y ratioMcp >= 1.55 -> dedo totalmente extendido (1.0)
    // Si ratioWrist <= 0.95 -> dedo cerrado/flexionado (0.0)
    const scoreWrist = Math.min(1, Math.max(0, (ratioWrist - 0.92) / 0.32));
    const scoreMcp = Math.min(1, Math.max(0, (ratioMcp - 1.05) / 0.65));
    return scoreWrist * 0.55 + scoreMcp * 0.45;
  };

  const indiceExt = calcExt(5, 6, 7, 8);
  const medioExt = calcExt(9, 10, 11, 12);
  const anularExt = calcExt(13, 14, 15, 16);
  const meniqueExt = calcExt(17, 18, 19, 20);

  // Extensión del pulgar: distancia de la punta del pulgar (4) al MCP del índice (5) y del medio (9)
  const dThumbIndexMcp = dist2D(lm[4], lm[5]) / palmSize;
  const dThumbPinkyMcp = dist2D(lm[4], lm[17]) / palmSize;
  const pulgarExt = Math.min(
    1,
    Math.max(0, (dThumbIndexMcp - 0.42) / 0.45 * 0.6 + (dThumbPinkyMcp - 0.85) / 0.55 * 0.4)
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
    alturaY: lm[8].y,
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

function evaluarDedoContraRegla(
  valorExt: number,
  esperado: 'EXT' | 'FLEX' | 'CURVO' | 'LIBRE'
): { score: number; ok: boolean } {
  if (esperado === 'LIBRE') {
    return { score: 1.0, ok: true };
  }
  if (esperado === 'EXT') {
    const score = Math.min(1, Math.max(0, (valorExt - 0.2) / 0.55));
    return { score, ok: valorExt >= 0.52 };
  }
  if (esperado === 'FLEX') {
    const score = Math.min(1, Math.max(0, (0.78 - valorExt) / 0.52));
    return { score, ok: valorExt <= 0.52 };
  }
  // 'CURVO': acepta tanto postura semi-curvada como pinza
  const distMedia = Math.abs(valorExt - 0.45);
  const score = Math.min(1, Math.max(0.35, 1 - distMedia * 1.1));
  return { score, ok: valorExt >= 0.15 && valorExt <= 0.82 };
}

/**
 * Evalúa qué tan bien coincide la mano detectada en tiempo real con la seña objetivo,
 * e identifica también qué seña del vocabulario se parece más a la postura actual.
 */
export function evaluarManoContraSena(
  palabraObjetivo: string,
  manos: NormalizedLandmark[][]
): ResultadoEvaluacionFrame {
  if (!manos || manos.length === 0) {
    return {
      porcentajeCoincidencia: 0,
      senaReconocida: 'NINGUNA',
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

  const evPulgar = evaluarDedoContraRegla(feat.pulgarExt, regla.dedosEsperados.pulgar);
  const evIndice = evaluarDedoContraRegla(feat.indiceExt, regla.dedosEsperados.indice);
  const evMedio = evaluarDedoContraRegla(feat.medioExt, regla.dedosEsperados.medio);
  const evAnular = evaluarDedoContraRegla(feat.anularExt, regla.dedosEsperados.anular);
  const evMenique = evaluarDedoContraRegla(feat.meniqueExt, regla.dedosEsperados.menique);

  // Peso principal: configuración articular de los 5 dedos (75% del puntaje)
  let scoreTotal =
    evPulgar.score * 0.12 +
    evIndice.score * 0.24 +
    evMedio.score * 0.24 +
    evAnular.score * 0.2 +
    evMenique.score * 0.2;

  // Modificadores específicos de la seña (25% restante)
  let bonusEspecifico = 0.85;
  let pistaEspecifica = '';

  if (regla.separacionIndiceMedio === 'JUNTOS') {
    if (feat.separacionIndiceMedio <= 0.65) {
      bonusEspecifico = 1.0;
    } else {
      bonusEspecifico = 0.68;
      pistaEspecifica = 'Junta un poco más tus dedos índice y medio.';
    }
  } else if (regla.separacionIndiceMedio === 'SEPARADOS_V') {
    if (feat.separacionIndiceMedio >= 0.34) {
      bonusEspecifico = 1.0;
    } else {
      bonusEspecifico = 0.68;
      pistaEspecifica = 'Separa los dedos índice y medio formando una V.';
    }
  }

  if (regla.pinzaPulgarIndice) {
    if (feat.pinzaPulgarIndice <= 0.65) {
      bonusEspecifico = 1.0;
    } else {
      bonusEspecifico = 0.62;
      pistaEspecifica = 'Une las puntas de tu dedo índice y tu pulgar.';
    }
  }

  if (regla.capulloYemas) {
    if (feat.agrupacionYemas <= 0.88) {
      bonusEspecifico = 1.0;
    } else {
      bonusEspecifico = 0.62;
      pistaEspecifica = 'Junta las yemas de tus dedos con el pulgar hacia tu boca.';
    }
  }

  if (regla.dosManosPreferido && manos.length >= 2) {
    bonusEspecifico = Math.min(1.08, bonusEspecifico + 0.12);
  }

  const combinado = scoreTotal * 0.78 + bonusEspecifico * 0.22;
  const porcentajeCoincidencia = Math.round(
    Math.min(99, Math.max(18, combinado * 100))
  );

  // Identificar qué seña del catálogo base se parece más a la postura actual
  let mejorSena = regla.palabra;
  let mejorScoreCatalogo = porcentajeCoincidencia;

  if (porcentajeCoincidencia < 76) {
    // Clasificar entre los arquetipos principales para mostrar qué está haciendo el usuario
    if (
      feat.indiceExt > 0.6 &&
      feat.medioExt > 0.6 &&
      feat.anularExt > 0.6 &&
      feat.meniqueExt > 0.6
    ) {
      mejorSena = 'ADIÓS / MANO ABIERTA';
    } else if (
      feat.indiceExt > 0.6 &&
      feat.medioExt < 0.45 &&
      feat.anularExt < 0.45 &&
      feat.meniqueExt < 0.45 &&
      feat.pulgarExt > 0.5
    ) {
      mejorSena = 'LUNA (Configuración L)';
    } else if (
      feat.indiceExt > 0.6 &&
      feat.medioExt > 0.6 &&
      feat.anularExt > 0.55 &&
      feat.meniqueExt < 0.5
    ) {
      mejorSena = 'MAMÁ (Configuración M)';
    } else if (
      feat.indiceExt > 0.6 &&
      feat.medioExt > 0.6 &&
      feat.anularExt < 0.48 &&
      feat.meniqueExt < 0.48
    ) {
      mejorSena =
        feat.separacionIndiceMedio >= 0.38
          ? 'PAPÁ / CONEJO (Configuración V)'
          : 'HOLA / CONEJO (Configuración H)';
    } else if (
      feat.indiceExt < 0.38 &&
      feat.medioExt < 0.38 &&
      feat.anularExt < 0.38 &&
      feat.meniqueExt < 0.38
    ) {
      mejorSena = 'PUÑO CERRADO';
    }
    void mejorScoreCatalogo;
  }

  // Generar pista amigable en tiempo real si algún dedo no coincide todavía
  let pista = `¡Muy bien! Mantén la seña "${regla.palabra}" (${porcentajeCoincidencia}% de coincidencia).`;
  if (porcentajeCoincidencia <= 60) {
    if (!evIndice.ok || !evMedio.ok) {
      pista = regla.instruccionCorta;
    } else if (!evAnular.ok || !evMenique.ok) {
      pista =
        regla.dedosEsperados.anular === 'FLEX'
          ? 'Dobla tus dedos anular y meñique hacia la palma.'
          : 'Estira también tus dedos anular y meñique.';
    } else if (pistaEspecifica) {
      pista = pistaEspecifica;
    } else {
      pista = regla.instruccionCorta;
    }
  } else if (pistaEspecifica && porcentajeCoincidencia < 78) {
    pista = pistaEspecifica;
  }

  return {
    porcentajeCoincidencia,
    senaReconocida: porcentajeCoincidencia >= 65 ? regla.palabra : mejorSena,
    posturaCorrecta: porcentajeCoincidencia > 60,
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
