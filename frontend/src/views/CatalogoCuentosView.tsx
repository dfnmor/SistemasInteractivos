import React, { useState } from 'react';
import {
  PerfilNino,
  Cuento,
  NivelLectura,
  TipoCuento,
  VistaActiva,
} from '../types/meexuu';

/* =============================================================================
 * CATÁLOGO DE CUENTOS LSM Y NARRATIVA
 * Wireframe 2 (Fase 2, Act. 6, p. 9): "2. Catálogo de Cuentos LSM"
 *   1. Encabezado: "📖 Biblioteca de Cuentos LSM"
 *   2. Pila vertical de tarjetas de cuentos:
 *      - Fila superior: "🌱 Nivel 1" | "⏱ 5 min" | "☆☆☆" o "60% completado"
 *      - Recuadro pastel de ilustración (ej. Conejo y Luna / Bosque)
 *      - Pastilla rosa: "✨ Señas: Hola, Luna, Conejo"
 *      - Título: "El Conejito y la Luna" + texto descriptivo
 *      - Botón azul de ancho completo: "▶ Abrir Cuento"
 * ============================================================================= */

interface CatalogoCuentosViewProps {
  perfilActivo: PerfilNino;
  cuentos: Cuento[];
  onNavigate: (vista: VistaActiva, path?: string) => void;
  onPracticarEjercicio: (
    tipo: TipoCuento,
    palabra: string,
    idEjercicio: number,
    idCuento?: number
  ) => void;
}

const FONDOS_PASTEL: string[] = [
  '#FFEDD5',
  '#DCFCE7',
  '#EDE9FE',
  '#DBEAFE',
  '#FCE7F3',
  '#FEF3C7',
  '#E0E7FF',
  '#CCFBF1',
  '#FEE2E2',
];

const ETIQUETA_NIVEL: Record<NivelLectura, string> = {
  NO_LECTOR: '🌱 Nivel 1',
  LECTURA_INICIAL: '🌱 Nivel 2',
  LECTOR_AVANZADO: '🌱 Nivel 3',
};

export const CatalogoCuentosView: React.FC<CatalogoCuentosViewProps> = ({
  perfilActivo,
  cuentos,
  onNavigate,
  onPracticarEjercicio,
}) => {
  const esNoLector = perfilActivo.nivel_lectura === 'NO_LECTOR';
  const [filtroNivel, setFiltroNivel] = useState<'TODOS' | NivelLectura>('TODOS');
  const [cuentoAbierto, setCuentoAbierto] = useState<Cuento | null>(null);
  const [escena, setEscena] = useState(0);

  const abrirCuentoConReanudacion = (cuento: Cuento) => {
    setCuentoAbierto(cuento);
    const ejercicios = [...(cuento.ejercicios || [])].sort(
      (a, b) => a.orden_en_cuento - b.orden_en_cuento
    );
    const primeraPendiente = ejercicios.findIndex((ejercicio) => !ejercicio.aprobada);
    setEscena(primeraPendiente < 0 ? 0 : primeraPendiente);
  };

  const cerrarCuento = () => {
    setCuentoAbierto(null);
    setEscena(0);
  };

  // ---------------------------------------------------------------------------
  // VISTA DE NARRATIVA DE CUENTO (Boceto Fase 1, Act. 6: "Narrativa de cuento")
  // ---------------------------------------------------------------------------
  if (cuentoAbierto) {
    const ejercicios = (cuentoAbierto.ejercicios || [])
      .slice()
      .sort((a, b) => a.orden_en_cuento - b.orden_en_cuento);
    const total = Math.max(ejercicios.length, 1);
    const ej = ejercicios[escena];
    const aprobadas = ejercicios.filter((ejercicio) => ejercicio.aprobada).length;
    const cuentoCompleto = ejercicios.length > 0 && aprobadas === ejercicios.length;
    const avance = Math.round((aprobadas / total) * 100);
    const fondo =
      FONDOS_PASTEL[(cuentoAbierto.id_cuento - 1) % FONDOS_PASTEL.length];

    return (
      <section
        aria-labelledby="titulo-narrativa"
        style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        <div className="screen-back-header">
          <button
            type="button"
            className="btn-back-circle"
            onClick={cerrarCuento}
            aria-label="Volver a la biblioteca de cuentos"
          >
            ←
          </button>
          <h1
            id="titulo-narrativa"
            className="section-title"
            style={{ fontSize: '1.25rem', flex: 1 }}
          >
            {cuentoAbierto.titulo}
          </h1>
        </div>

        <div
          style={{
            backgroundColor: fondo,
            borderRadius: '20px',
            border: '2px solid var(--border-strong)',
            minHeight: '230px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            padding: '24px',
          }}
        >
          <div style={{ fontSize: '4.6rem', lineHeight: 1 }} aria-hidden="true">
            {cuentoAbierto.imagen_portada || '🐰🌙'}
          </div>
          {ej && (
            <span
              className="pill-label"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: '2px solid #0F172A',
                fontSize: '1.1rem',
              }}
            >
              ✋ {ej.palabra_o_sena}
            </span>
          )}
        </div>

        <div className="card-aaa" style={{ textAlign: 'center' }}>
          {esNoLector ? (
            <div
              style={{ fontSize: '2.2rem' }}
              aria-label={`Escena ${escena + 1}: ${ej?.palabra_o_sena ?? ''}`}
            >
              👀 ➡️ ✋
            </div>
          ) : (
            <>
              <p style={{ margin: '0 0 6px 0', fontWeight: 700 }}>
                {cuentoAbierto.descripcion}
              </p>
              {ej && (
                <p className="text-support">
                  Escena {escena + 1} de {total}: aprende la seña{' '}
                  <strong>&ldquo;{ej.palabra_o_sena}&rdquo;</strong>
                </p>
              )}
            </>
          )}
        </div>

        <div className="card-aaa">
          <div
            role="group"
            aria-label="Elegir seña del cuento"
            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}
          >
            {ejercicios.map((ejercicio, indice) => (
              <button
                key={ejercicio.id_ejercicio}
                type="button"
                className={indice === escena ? 'btn-primary-aaa' : 'btn-secondary-aaa'}
                aria-pressed={indice === escena}
                onClick={() => setEscena(indice)}
              >
                {ejercicio.aprobada ? '✓ ' : ''}{ejercicio.palabra_o_sena}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn-secondary-aaa"
              disabled={escena === 0}
              onClick={() => setEscena((actual) => Math.max(0, actual - 1))}
              aria-label="Seña anterior"
            >
              ← Anterior
            </button>
          <div className="progress-track-aaa" style={{ height: '14px' }}>
            <div className="progress-fill-aaa" style={{ width: `${avance}%` }} />
          </div>
            <button
              type="button"
              className="btn-secondary-aaa"
              disabled={escena >= ejercicios.length - 1}
              onClick={() =>
                setEscena((actual) => Math.min(ejercicios.length - 1, actual + 1))
              }
              aria-label="Siguiente seña"
            >
              Siguiente →
            </button>
          </div>
          <p className="text-support" style={{ marginBottom: 0, textAlign: 'center' }}>
            {cuentoCompleto
              ? `Cuento completado · puedes volver a practicar cualquier seña (${aprobadas}/${ejercicios.length})`
              : `Señas aprobadas: ${aprobadas} de ${ejercicios.length}. Para avanzar, aprueba cada seña con más de 60%.`}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {cuentoCompleto && (
            <div className="cuento-completado-celebracion" role="status" aria-live="polite">
              <span aria-hidden="true">✨ ⭐ ✨</span>
              <strong>¡Cuento completado!</strong>
              <button
                type="button"
                className="btn-primary-aaa"
                onClick={() => setEscena(0)}
              >
                Rehacer cuento desde el inicio
              </button>
              <button
                type="button"
                className="btn-secondary-aaa"
                onClick={cerrarCuento}
              >
                Ver cuentos
              </button>
            </div>
          )}
          {ej && (
            <button
              type="button"
              className="btn-primary-aaa"
              style={{ width: '100%' }}
              onClick={() =>
                onPracticarEjercicio(
                  cuentoAbierto.tipo,
                  ej.palabra_o_sena,
                  ej.id_ejercicio,
                  cuentoAbierto.id_cuento
                )
              }
            >
              <span aria-hidden="true">📹</span>
              <span>
                {esNoLector
                  ? `✋ ${ej.palabra_o_sena}`
                  : `Practicar seña "${ej.palabra_o_sena}"`}
              </span>
            </button>
          )}
        </div>
      </section>
    );
  }

  // ---------------------------------------------------------------------------
  // BIBLIOTECA DE CUENTOS LSM (Wireframe 2, Fase 2, Act. 6, p. 9)
  // ---------------------------------------------------------------------------
  const lista = cuentos.filter((c) =>
    filtroNivel === 'TODOS' ? true : c.nivel_lectura === filtroNivel
  );

  return (
    <section
      aria-labelledby="titulo-biblioteca"
      style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
    >
      {/* 1. Encabezado idéntico al Wireframe 2: "📖 Biblioteca de Cuentos LSM" */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn-back-circle"
            onClick={() => onNavigate('MENU_PRINCIPAL', '/menu')}
            aria-label="Volver al menú de inicio"
          >
            ←
          </button>
          <h1
            id="titulo-biblioteca"
            className="section-title"
            style={{ fontSize: '1.25rem' }}
          >
            <span aria-hidden="true" style={{ color: '#0052A3' }}>
              📖{' '}
            </span>
            Biblioteca de Cuentos LSM
          </h1>
        </div>
      </div>

      {/* Filtro por niveles (Todos / Nivel 1 / Nivel 2 / Nivel 3) */}
      <div
        style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}
        role="group"
        aria-label="Filtrar por nivel de lectura"
      >
        {(
          [
            { id: 'TODOS', label: 'Todos' },
            { id: 'NO_LECTOR', label: '🌱 Nivel 1' },
            { id: 'LECTURA_INICIAL', label: '🌱 Nivel 2' },
            { id: 'LECTOR_AVANZADO', label: '🌱 Nivel 3' },
          ] as const
        ).map((tab) => {
          const activo = filtroNivel === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={activo}
              onClick={() => setFiltroNivel(tab.id)}
              style={{
                flex: 1,
                minHeight: '48px',
                padding: '6px 10px',
                borderRadius: '999px',
                border: `2px solid ${
                  activo ? '#0052A3' : 'var(--border-subtle)'
                }`,
                backgroundColor: activo ? '#0052A3' : 'var(--bg-surface)',
                color: activo ? '#FFFFFF' : 'var(--text-primary)',
                fontSize: '0.84rem',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 2. Pila vertical de tarjetas de cuentos (idéntica al Wireframe 2) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {lista.map((cuento, idx) => {
          const completado = cuento.progreso_usuario?.estado === 'COMPLETADO';
          const enProgreso = cuento.progreso_usuario?.estado === 'EN_PROGRESO';
          const nivelAnteriorCompleto =
            cuento.orden_dificultad === 1 ||
            cuentos
              .filter((anterior) => anterior.orden_dificultad === cuento.orden_dificultad - 1)
              .every((anterior) => anterior.progreso_usuario?.estado === 'COMPLETADO');
          const ejercicios = cuento.ejercicios || [];
          const progresoPorcentaje = ejercicios.length
            ? Math.round(
                (ejercicios.filter((ejercicio) => ejercicio.aprobada).length /
                  ejercicios.length) *
                  100
              )
            : 0;
          const senas = (cuento.ejercicios || [])
            .map((e) => e.palabra_o_sena)
            .join(', ');

          return (
            <article
              key={cuento.id_cuento}
              className="card-aaa"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                filter: nivelAnteriorCompleto ? undefined : 'grayscale(1)',
                opacity: nivelAnteriorCompleto ? 1 : 0.62,
              }}
            >
              {/* Fila superior: "🌱 Nivel 1 | ⏱ 5 min" a la izquierda, "☆☆☆" o "60% completado" a la derecha */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  <span
                    className="pill-label"
                    style={{ backgroundColor: '#DCFCE7', color: '#065F46' }}
                  >
                    {ETIQUETA_NIVEL[cuento.nivel_lectura]}
                  </span>
                  <span
                    className="pill-label"
                    style={{
                      backgroundColor: 'var(--bg-surface-soft)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    ⏱ {idx === 0 ? 5 : idx === 1 ? 7 : 5 + (idx % 3)} min
                  </span>
                </div>

                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: enProgreso && !completado ? '#0052A3' : '#D97706',
                  }}
                >
                  {completado
                    ? '★★★'
                    : enProgreso
                    ? `${progresoPorcentaje}% completado`
                    : '☆☆☆'}
                </span>
              </div>

              {/* Barra fina de progreso cuando el cuento está "60% completado" (como en la tarjeta 2 del Wireframe 2) */}
              {enProgreso && !completado && (
                <div className="progress-track-aaa" style={{ height: '6px' }}>
                  <div
                    className="progress-fill-aaa"
                    style={{ width: `${progresoPorcentaje}%` }}
                  />
                </div>
              )}
              {!nivelAnteriorCompleto && (
                <span className="pill-label" aria-label="Cuento bloqueado">
                  🔒 Completa el nivel anterior para desbloquear
                </span>
              )}

              {/* Recuadro de ilustración pastel (Wireframe 2) */}
              <div
                aria-hidden="true"
                style={{
                  position: 'relative',
                  backgroundColor:
                    FONDOS_PASTEL[(cuento.id_cuento - 1) % FONDOS_PASTEL.length],
                  borderRadius: '16px',
                  padding: '28px 16px',
                  textAlign: 'center',
                  fontSize: '3.6rem',
                  lineHeight: 1,
                }}
              >
                {cuento.imagen_portada || '🐰🌙'}
              </div>

              {/* Pastilla rosa: "✨ Señas: Hola, Luna, Conejo" */}
              {senas && (
                <span
                  className="pill-label"
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#FCE7F3',
                    color: '#9D174D',
                  }}
                >
                  ✨ {esNoLector ? senas : `Señas: ${senas}`}
                </span>
              )}

              {/* Título y descripción del cuento */}
              <h2 className="section-title" style={{ fontSize: '1.2rem' }}>
                {cuento.titulo}
              </h2>
              {!esNoLector && (
                <p className="text-support">{cuento.descripcion}</p>
              )}

              {/* Botón azul de ancho completo: "▶ Abrir Cuento" */}
              <button
                type="button"
                className="btn-primary-aaa"
                style={{ width: '100%', marginTop: '4px' }}
                disabled={!nivelAnteriorCompleto}
                onClick={() => {
                  abrirCuentoConReanudacion(cuento);
                }}
              >
                <span aria-hidden="true">▶</span>
                <span>
                  {!nivelAnteriorCompleto
                    ? 'Cuento bloqueado'
                    : enProgreso
                    ? 'Continuar cuento'
                    : completado
                    ? 'Volver a hacer cuento'
                    : 'Abrir cuento'}
                </span>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
};
