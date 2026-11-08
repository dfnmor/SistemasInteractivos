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

const FONDOS_NIVEL: Record<NivelLectura, string> = {
  NO_LECTOR: '#DBEAFE',
  LECTURA_INICIAL: '#FEF3C7',
  LECTOR_AVANZADO: '#DCFCE7',
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
  const [estadoCanje, setEstadoCanje] = useState<{
    ok: boolean;
    mensaje: string;
  } | null>(null);

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
          SECCIÓN 1: BIENVENIDA Y PERFIL ACTIVO CONECTADO A POSTGRESQL
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
              ¡BIENVENIDO DE VUELTA! (PERFIL ACTIVO EN BD #{perfilActivo.id_perfil})
            </span>
            <h1 id="titulo-menu-principal" style={{ margin: '4px 0', fontSize: '2rem' }}>
              ¡Hola, {nombreCorto}! 👋
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Condición: <strong>Sordera {perfilActivo.tipo_sordera}</strong> • Nivel de
              Lectura: <strong>{perfilActivo.nivel_lectura.replace('_', ' ')}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div
              className="star-counter-badge"
              style={{ fontSize: '1.25rem', padding: '10px 20px' }}
            >
              ⭐ {perfilActivo.puntos_acumulados} Puntos en BD
            </div>
            <button
              type="button"
              className="btn-secondary-aaa"
              onClick={() => onNavigate('INICIO_PERFIL', '/')}
            >
              🔄 Cambiar Perfil
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          SECCIÓN 2: ACCESO A LOS MÓDULOS PRINCIPALES (RF-03)
         ===================================================================== */}
      <div className="grid-2-cols" style={{ marginBottom: '26px' }}>
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
            <h2 style={{ margin: '6px 0' }}>Módulo 1: Práctica de Señas (LSM)</h2>
            {!esNoLector && (
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                Practica las señas de los cuentos frente a la cámara web con contorno guía
                superpuesto y guarda cada intento en PostgreSQL.
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
            <button
              type="button"
              className="btn-primary-aaa"
              style={{ flex: 1 }}
              onClick={() => onNavigate('PRACTICA_V2', '/practica-v2')}
            >
              ▶ Ir a Práctica de Seña
            </button>
          </div>
        </div>

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
            <h2 style={{ margin: '6px 0' }}>Módulo 2: Habla y Articulación Oral</h2>
            {!esNoLector && (
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                Observa el movimiento labial del terapeuta en cámara lenta frente al espejo AR
                y repite las sílabas.
              </p>
            )}
          </div>
          <button
            type="button"
            className="btn-purple-aaa"
            style={{ width: '100%', marginTop: '12px' }}
            onClick={() => onNavigate('MODULO_2_ARTICULACION', '/articulacion')}
          >
            🎙️ Entrenar Boca (Espejo AR)
          </button>
        </div>
      </div>

      {/* =====================================================================
          VISOR INTERACTIVO DEL CUENTO SELECCIONADO (CU-04 / RF-05 / RF-14)
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
                📖 Cuento #{cuentoAbierto.id_cuento} • Nivel:{' '}
                {cuentoAbierto.nivel_lectura.replace('_', ' ')}
              </span>
              <h2 style={{ margin: '6px 0 0 0' }}>{cuentoAbierto.titulo}</h2>
            </div>
            <button
              type="button"
              className="btn-secondary-aaa"
              onClick={() => setCuentoAbierto(null)}
            >
              ⬅ Cerrar Cuento y Volver al Catálogo
            </button>
          </div>

          <div className="grid-2-cols">
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
                  🤖 Avatar Gesticulador MOD-3D-01
                </span>
                <span className="badge-aaa badge-articulacion">
                  Ángulo: {anguloRotacion3D}° | Vel: {velocidadAvatar}x
                </span>
              </div>

              <div
                style={{
                  padding: '28px 16px',
                  borderRadius: '18px',
                  backgroundColor: FONDOS_NIVEL[cuentoAbierto.nivel_lectura] || '#DBEAFE',
                  color: '#091326',
                  marginBottom: '14px',
                  transform: `rotateY(${anguloRotacion3D}deg)`,
                  transition: 'transform 0.4s ease',
                }}
              >
                <div style={{ fontSize: '4.2rem', lineHeight: 1.1 }}>
                  {cuentoAbierto.imagen_portada || '🐰🌙'}
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
                  Ejercicio #{escenaActual + 1} del Cuento:{' '}
                  <span style={{ color: '#004488' }}>
                    {cuentoAbierto.ejercicios?.[escenaActual]?.palabra_o_sena || 'HOLA'}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  justifyContent: 'center',
                }}
              >
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
                  🐢 Velocidad: {velocidadAvatar}x
                </button>
                <button
                  type="button"
                  className="btn-secondary-aaa"
                  onClick={() => setAnguloRotacion3D((ang) => (ang + 45) % 360)}
                >
                  🔄 Rotar 360°
                </button>
              </div>
            </div>

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
                  💬 Narrativa y Ejercicios del Cuento (`TABLA_EJERCICIO_CUENTO`)
                </h3>
                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                  {cuentoAbierto.descripcion}
                </p>

                <div style={{ margin: '16px 0' }}>
                  <strong>
                    Selecciona un ejercicio de este cuento para practicar frente a la cámara:
                  </strong>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginTop: '10px',
                    }}
                  >
                    {(cuentoAbierto.ejercicios || []).map((ej, idx) => (
                      <button
                        key={ej.id_ejercicio}
                        type="button"
                        className={
                          idx === escenaActual ? 'btn-primary-aaa' : 'btn-secondary-aaa'
                        }
                        onClick={() => setEscenaActual(idx)}
                      >
                        {idx + 1}. {ej.palabra_o_sena} (ID #{ej.id_ejercicio})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginTop: '16px',
                }}
              >
                <button
                  type="button"
                  className="btn-primary-aaa"
                  onClick={() => {
                    const ej = cuentoAbierto.ejercicios?.[escenaActual];
                    if (ej) {
                      onPracticarEjercicio(
                        cuentoAbierto.tipo,
                        ej.palabra_o_sena,
                        ej.id_ejercicio,
                        cuentoAbierto.id_cuento
                      );
                    }
                  }}
                >
                  📷 Practicar Seña &quot;
                  {cuentoAbierto.ejercicios?.[escenaActual]?.palabra_o_sena || 'HOLA'}&quot; en
                  Módulo 1
                </button>

                <button
                  type="button"
                  className="btn-success-aaa"
                  onClick={async () => {
                    await onCompletarCuento(cuentoAbierto.id_cuento);
                    setCuentoAbierto(null);
                  }}
                >
                  🏆 Completar Cuento en BD (+30 ⭐)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECCIÓN 3: CATÁLOGO DE CUENTOS DESDE POSTGRESQL (3 POR NIVEL = 9 CUENTOS)
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
            <h2 style={{ margin: 0 }}>
              📚 Catálogo de Cuentos en PostgreSQL ({cuentosFiltrados.length} cuentos)
            </h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
              3 cuentos por cada nivel (`NO_LECTOR`, `LECTURA_INICIAL`, `LECTOR_AVANZADO`) con
              sus ejercicios cargados desde `TABLA_CUENTO` y `TABLA_EJERCICIO_CUENTO`.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(['TODOS', 'LSM', 'ARTICULACION'] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={filtroTipo === t ? 'btn-primary-aaa' : 'btn-secondary-aaa'}
                onClick={() => setFiltroTipo(t)}
              >
                {t === 'TODOS'
                  ? '📋 Todos'
                  : t === 'LSM'
                  ? '🤟 Módulo 1: LSM'
                  : '👄 Módulo 2: Articulación'}
              </button>
            ))}
          </div>
        </div>

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
                  ? '🌈 Todos los Niveles (9)'
                  : niv === 'NO_LECTOR'
                  ? '🟢 Nivel 1: NO_LECTOR (3)'
                  : niv === 'LECTURA_INICIAL'
                  ? '🔵 Nivel 2: LECTURA_INICIAL (3)'
                  : '🟣 Nivel 3: LECTOR_AVANZADO (3)'}
              </button>
            )
          )}
        </div>

        <div className="grid-3-cols">
          {cuentosFiltrados.map((cuento) => {
            const completado = cuento.progreso_usuario?.estado === 'COMPLETADO';
            const enProgreso = cuento.progreso_usuario?.estado === 'EN_PROGRESO';
            const porcentajeAvance = completado ? 100 : enProgreso ? 55 : 0;

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
                      {cuento.tipo === 'LSM' ? '🤟 LSM' : '👄 Articulación'} •{' '}
                      {cuento.nivel_lectura}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                      {cuento.ejercicios?.length || 3} ejercicios
                    </span>
                  </div>

                  <div
                    style={{
                      backgroundColor: FONDOS_NIVEL[cuento.nivel_lectura] || '#DBEAFE',
                      borderRadius: '16px',
                      padding: '22px 16px',
                      textAlign: 'center',
                      fontSize: '3.4rem',
                      marginBottom: '14px',
                      border: '2px solid #091326',
                    }}
                    aria-hidden="true"
                  >
                    {cuento.imagen_portada || '📖✨'}
                  </div>

                  <div
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'var(--primary-aaa)',
                      marginBottom: '6px',
                    }}
                  >
                    🎯 Ejercicios:{' '}
                    {(cuento.ejercicios || [])
                      .map((e) => e.palabra_o_sena)
                      .join(', ')}
                  </div>

                  <h3 style={{ margin: '6px 0', fontSize: '1.22rem' }}>{cuento.titulo}</h3>

                  {!esNoLector && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      {cuento.descripcion}
                    </p>
                  )}
                </div>

                <div style={{ marginTop: '14px' }}>
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
                        ? '✅ Completado en BD'
                        : enProgreso
                        ? `⏳ En progreso (${cuento.progreso_usuario?.puntos_obtenidos || 0} pts)`
                        : '✨ Nuevo'}
                    </span>
                    <span>{porcentajeAvance}%</span>
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
                    ▶ Abrir Cuento #{cuento.id_cuento}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          SECCIÓN 4: PUNTOS Y CANJE DE RECOMPENSAS EN POSTGRESQL (CU-09)
         ===================================================================== */}
      <div className="card-aaa">
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
            <h2 style={{ margin: 0 }}>
              🏆 Canje de Recompensas (`TABLA_RECOMPENSA` / `TABLA_CANJE_RECOMPENSA`)
            </h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
              Puntos disponibles de <strong>{nombreCorto}</strong>:{' '}
              <strong>⭐ {perfilActivo.puntos_acumulados} puntos</strong>. Al canjear una
              recompensa se descuenta el saldo en `TABLA_PERFIL` y se registra en
              `TABLA_CANJE_RECOMPENSA`.
            </p>
          </div>
        </div>

        {estadoCanje && (
          <div
            className="card-aaa"
            style={{
              marginBottom: '16px',
              backgroundColor: estadoCanje.ok ? 'var(--success-bg)' : 'var(--warn-bg)',
              borderColor: estadoCanje.ok
                ? 'var(--success-border)'
                : 'var(--warn-border)',
              color: estadoCanje.ok ? 'var(--success-text)' : 'var(--warn-text)',
              fontWeight: 700,
            }}
            role="status"
          >
            {estadoCanje.ok ? '✅ ' : '⚠️ '}
            {estadoCanje.mensaje}
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
                Costo: ⭐ {rec.costo_puntos} puntos
              </p>
              {rec.desbloqueada ? (
                <span className="badge-aaa badge-success" style={{ padding: '10px 16px' }}>
                  ✓ Canjeada y Registrada en BD
                </span>
              ) : (
                <button
                  type="button"
                  className="btn-primary-aaa"
                  style={{ width: '100%' }}
                  onClick={async () => {
                    const resultado = await onCanjearRecompensa(rec.id_recompensa);
                    setEstadoCanje(resultado);
                  }}
                >
                  🎁 Canjear por {rec.costo_puntos} ⭐
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
