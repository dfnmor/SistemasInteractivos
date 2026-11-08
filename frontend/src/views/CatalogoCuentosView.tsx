import React, { useState, useEffect } from 'react';
import {
  PerfilNino,
  Cuento,
  Recompensa,
  NivelLectura,
  TipoCuento,
  VistaActiva,
} from '../types/meexuu';

interface CatalogoCuentosViewProps {
  perfilActivo: PerfilNino;
  perfiles?: PerfilNino[];
  cuentos: Cuento[];
  recompensas: Recompensa[];
  seccionInicial?: 'MENU' | 'BIBLIOTECA';
  onSelectPerfil?: (perfil: PerfilNino) => void;
  onNavigate: (vista: VistaActiva, path?: string) => void;
  onCompletarCuento: (id_cuento: number) => Promise<void>;
  onCanjearRecompensa: (id_recompensa: number) => Promise<{ ok: boolean; mensaje: string }>;
  onPracticarEjercicio: (
    tipo: TipoCuento,
    palabra: string,
    idEjercicio: number,
    idCuento?: number
  ) => void;
}

const FONDOS_PASTEL_CUENTO: Record<number, string> = {
  1: '#EDE9FE',
  2: '#FFEDD5',
  3: '#DBEAFE',
  4: '#DCFCE7',
  5: '#FCE7F3',
  6: '#FEF3C7',
  7: '#E0E7FF',
  8: '#CCFBF1',
  9: '#FEE2E2',
};

export const CatalogoCuentosView: React.FC<CatalogoCuentosViewProps> = ({
  perfilActivo,
  perfiles = [],
  cuentos,
  recompensas,
  seccionInicial = 'MENU',
  onSelectPerfil,
  onNavigate,
  onCompletarCuento,
  onCanjearRecompensa,
  onPracticarEjercicio,
}) => {
  const [subVista, setSubVista] = useState<'MENU' | 'BIBLIOTECA' | 'NARRATIVA'>(
    seccionInicial
  );
  const [filtroNivel, setFiltroNivel] = useState<'TODOS' | NivelLectura>('TODOS');
  const [cuentoAbierto, setCuentoAbierto] = useState<Cuento | null>(null);
  const [escenaActual, setEscenaActual] = useState(0);
  const [reproduciendoNarrativa, setReproduciendoNarrativa] = useState(true);
  const [estadoCanje, setEstadoCanje] = useState<{
    ok: boolean;
    mensaje: string;
  } | null>(null);

  useEffect(() => {
    setSubVista(seccionInicial);
  }, [seccionInicial]);

  const nombreCorto = perfilActivo.nombre_apodo.split('(')[0].trim();
  const esNoLector = perfilActivo.nivel_lectura === 'NO_LECTOR';

  const cuentosFiltrados = cuentos.filter((c) => {
    if (filtroNivel !== 'TODOS' && c.nivel_lectura !== filtroNivel) return false;
    return true;
  });

  const handleAbrirNarrativa = (cuento: Cuento) => {
    setCuentoAbierto(cuento);
    setEscenaActual(0);
    setReproduciendoNarrativa(true);
    setSubVista('NARRATIVA');
  };

  const etiquetaNivelCuento = (nivel: NivelLectura) => {
    if (nivel === 'NO_LECTOR') return '🌱 Nivel 1';
    if (nivel === 'LECTURA_INICIAL') return '🌿 Nivel 2';
    return '🌳 Nivel 3';
  };

  // ===========================================================================
  // SUB-VISTA C: NARRATIVA DE CUENTO (Boceto Fase 1, Act. 6, p. 21: "Narrativa de cuento")
  // - Flecha atrás "←" arriba a la izquierda
  // - Recuadro grande de ilustración/animación arriba
  // - Líneas de narrativa debajo (o pictogramas grandes si es NO_LECTOR)
  // - Botón circular Play (▶) abajo a la izquierda + barra de progreso horizontal
  // ===========================================================================
  if (subVista === 'NARRATIVA' && cuentoAbierto) {
    const ejerciciosCuento = cuentoAbierto.ejercicios || [];
    const ejercicioActual = ejerciciosCuento[escenaActual] || {
      id_ejercicio: 1,
      palabra_o_sena: 'HOLA',
      orden_en_cuento: 1,
      id_cuento: cuentoAbierto.id_cuento,
      patron_referencia_id: 101,
    };
    const totalEscenas = Math.max(ejerciciosCuento.length, 1);
    const porcentajeBarra = Math.round(((escenaActual + 1) / totalEscenas) * 100);

    return (
      <section aria-label={`Narrativa de cuento: ${cuentoAbierto.titulo}`}>
        {/* Barra superior de navegación del cuento ("←") */}
        <div className="screen-back-header">
          <button
            type="button"
            className="btn-back-circle"
            onClick={() => setSubVista('BIBLIOTECA')}
            aria-label="Volver al catálogo de cuentos"
          >
            ←
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{cuentoAbierto.titulo}</h1>
          </div>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: 'var(--bg-card-highlight)',
              color: 'var(--primary-aaa)',
            }}
          >
            {escenaActual + 1}/{totalEscenas}
          </span>
        </div>

        {/* Recuadro grande superior con la ilustración/seña del cuento (idéntico al boceto "Narrativa de cuento") */}
        <div
          style={{
            backgroundColor:
              FONDOS_PASTEL_CUENTO[cuentoAbierto.id_cuento] || '#EDE9FE',
            borderRadius: '20px',
            border: '2px solid var(--border-strong)',
            padding: '28px 16px',
            textAlign: 'center',
            marginBottom: '18px',
            minHeight: '220px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '4.6rem', lineHeight: 1 }} aria-hidden="true">
            {cuentoAbierto.imagen_portada || '🐰🌙'}
          </div>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              color: '#091326',
              padding: '8px 18px',
              borderRadius: '999px',
              border: '2px solid #091326',
              fontWeight: 700,
              fontSize: '1.15rem',
            }}
          >
            ✋ {ejercicioActual.palabra_o_sena}
          </div>
        </div>

        {/* Bloque de narrativa debajo de la ilustración (Adaptativo según perfil: NO_LECTOR vs LECTOR) */}
        <div
          className="card-aaa"
          style={{
            marginBottom: '18px',
            textAlign: 'center',
            padding: '16px',
          }}
        >
          {esNoLector ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '16px',
                fontSize: '2.4rem',
              }}
              aria-label={`Pictograma de la escena: ${ejercicioActual.palabra_o_sena}`}
            >
              <span>👀</span>
              <span>➡️</span>
              <span>✋ {cuentoAbierto.imagen_portada}</span>
            </div>
          ) : (
            <>
              <p
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '1.08rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                {cuentoAbierto.descripcion}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  color: 'var(--text-secondary)',
                }}
              >
                Escena {escenaActual + 1}: Practica la seña{' '}
                <strong>&ldquo;{ejercicioActual.palabra_o_sena}&rdquo;</strong>
              </p>
            </>
          )}

          {/* Selector de escenas / palabras del cuento */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              marginTop: '12px',
            }}
          >
            {ejerciciosCuento.map((ej, idx) => (
              <button
                key={ej.id_ejercicio}
                type="button"
                onClick={() => setEscenaActual(idx)}
                style={{
                  minHeight: '48px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border:
                    idx === escenaActual
                      ? '3px solid var(--primary-aaa)'
                      : '2px solid var(--border-subtle)',
                  backgroundColor:
                    idx === escenaActual ? 'var(--bg-card-highlight)' : '#FFFFFF',
                  color: '#091326',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {idx + 1}. {ej.palabra_o_sena}
              </button>
            ))}
          </div>
        </div>

        {/* Fila inferior idéntica al boceto "Narrativa de cuento": Botón circular Play + Barra de progreso */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 14px',
            borderRadius: '18px',
            backgroundColor: 'var(--bg-app)',
            border: '2px solid var(--border-subtle)',
            marginBottom: '16px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setReproduciendoNarrativa((prev) => !prev);
              if (escenaActual + 1 < totalEscenas) {
                setEscenaActual((prev) => prev + 1);
              } else {
                setEscenaActual(0);
              }
            }}
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#1E293B',
              color: '#FFFFFF',
              border: '3px solid #091326',
              fontSize: '1.3rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            aria-label={reproduciendoNarrativa ? 'Avanzar escena' : 'Reproducir escena'}
          >
            ▶
          </button>

          <div style={{ flex: 1 }}>
            <div className="progress-track-aaa">
              <div
                className="progress-fill-aaa"
                style={{ width: `${porcentajeBarra}%` }}
              />
            </div>
            {!esNoLector && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  marginTop: '4px',
                }}
              >
                <span>Progreso de la narrativa</span>
                <span>{porcentajeBarra}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Acciones de flujo completo: Ir al Ejercicio de Seña (Módulo 1) o Completar Cuento (+30 ★) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            className="btn-primary-aaa"
            style={{ width: '100%' }}
            onClick={() =>
              onPracticarEjercicio(
                cuentoAbierto.tipo,
                ejercicioActual.palabra_o_sena,
                ejercicioActual.id_ejercicio,
                cuentoAbierto.id_cuento
              )
            }
          >
            <span>📹</span>
            <span>
              {esNoLector
                ? `✋ ${ejercicioActual.palabra_o_sena}`
                : `Practicar "${ejercicioActual.palabra_o_sena}" en cámara`}
            </span>
          </button>

          <button
            type="button"
            className="btn-success-aaa"
            style={{ width: '100%' }}
            onClick={async () => {
              await onCompletarCuento(cuentoAbierto.id_cuento);
              setSubVista('BIBLIOTECA');
            }}
          >
            <span>★</span>
            <span>
              {esNoLector
                ? '✓ +30 ★'
                : 'Terminar cuento y ganar +30 ★'}
            </span>
          </button>
        </div>
      </section>
    );
  }

  // ===========================================================================
  // SUB-VISTA B: CATÁLOGO DE CUENTOS LSM
  // (Mockup 2 Fase 2, Act. 6, p. 9: "Biblioteca de Cuentos LSM" + Boceto Fase 1 "Catálogo de cuentos")
  // ===========================================================================
  if (subVista === 'BIBLIOTECA') {
    return (
      <section aria-labelledby="titulo-biblioteca-cuentos">
        {/* Cabecera con botón "←" y título "Biblioteca de Cuentos LSM" */}
        <div className="screen-back-header">
          <button
            type="button"
            className="btn-back-circle"
            onClick={() => setSubVista('MENU')}
            aria-label="Volver al Menú Principal"
          >
            ←
          </button>
          <div>
            <h1
              id="titulo-biblioteca-cuentos"
              style={{ margin: 0, fontSize: '1.25rem' }}
            >
              📖 {esNoLector ? 'Cuentos' : 'Biblioteca de Cuentos LSM'}
            </h1>
            {!esNoLector && (
              <p
                style={{
                  margin: 0,
                  fontSize: '0.84rem',
                  color: 'var(--text-secondary)',
                }}
              >
                Aprende señas mediante historias visuales
              </p>
            )}
          </div>
        </div>

        {/* Filtros por Nivel de Lectura (3 cuentos por nivel en PostgreSQL) */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            marginBottom: '14px',
          }}
        >
          {(
            [
              { id: 'TODOS', label: esNoLector ? '🌈 (9)' : 'Todos (9)' },
              { id: 'NO_LECTOR', label: esNoLector ? '🌱 1' : '🌱 Nivel 1' },
              { id: 'LECTURA_INICIAL', label: esNoLector ? '🌿 2' : '🌿 Nivel 2' },
              { id: 'LECTOR_AVANZADO', label: esNoLector ? '🌳 3' : '🌳 Nivel 3' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFiltroNivel(tab.id)}
              style={{
                minHeight: '48px',
                flex: 1,
                padding: '6px 10px',
                borderRadius: '12px',
                border:
                  filtroNivel === tab.id
                    ? '3px solid var(--primary-aaa)'
                    : '2px solid var(--border-subtle)',
                backgroundColor:
                  filtroNivel === tab.id ? 'var(--bg-card-highlight)' : '#FFFFFF',
                color: '#091326',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lista de Tarjetas de Cuentos idénticas al Mockup 2 ("El Conejito y la Luna", "Un Día en el Parque", etc.) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cuentosFiltrados.map((cuento, idx) => {
            const completado = cuento.progreso_usuario?.estado === 'COMPLETADO';
            const enProgreso = cuento.progreso_usuario?.estado === 'EN_PROGRESO';
            const listaSenas = (cuento.ejercicios || [])
              .map((e) => e.palabra_o_sena)
              .join(', ');

            return (
              <article
                key={cuento.id_cuento}
                className="card-aaa"
                style={{
                  padding: '16px',
                  borderRadius: '20px',
                  border: completado
                    ? '2px solid var(--success-border)'
                    : '2px solid var(--border-subtle)',
                }}
              >
                {/* Fila superior del Mockup 2: "🌱 Nivel 1 | ⏱ 5 min" a la izquierda, estrellas o "% completado" a la derecha */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        backgroundColor: '#DCFCE7',
                        color: '#065F46',
                        padding: '3px 10px',
                        borderRadius: '999px',
                      }}
                    >
                      {etiquetaNivelCuento(cuento.nivel_lectura)}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      ⏱ {4 + (idx % 3)} min
                    </span>
                  </div>

                  <div>
                    {completado ? (
                      <span style={{ color: '#D97706', fontSize: '1rem' }}>
                        ★★★
                      </span>
                    ) : enProgreso ? (
                      <span style={{ color: 'var(--primary-aaa)' }}>
                        60% completado
                      </span>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '1rem' }}>
                        ☆☆☆
                      </span>
                    )}
                  </div>
                </div>

                {/* Ilustración central pastel con ícono grande (Mockup 2) */}
                <div
                  style={{
                    backgroundColor:
                      FONDOS_PASTEL_CUENTO[cuento.id_cuento] || '#EDE9FE',
                    borderRadius: '16px',
                    padding: '24px 16px',
                    textAlign: 'center',
                    fontSize: '3.6rem',
                    marginBottom: '12px',
                  }}
                  aria-hidden="true"
                >
                  {cuento.imagen_portada || '🐰🌙'}
                </div>

                {/* Píldora rosa de señas incluidas: "✨ Señas: Hola, Luna, Conejo, Dormir" */}
                <div style={{ marginBottom: '8px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#FCE7F3',
                      color: '#9D174D',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      padding: '4px 10px',
                      borderRadius: '999px',
                    }}
                  >
                    ✨ {esNoLector ? listaSenas : `Señas: ${listaSenas}`}
                  </span>
                </div>

                {/* Título y descripción del cuento (sin párrafo largo cuando el perfil es NO_LECTOR) */}
                <h2 style={{ margin: '4px 0', fontSize: '1.18rem' }}>
                  {cuento.titulo}
                </h2>
                {!esNoLector && (
                  <p
                    style={{
                      margin: '4px 0 14px 0',
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {cuento.descripcion}
                  </p>
                )}

                {/* Botón ancho completo idéntico al Mockup 2: "▶ Continuar" o "▶ Abrir Cuento" */}
                <button
                  type="button"
                  className="btn-primary-aaa"
                  style={{
                    width: '100%',
                    marginTop: esNoLector ? '10px' : '0',
                    backgroundColor: '#2563EB',
                  }}
                  onClick={() => handleAbrirNarrativa(cuento)}
                >
                  <span>▶</span>
                  <span>
                    {esNoLector
                      ? 'Jugar'
                      : enProgreso
                      ? 'Continuar'
                      : 'Abrir Cuento'}
                  </span>
                </button>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  // ===========================================================================
  // SUB-VISTA A: MENÚ PRINCIPAL (Mockup 1 Fase 2, Act. 6, p. 9 + Boceto "Menú principal" Fase 1)
  // - Tarjeta de bienvenida: Avatar circular + "¡BIENVENIDO DE VUELTA!" + "¡Hola, Leo!" + "★ 12"
  // - Misión de Hoy (2 de 3 logradas): 3 círculos (Seña "Hola", Boca "A-O", Cuento Conejo)
  // - Tarjeta Módulo 1: "Aprende LSM" ("Lengua de señas") + botón azul "▶ Jugar Cuentos"
  // - Tarjeta Módulo 2: "Habla y Pronuncia" ("Articulación oral") + botón verde/teal "🎙 Entrenar Boca"
  // - Barra "Tu progreso" con ★ + "Mis Trofeos Ganados" (Super Estrella, Manita Maestra, Voz Clara)
  // - Zona Protegida: "Modo Padres y Terapeutas" + botón "Entrar"
  // ===========================================================================
  return (
    <section aria-labelledby="titulo-menu-principal">
      {/* 1. Cabecera de bienvenida idéntica al Mockup 1 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#DBEAFE',
              border: '3px solid #2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            🧒🏽
          </div>
          <div>
            {!esNoLector && (
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#2563EB',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                ¡BIENVENIDO DE VUELTA!
              </div>
            )}
            <h1
              id="titulo-menu-principal"
              style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}
            >
              ¡Hola, {nombreCorto}!
            </h1>
          </div>
        </div>

        {/* Contador amarillo de estrellas en esquina superior derecha */}
        <div className="star-counter-badge">
          <span>★</span>
          <span>{perfilActivo.puntos_acumulados}</span>
        </div>
      </div>

      {/* Selector rápido de perfil adaptativo (para demostrar el cambio en vivo entre No Lector y Lector Inicial) */}
      {perfiles.length > 1 && onSelectPerfil && (
        <div
          style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '14px',
          }}
          role="group"
          aria-label="Cambiar perfil adaptativo activo"
        >
          {perfiles.map((p) => {
            const activo = p.id_perfil === perfilActivo.id_perfil;
            const apodo = p.nombre_apodo.split('(')[0].trim();
            return (
              <button
                key={p.id_perfil}
                type="button"
                onClick={() => onSelectPerfil(p)}
                style={{
                  flex: 1,
                  minHeight: '48px',
                  padding: '6px 10px',
                  borderRadius: '12px',
                  border: activo
                    ? '3px solid var(--primary-aaa)'
                    : '2px solid var(--border-subtle)',
                  backgroundColor: activo
                    ? 'var(--bg-card-highlight)'
                    : 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                {p.nivel_lectura === 'NO_LECTOR'
                  ? `👧🏻 ${apodo} (No Lector)`
                  : `🧒🏽 ${apodo} (Lector)`}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Tarjeta "Misión de Hoy" (idéntica al Mockup 1 Fase 2, Act. 6, p. 9) */}
      <div
        className="card-aaa"
        style={{
          marginBottom: '14px',
          padding: '14px',
          backgroundColor: 'var(--bg-app)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <strong style={{ fontSize: '0.92rem' }}>
            🎯 {esNoLector ? 'Hoy' : 'Misión de Hoy'}
          </strong>
          {!esNoLector && (
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#2563EB',
                backgroundColor: '#DBEAFE',
                padding: '2px 8px',
                borderRadius: '999px',
              }}
            >
              2 de 3 logradas
            </span>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: '#DCFCE7',
              border: '2px solid #10B981',
              borderRadius: '14px',
              padding: '8px 4px',
            }}
          >
            <div style={{ fontSize: '1.35rem', color: '#047857', fontWeight: 700 }}>
              ✓
            </div>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#064E3B' }}>
              {esNoLector ? '✋' : 'Seña "Hola"'}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#DCFCE7',
              border: '2px solid #10B981',
              borderRadius: '14px',
              padding: '8px 4px',
            }}
          >
            <div style={{ fontSize: '1.35rem', color: '#047857', fontWeight: 700 }}>
              ✓
            </div>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#064E3B' }}>
              {esNoLector ? '👄' : 'Boca "A-O"'}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '8px 4px',
            }}
          >
            <div style={{ fontSize: '1.35rem', color: '#D97706' }}>☆</div>
            <div
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
              }}
            >
              {esNoLector ? '🐰' : 'Cuento Conejo'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tarjeta Módulo 1: "Aprende LSM" / "Lengua de señas" (Mockup 1 + Boceto Fase 1) */}
      <div
        className="card-aaa"
        style={{
          marginBottom: '14px',
          padding: '16px',
          border: '2px solid #93C5FD',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#DBEAFE',
                color: '#1E40AF',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
                marginBottom: '6px',
              }}
            >
              👁 {esNoLector ? 'LSM' : 'Visual & Espacial'}
            </span>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem' }}>
              {esNoLector ? 'Lengua de señas' : 'Aprende LSM'}
            </h2>
            {!esNoLector && (
              <p
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                }}
              >
                Cuentos animados y retos con cámara para comunicarte con tus manos.
              </p>
            )}
          </div>

          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              border: '2px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            ✋
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn-primary-aaa"
            style={{
              flex: 1,
              backgroundColor: '#2563EB',
              borderRadius: '14px',
            }}
            onClick={() => setSubVista('BIBLIOTECA')}
          >
            <span>▶</span>
            <span>{esNoLector ? '📖 Cuentos' : 'Jugar Cuentos'}</span>
          </button>

          <button
            type="button"
            className="btn-secondary-aaa"
            style={{ borderRadius: '14px' }}
            onClick={() => onNavigate('PRACTICA_V2', '/practica-v2')}
            aria-label="Ir directo a práctica de seña con cámara"
          >
            📹 {esNoLector ? '' : 'Cámara'}
          </button>
        </div>
      </div>

      {/* 4. Tarjeta Módulo 2: "Habla y Pronuncia" / "Articulación oral" (Mockup 1 + Boceto Fase 1) */}
      <div
        className="card-aaa"
        style={{
          marginBottom: '14px',
          padding: '16px',
          border: '2px solid #99F6E4',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#CCFBF1',
                color: '#115E59',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
                marginBottom: '6px',
              }}
            >
              👄 {esNoLector ? 'Habla' : 'Espejo & Fonemas'}
            </span>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem' }}>
              {esNoLector ? 'Articulación oral' : 'Habla y Pronuncia'}
            </h2>
            {!esNoLector && (
              <p
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                }}
              >
                Mira cómo se mueve la boca e imita sonidos frente al espejo mágico.
              </p>
            )}
          </div>

          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#F0FDFA',
              border: '2px solid #99F6E4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            🗣️
          </div>
        </div>

        <button
          type="button"
          className="btn-primary-aaa"
          style={{
            width: '100%',
            backgroundColor: '#0D9488',
            borderColor: '#0F766E',
            borderRadius: '14px',
          }}
          onClick={() => onNavigate('MODULO_2_ARTICULACION', '/articulacion')}
        >
          <span>🎙</span>
          <span>{esNoLector ? '👄 Boca' : 'Entrenar Boca'}</span>
        </button>
      </div>

      {/* 5. Barra "Tu progreso" (Boceto Fase 1 "Menú principal") + "Mis Trofeos Ganados" (Mockup 1) */}
      <div
        className="card-aaa"
        style={{
          marginBottom: '14px',
          padding: '14px',
        }}
      >
        {/* Barra "Tu progreso" con ★ del boceto Fase 1 */}
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.88rem',
              fontWeight: 700,
              marginBottom: '6px',
            }}
          >
            <span>{esNoLector ? '★' : 'Tu progreso'}</span>
            <span>★ {perfilActivo.puntos_acumulados} pts</span>
          </div>
          <div className="progress-track-aaa">
            <div
              className="progress-fill-aaa"
              style={{
                width: `${Math.min(100, Math.round((perfilActivo.puntos_acumulados / 150) * 100))}%`,
              }}
            />
          </div>
        </div>

        <div
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            marginBottom: '8px',
          }}
        >
          🏆 {esNoLector ? 'Trofeos' : 'Mis Trofeos Ganados (Toca para canjear ★)'}
        </div>

        {estadoCanje && (
          <div
            style={{
              marginBottom: '10px',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: estadoCanje.ok ? 'var(--success-bg)' : 'var(--warn-bg)',
              border: `2px solid ${
                estadoCanje.ok ? 'var(--success-border)' : 'var(--warn-border)'
              }`,
              color: estadoCanje.ok ? 'var(--success-text)' : 'var(--warn-text)',
              fontSize: '0.84rem',
              fontWeight: 700,
            }}
            role="status"
          >
            {estadoCanje.ok ? '✓ ' : '⚠️ '}
            {estadoCanje.mensaje}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
          }}
        >
          {recompensas.map((rec) => (
            <button
              key={rec.id_recompensa}
              type="button"
              onClick={async () => {
                if (!rec.desbloqueada) {
                  const res = await onCanjearRecompensa(rec.id_recompensa);
                  setEstadoCanje(res);
                }
              }}
              style={{
                minHeight: '78px',
                padding: '8px 6px',
                borderRadius: '14px',
                border: rec.desbloqueada
                  ? '2px solid #F59E0B'
                  : '2px solid var(--border-subtle)',
                backgroundColor: rec.desbloqueada ? '#FEF3C7' : 'var(--bg-app)',
                color: '#091326',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: rec.desbloqueada ? 'default' : 'pointer',
                fontWeight: 700,
              }}
              title={
                rec.desbloqueada
                  ? `${rec.nombre} (Ya canjeado)`
                  : `Canjear ${rec.nombre} por ${rec.costo_puntos} estrellas`
              }
            >
              <span style={{ fontSize: '1.6rem' }} aria-hidden="true">
                {rec.icono_url}
              </span>
              <span style={{ fontSize: '0.72rem', lineHeight: 1.15 }}>
                {esNoLector ? `★ ${rec.costo_puntos}` : rec.nombre}
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: rec.desbloqueada ? '#047857' : '#004488',
                }}
              >
                {rec.desbloqueada ? '✓ Ganado' : `Canjear (${rec.costo_puntos}★)`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Zona Protegida: "Modo Padres y Terapeutas" + botón "Entrar" (idéntico al Mockup 1) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          padding: '12px 14px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-app)',
          border: '2px solid var(--border-subtle)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            🛡 ZONA PROTEGIDA
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>
            {esNoLector ? '👨‍👩‍👧 Tutor' : 'Modo Padres y Terapeutas'}
          </div>
          {!esNoLector && (
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Ver avances y configurar niveles
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn-secondary-aaa"
          style={{ padding: '8px 16px', borderRadius: '12px' }}
          onClick={() => onNavigate('PANEL_TUTOR', '/tutor')}
        >
          Entrar
        </button>
      </div>
    </section>
  );
};
