import React, { useState } from 'react';
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
  cuentos: Cuento[];
  recompensas: Recompensa[];
  onNavigate: (vista: VistaActiva) => void;
  onCompletarCuento: (id_cuento: number) => Promise<void>;
  onCanjearRecompensa: (id_recompensa: number) => Promise<void>;
  onPracticarEjercicio: (tipo: TipoCuento, palabra: string, idEjercicio: number) => void;
}

const ILUSTRACIONES_CUENTO: Record<number, { emoji: string; fondo: string }> = {
  1: { emoji: '🐰🌙', fondo: '#DBEAFE' },
  2: { emoji: '🐱🏠', fondo: '#FEF3C7' },
  3: { emoji: '🏫📚', fondo: '#DCFCE7' },
  4: { emoji: '👩🏽‍🍼🎵', fondo: '#F3E8FF' },
  5: { emoji: '☀️🏡', fondo: '#FFEDD5' },
  6: { emoji: '🚂✨', fondo: '#E0E7FF' },
};

export const CatalogoCuentosView: React.FC<CatalogoCuentosViewProps> = ({
  perfilActivo,
  cuentos,
  recompensas,
  onNavigate,
  onCompletarCuento,
  onCanjearRecompensa,
  onPracticarEjercicio,
}) => {
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | TipoCuento>('TODOS');
  const [filtroNivel, setFiltroNivel] = useState<'TODOS' | NivelLectura>('TODOS');
  const [cuentoAbierto, setCuentoAbierto] = useState<Cuento | null>(null);
  const [escenaActual, setEscenaActual] = useState(0);
  const [velocidadAvatar, setVelocidadAvatar] = useState<0.5 | 1.0>(1.0);
  const [anguloRotacion3D, setAnguloRotacion3D] = useState<number>(0);
  const [pausado, setPausado] = useState<boolean>(false);
  const [mensajeCanje, setMensajeCanje] = useState<string | null>(null);

  const nombreCorto = perfilActivo.nombre_apodo.split('(')[0].trim();
  const esNoLector = perfilActivo.nivel_lectura === 'NO_LECTOR';

  const cuentosFiltrados = cuentos.filter((c) => {
    if (filtroTipo !== 'TODOS' && c.tipo !== filtroTipo) return false;
    if (filtroNivel !== 'TODOS' && c.nivel_lectura !== filtroNivel) return false;
    return true;
  });

  const handleAbrirCuento = (cuento: Cuento) => {
    setCuentoAbierto(cuento);
    setEscenaActual(0);
    setPausado(false);
    setAnguloRotacion3D(0);
  };

  return (
    <section aria-labelledby="titulo-menu-principal">
      {/* =====================================================================
          SECCIÓN 1: BIENVENIDA Y MISIÓN DE HOY (MOCKUP 1 - FASE 2, ACT. 6)
         ===================================================================== */}
      <div
        className="card-aaa"
        style={{
          marginBottom: '22px',
          border: '3px solid var(--primary-aaa)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '18px',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--primary-aaa)',
                textTransform: 'uppercase',
              }}
            >
              ¡BIENVENIDO DE VUELTA!
            </span>
            <h1 id="titulo-menu-principal" style={{ margin: '4px 0', fontSize: '2rem' }}>
              ¡Hola, {nombreCorto}! 👋
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Modo adaptado: <strong>Sordera {perfilActivo.tipo_sordera}</strong> •{' '}
              <strong>{perfilActivo.nivel_lectura.replace('_', ' ')}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="star-counter-badge" style={{ fontSize: '1.25rem', padding: '10px 20px' }}>
              ⭐ {perfilActivo.puntos_acumulados} Estrellas
            </div>
          </div>
        </div>

        {/* Misión de Hoy (2 de 3 logradas) exactamente como en el Mockup 1 */}
        <div
          style={{
            backgroundColor: 'var(--bg-app)',
            borderRadius: '16px',
            padding: '16px',
            border: '2px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <strong style={{ fontSize: '1.08rem' }}>🎯 Misión de Hoy</strong>
            <span className="badge-aaa badge-success">2 de 3 logradas</span>
          </div>
          <div className="grid-3-cols">
            <button
              type="button"
              className="btn-secondary-aaa"
              style={{
                justifyContent: 'flex-start',
                backgroundColor: 'var(--success-bg)',
                borderColor: 'var(--success-border)',
                color: 'var(--success-text)',
              }}
              onClick={() => onPracticarEjercicio('LSM', 'HOLA (Saludo)', 1)}
            >
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              <div style={{ textAlign: 'left' }}>
                <div>Seña &quot;Hola&quot;</div>
                <small>Completada (+20 ⭐)</small>
              </div>
            </button>

            <button
              type="button"
              className="btn-secondary-aaa"
              style={{
                justifyContent: 'flex-start',
                backgroundColor: 'var(--success-bg)',
                borderColor: 'var(--success-border)',
                color: 'var(--success-text)',
              }}
              onClick={() => onPracticarEjercicio('ARTICULACION', '/m/ - /a/ • MA-MÁ', 10)}
            >
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              <div style={{ textAlign: 'left' }}>
                <div>Boca &quot;MA-MÁ&quot;</div>
                <small>Completada (+25 ⭐)</small>
              </div>
            </button>

            <button
              type="button"
              className="btn-secondary-aaa"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => {
                const cConejo = cuentos.find((c) => c.id_cuento === 1) || cuentos[0];
                if (cConejo) handleAbrirCuento(cConejo);
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>⭐</span>
              <div style={{ textAlign: 'left' }}>
                <div>Cuento &quot;Conejo&quot;</div>
                <small>¡Toca para abrir! (+30 ⭐)</small>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          SECCIÓN 2: LOS DOS MÓDULOS PRINCIPALES (RF-03 / MOCKUP 1)
         ===================================================================== */}
      <div className="grid-2-cols" style={{ marginBottom: '26px' }}>
        {/* Módulo 1: Lengua de Señas Mexicana (LSM) */}
        <div
          className="card-aaa"
          style={{
            border: '3px solid var(--primary-aaa)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <span className="badge-aaa badge-lsm">👁️ Visual &amp; Espacial • Módulo 1</span>
              <span style={{ fontSize: '2.4rem' }} aria-hidden="true">
                🤟🏽
              </span>
            </div>
            <h2 style={{ margin: '6px 0' }}>Aprende LSM (Lengua de Señas)</h2>
            {!esNoLector && (
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                Mira los cuentos animados con el avatar 3D y practica señas con tus manos
                frente a la cámara con Realidad Aumentada.
              </p>
            )}
          </div>
          <button
            type="button"
            className="btn-primary-aaa"
            style={{ width: '100%', marginTop: '12px' }}
            onClick={() => onNavigate('MODULO_1_LSM')}
          >
            ▶ Jugar Sesión de Señas (Cámara AR)
          </button>
        </div>

        {/* Módulo 2: Articulación Oral */}
        <div
          className="card-aaa"
          style={{
            border: '3px solid var(--purple-aaa)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <span className="badge-aaa badge-articulacion">
                👄 Espejo &amp; Fonemas • Módulo 2
              </span>
              <span style={{ fontSize: '2.4rem' }} aria-hidden="true">
                🗣️
              </span>
            </div>
            <h2 style={{ margin: '6px 0' }}>Habla y Pronuncia</h2>
            {!esNoLector && (
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                Mira cómo se mueve la boca del terapeuta en cámara lenta frente al espejo AR
                y repite los fonemas paso a paso.
              </p>
            )}
          </div>
          <button
            type="button"
            className="btn-purple-aaa"
            style={{ width: '100%', marginTop: '12px' }}
            onClick={() => onNavigate('MODULO_2_ARTICULACION')}
          >
            🎙️ Entrenar Boca (Espejo AR)
          </button>
        </div>
      </div>

      {/* =====================================================================
          MODAL / VISOR INTERACTIVO DE NARRATIVA DE CUENTO (CU-04 / RF-05 / RF-14)
          Con Avatar 3D Gesticulador MOD-3D-01 (Velocidad 0.5x/1.0x y Rotación 360°)
         ===================================================================== */}
      {cuentoAbierto && (
        <div
          className="card-aaa"
          style={{
            marginBottom: '28px',
            border: '4px solid var(--primary-aaa)',
            backgroundColor: 'var(--bg-card-highlight)',
          }}
          role="region"
          aria-label={`Reproductor interactivo del cuento ${cuentoAbierto.titulo}`}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div>
              <span className="badge-aaa badge-lsm">
                📖 Narrativa Interactiva DUA (RF-05 / RF-14 • Doble Canal: LSM + Subtítulos)
              </span>
              <h2 style={{ margin: '6px 0 0 0' }}>{cuentoAbierto.titulo}</h2>
            </div>
            <button
              type="button"
              className="btn-secondary-aaa"
              onClick={() => setCuentoAbierto(null)}
            >
              ⬅ Regresar al Catálogo (CU-03)
            </button>
          </div>

          <div className="grid-2-cols">
            {/* Escenario del Avatar Gesticulador MOD-3D-01 */}
            <div
              className="card-aaa"
              style={{
                textAlign: 'center',
                backgroundColor: 'var(--bg-surface)',
                border: '3px solid var(--border-strong)',
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
                <span className="badge-aaa badge-lsm">
                  🤖 MOD-3D-01: Avatar Gesticulador LSM
                </span>
                <span className="badge-aaa badge-articulacion">
                  Ángulo: {anguloRotacion3D}° | Vel: {velocidadAvatar}x
                </span>
              </div>

              <div
                style={{
                  padding: '28px 16px',
                  borderRadius: '18px',
                  backgroundColor:
                    ILUSTRACIONES_CUENTO[cuentoAbierto.id_cuento]?.fondo || '#DBEAFE',
                  color: '#091326',
                  marginBottom: '14px',
                  transform: `rotateY(${anguloRotacion3D}deg)`,
                  transition: 'transform 0.4s ease',
                }}
              >
                <div style={{ fontSize: '4.4rem', lineHeight: 1.1 }}>
                  {ILUSTRACIONES_CUENTO[cuentoAbierto.id_cuento]?.emoji || '🐰🌙'}
                </div>
                <div
                  style={{
                    marginTop: '12px',
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    backgroundColor: '#FFFFFF',
                    color: '#091326',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: '2px solid #091326',
                  }}
                >
                  Seña / Palabra Clave #{escenaActual + 1}:{' '}
                  <span style={{ color: '#004488' }}>
                    {cuentoAbierto.ejercicios?.[escenaActual]?.palabra_o_sena ||
                      'HOLA (Saludo)'}
                  </span>
                </div>
              </div>

              {/* Controles de Accesibilidad del Modelo 3D (Fase 2, Act. 2 y RF-14) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn-secondary-aaa"
                  onClick={() => setPausado((p) => !p)}
                >
                  {pausado ? '▶ Reanudar Narración' : '⏸ Pausar Cuento (RF-14)'}
                </button>
                <button
                  type="button"
                  className="btn-secondary-aaa"
                  onClick={() =>
                    setVelocidadAvatar((v) => (v === 1.0 ? 0.5 : 1.0))
                  }
                >
                  🐢 Velocidad: {velocidadAvatar === 1.0 ? 'Normal (1.0x)' : 'Cámara Lenta (0.5x)'}
                </button>
                <button
                  type="button"
                  className="btn-secondary-aaa"
                  onClick={() => setAnguloRotacion3D((ang) => (ang + 45) % 360)}
                >
                  🔄 Rotar Avatar 360° ({anguloRotacion3D}°)
                </button>
              </div>
            </div>

            {/* Subtítulos Sincronizados y Nodos de Interacción con Cámara */}
            <div
              className="card-aaa"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ marginTop: 0 }}>
                  💬 Subtítulos Sincronizados y Nodos de Práctica
                </h3>
                <p style={{ fontSize: '1.12rem', fontWeight: 600 }}>
                  {cuentoAbierto.descripcion}
                </p>

                <div style={{ margin: '16px 0' }}>
                  <strong>Palabras / Señas de este cuento ({cuentoAbierto.ejercicios?.length || 0}):</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                    {(cuentoAbierto.ejercicios || []).map((ej, idx) => (
                      <button
                        key={ej.id_ejercicio}
                        type="button"
                        className={
                          idx === escenaActual ? 'btn-primary-aaa' : 'btn-secondary-aaa'
                        }
                        onClick={() => setEscenaActual(idx)}
                      >
                        {idx + 1}. {ej.palabra_o_sena}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn-primary-aaa"
                  onClick={() => {
                    const ej = cuentoAbierto.ejercicios?.[escenaActual];
                    onPracticarEjercicio(
                      cuentoAbierto.tipo,
                      ej?.palabra_o_sena || 'HOLA (Saludo)',
                      ej?.id_ejercicio || 1
                    );
                  }}
                >
                  📷 Practicar en Cámara AR: &quot;
                  {cuentoAbierto.ejercicios?.[escenaActual]?.palabra_o_sena || 'HOLA'}&quot;
                </button>

                <button
                  type="button"
                  className="btn-success-aaa"
                  onClick={async () => {
                    await onCompletarCuento(cuentoAbierto.id_cuento);
                    setCuentoAbierto(null);
                  }}
                >
                  🏆 Finalizar Cuento (+30 ⭐)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECCIÓN 3: BIBLIOTECA DE CUENTOS LSM Y ARTICULACIÓN (MOCKUP 2 - ACT. 6)
         ===================================================================== */}
      <div className="card-aaa" style={{ marginBottom: '26px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '18px',
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>📚 Biblioteca de Cuentos Interactivos (RF-04 / RF-08)</h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
              Cuentos ordenados progresivamente por nivel de lectura y número de palabras clave.
            </p>
          </div>

          {/* Filtros accesibles */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(['TODOS', 'LSM', 'ARTICULACION'] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={filtroTipo === t ? 'btn-primary-aaa' : 'btn-secondary-aaa'}
                onClick={() => setFiltroTipo(t)}
              >
                {t === 'TODOS'
                  ? '📋 Todos los Módulos'
                  : t === 'LSM'
                  ? '🤟 Módulo 1: LSM'
                  : '👄 Módulo 2: Articulación'}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por Nivel de Lectura DUA */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          {(['TODOS', 'NO_LECTOR', 'LECTURA_INICIAL', 'LECTOR_AVANZADO'] as const).map(
            (niv) => (
              <button
                key={niv}
                type="button"
                className={filtroNivel === niv ? 'btn-primary-aaa' : 'btn-secondary-aaa'}
                onClick={() => setFiltroNivel(niv)}
                style={{ fontSize: '0.92rem' }}
              >
                {niv === 'TODOS'
                  ? '🌈 Todos los Niveles'
                  : niv === 'NO_LECTOR'
                  ? '🟢 Nivel 1: No Lector (1-3 palabras)'
                  : niv === 'LECTURA_INICIAL'
                  ? '🔵 Nivel 2: Lectura Inicial (3-5 palabras)'
                  : '🟣 Nivel 3: Lector Avanzado (7-8 palabras)'}
              </button>
            )
          )}
        </div>

        {/* Tarjetas del Catálogo de Cuentos */}
        <div className="grid-3-cols">
          {cuentosFiltrados.map((cuento) => {
            const ilustracion = ILUSTRACIONES_CUENTO[cuento.id_cuento] || {
              emoji: '📖✨',
              fondo: '#DBEAFE',
            };
            const completado = cuento.progreso_usuario?.estado === 'COMPLETADO';
            const enProgreso = cuento.progreso_usuario?.estado === 'EN_PROGRESO';
            const porcentajeAvance = completado ? 100 : enProgreso ? 60 : 0;

            return (
              <article
                key={cuento.id_cuento}
                className="card-aaa-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Cabecera de Nivel y Duración (Mockup 2: Nivel 1 | 5 min | ⭐⭐⭐) */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                      flexWrap: 'wrap',
                      gap: '6px',
                    }}
                  >
                    <span
                      className={`badge-aaa ${
                        cuento.tipo === 'LSM' ? 'badge-lsm' : 'badge-articulacion'
                      }`}
                    >
                      {cuento.tipo === 'LSM' ? '🤟 LSM' : '👄 Articulación'} • Nivel{' '}
                      {cuento.orden_dificultad}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      ⏱️ 5 min • {cuento.num_palabras} palabras
                    </span>
                  </div>

                  {/* Portada Ilustrada de Alto Contraste */}
                  <div
                    style={{
                      backgroundColor: ilustracion.fondo,
                      borderRadius: '16px',
                      padding: '24px 16px',
                      textAlign: 'center',
                      fontSize: '3.6rem',
                      marginBottom: '14px',
                      border: '2px solid #091326',
                    }}
                    aria-hidden="true"
                  >
                    {ilustracion.emoji}
                  </div>

                  {/* Etiquetas de señas / palabras clave */}
                  <div
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'var(--primary-aaa)',
                      marginBottom: '6px',
                    }}
                  >
                    🎯 Señas/Palabras:{' '}
                    {(cuento.ejercicios || [])
                      .map((e) => e.palabra_o_sena)
                      .join(', ') || 'Hola, Luna, Conejo'}
                  </div>

                  <h3 style={{ margin: '6px 0', fontSize: '1.25rem' }}>{cuento.titulo}</h3>

                  {!esNoLector && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      {cuento.descripcion}
                    </p>
                  )}
                </div>

                <div style={{ marginTop: '14px' }}>
                  {/* Barra de Progreso (Mockup 2: 60% completado) */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      marginBottom: '6px',
                    }}
                  >
                    <span>
                      {completado
                        ? '✅ Completado'
                        : enProgreso
                        ? '⏳ En progreso'
                        : '✨ Listo para explorar'}
                    </span>
                    <span>{porcentajeAvance}% completado</span>
                  </div>
                  <div className="progress-track-aaa" style={{ marginBottom: '14px' }}>
                    <div
                      className={
                        completado ? 'progress-fill-success' : 'progress-fill-aaa'
                      }
                      style={{ width: `${porcentajeAvance}%` }}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn-primary-aaa"
                    style={{ width: '100%' }}
                    onClick={() => handleAbrirCuento(cuento)}
                  >
                    ▶ Abrir Cuento
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          SECCIÓN 4: MIS TROFEOS GANADOS Y CANJE DE RECOMPENSAS (RF-11 / CU-09)
         ===================================================================== */}
      <div className="card-aaa" style={{ marginBottom: '26px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '14px',
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>🏆 Mis Trofeos Ganados y Recompensas (CU-09 / RF-11)</h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
              Canjea tus estrellas acumuladas ({perfilActivo.puntos_acumulados} ⭐) por insignias y
              accesorios para tu avatar:
            </p>
          </div>
        </div>

        {mensajeCanje && (
          <div
            className="card-aaa"
            style={{
              marginBottom: '16px',
              backgroundColor: 'var(--success-bg)',
              borderColor: 'var(--success-border)',
              color: 'var(--success-text)',
              fontWeight: 700,
            }}
            role="status"
          >
            {mensajeCanje}
          </div>
        )}

        <div className="grid-3-cols">
          {recompensas.map((rec) => (
            <div
              key={rec.id_recompensa}
              className="card-aaa"
              style={{
                textAlign: 'center',
                backgroundColor: rec.desbloqueada
                  ? 'var(--success-bg)'
                  : 'var(--bg-surface)',
                borderColor: rec.desbloqueada
                  ? 'var(--success-border)'
                  : 'var(--border-strong)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '6px' }} aria-hidden="true">
                {rec.icono_url}
              </div>
              <h3 style={{ margin: '4px 0' }}>{rec.nombre}</h3>
              <p style={{ margin: '4px 0 12px 0', fontWeight: 700 }}>
                Costo: ⭐ {rec.costo_puntos} estrellas
              </p>
              {rec.desbloqueada ? (
                <span className="badge-aaa badge-success" style={{ padding: '10px 16px' }}>
                  ✓ Trofeo Desbloqueado
                </span>
              ) : (
                <button
                  type="button"
                  className="btn-primary-aaa"
                  style={{ width: '100%' }}
                  onClick={async () => {
                    await onCanjearRecompensa(rec.id_recompensa);
                    setMensajeCanje(
                      `✨ Solicitud de canje procesada para "${rec.nombre}".`
                    );
                  }}
                >
                  🎁 Canjear por {rec.costo_puntos} ⭐
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================================
          SECCIÓN 5: ZONA PROTEGIDA - MODO PADRES Y TERAPEUTAS (MOCKUP 1)
         ===================================================================== */}
      <div
        className="card-aaa"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          border: '3px solid var(--border-strong)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '2.2rem' }} aria-hidden="true">
            🛡️
          </span>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              ZONA PROTEGIDA (CU-07 / CU-08)
            </div>
            <h3 style={{ margin: 0 }}>Modo Padres y Terapeutas de Lenguaje</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.94rem' }}>
              Consulta gráficas semanales, precisión de visión artificial y ajusta el perfil
              adaptativo del niño.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn-secondary-aaa"
          onClick={() => onNavigate('PANEL_TUTOR')}
        >
          📊 Entrar al Panel de Seguimiento
        </button>
      </div>
    </section>
  );
};
