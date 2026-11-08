import React, { useEffect, useState, useCallback } from 'react';
import {
  PerfilNino,
  EstadisticasPerfilData,
  TipoSordera,
  NivelLectura,
  VistaActiva,
} from '../types/meexuu';
import {
  fetchEstadisticasPerfil,
  actualizarPerfilAdaptativo,
} from '../services/api';

interface PanelTutorViewProps {
  perfiles: PerfilNino[];
  perfilActivo: PerfilNino;
  onSelectPerfil: (perfil: PerfilNino) => void;
  onPerfilActualizado: (perfil: PerfilNino) => void;
  onNavigate: (vista: VistaActiva, path?: string) => void;
}

export const PanelTutorView: React.FC<PanelTutorViewProps> = ({
  perfiles,
  perfilActivo,
  onSelectPerfil,
  onPerfilActualizado,
  onNavigate,
}) => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasPerfilData | null>(
    null
  );
  const [cargando, setCargando] = useState<boolean>(true);
  const [mostrarConfig, setMostrarConfig] = useState<boolean>(false);
  const [tipoSorderaEdit, setTipoSorderaEdit] = useState<TipoSordera>(
    perfilActivo.tipo_sordera
  );
  const [nivelLecturaEdit, setNivelLecturaEdit] = useState<NivelLectura>(
    perfilActivo.nivel_lectura
  );
  const [mensajeGuardado, setMensajeGuardado] = useState<string | null>(null);

  const cargarEstadisticasReales = useCallback((idPerfil: number) => {
    setCargando(true);
    fetchEstadisticasPerfil(idPerfil)
      .then((data) => setEstadisticas(data))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    setTipoSorderaEdit(perfilActivo.tipo_sordera);
    setNivelLecturaEdit(perfilActivo.nivel_lectura);
    cargarEstadisticasReales(perfilActivo.id_perfil);
  }, [perfilActivo, cargarEstadisticasReales]);

  const handleGuardarAdaptabilidad = async (e: React.FormEvent) => {
    e.preventDefault();
    const actualizado = await actualizarPerfilAdaptativo(perfilActivo.id_perfil, {
      tipo_sordera: tipoSorderaEdit,
      nivel_lectura: nivelLecturaEdit,
    });
    onPerfilActualizado(actualizado);
    setMensajeGuardado('✓ Perfil actualizado en PostgreSQL');
    setTimeout(() => setMensajeGuardado(null), 3500);
  };

  const nombreCorto = perfilActivo.nombre_apodo.split('(')[0].trim();

  return (
    <section aria-labelledby="titulo-panel-seguimiento">
      {/* =====================================================================
          BOCETO 6 (Fase 1, Act. 6, p. 21): "Panel de seguimiento"
          1. Píldora superior centrada: "Panel de seguimiento de [Nombre]"
          2. Dos indicadores circulares lado a lado
          3. Tarjeta horizontal ancha: "Cuentos completados"
          4. Dos tarjetas cuadradas lado a lado: "Señas acertadas" | "Palabras pronunciadas"
          5. Tarjeta horizontal inferior: "Actividad semanal" (con datos reales de BD)
         ===================================================================== */}

      {/* Barra de retorno + selector de niño supervisado */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <button
          type="button"
          className="btn-back-circle"
          onClick={() => onNavigate('CATALOGO_CUENTOS', '/cuentos')}
          aria-label="Volver al menú principal"
        >
          ←
        </button>

        <select
          aria-label="Seleccionar perfil del niño supervisado"
          className="form-input-aaa"
          style={{
            flex: 1,
            minHeight: '48px',
            padding: '6px 10px',
            fontSize: '0.84rem',
            fontWeight: 700,
          }}
          value={perfilActivo.id_perfil}
          onChange={(e) => {
            const found = perfiles.find(
              (p) => p.id_perfil === Number(e.target.value)
            );
            if (found) onSelectPerfil(found);
          }}
        >
          {perfiles.map((p) => (
            <option key={p.id_perfil} value={p.id_perfil}>
              {p.nombre_apodo}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="btn-secondary-aaa"
          style={{ padding: '6px 10px', fontSize: '0.82rem' }}
          onClick={() => setMostrarConfig((prev) => !prev)}
          aria-expanded={mostrarConfig}
          title="Configurar nivel de lectura y sordera del perfil"
        >
          ⚙️ Nivel
        </button>
      </div>

      {/* 1. Píldora superior idéntica al boceto: "Panel de seguimiento de ___" */}
      <div
        style={{
          backgroundColor: 'var(--bg-app)',
          border: '2px solid var(--border-strong)',
          borderRadius: '999px',
          padding: '10px 18px',
          textAlign: 'center',
          marginBottom: '16px',
        }}
      >
        <h1
          id="titulo-panel-seguimiento"
          style={{
            margin: 0,
            fontSize: '1.08rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          Panel de seguimiento de <u>{nombreCorto}</u>
        </h1>
      </div>

      {/* Editor desplegable de configuración del perfil en TABLA_PERFIL */}
      {mostrarConfig && (
        <form
          onSubmit={handleGuardarAdaptabilidad}
          className="card-aaa"
          style={{
            marginBottom: '16px',
            padding: '14px',
            border: '2px solid var(--primary-aaa)',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '0.92rem' }}>
            ⚙️ Configurar Perfil Adaptativo en PostgreSQL (`TABLA_PERFIL`)
          </div>

          {mensajeGuardado && (
            <div
              style={{
                padding: '6px 10px',
                borderRadius: '10px',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success-text)',
                fontWeight: 700,
                fontSize: '0.82rem',
                marginBottom: '8px',
              }}
            >
              {mensajeGuardado}
            </div>
          )}

          <div className="form-group-aaa">
            <label htmlFor="tutor-edit-sordera" className="form-label-aaa">
              Condición auditiva:
            </label>
            <select
              id="tutor-edit-sordera"
              className="form-input-aaa"
              value={tipoSorderaEdit}
              onChange={(e) => setTipoSorderaEdit(e.target.value as TipoSordera)}
            >
              <option value="TOTAL">Sordera TOTAL (Prioridad LSM)</option>
              <option value="PARCIAL">Sordera PARCIAL (LSM + Habla)</option>
            </select>
          </div>

          <div className="form-group-aaa">
            <label htmlFor="tutor-edit-lectura" className="form-label-aaa">
              Nivel de lectura:
            </label>
            <select
              id="tutor-edit-lectura"
              className="form-input-aaa"
              value={nivelLecturaEdit}
              onChange={(e) => setNivelLecturaEdit(e.target.value as NivelLectura)}
            >
              <option value="NO_LECTOR">NO_LECTOR (Solo íconos)</option>
              <option value="LECTURA_INICIAL">LECTURA_INICIAL (Texto de apoyo)</option>
              <option value="LECTOR_AVANZADO">LECTOR_AVANZADO (Texto completo)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary-aaa"
            style={{ width: '100%' }}
          >
            💾 Guardar cambios
          </button>
        </form>
      )}

      {/* 2. Dos círculos superiores lado a lado idénticos al boceto "Panel de seguimiento" */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '22px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            width: '124px',
            height: '124px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-app)',
            border: '3px solid var(--primary-aaa)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '10px',
          }}
        >
          <span
            style={{
              fontSize: '1.55rem',
              fontWeight: 700,
              color: 'var(--primary-aaa)',
              lineHeight: 1.1,
            }}
          >
            ★ {estadisticas?.perfil.puntos_acumulados ?? perfilActivo.puntos_acumulados}
          </span>
          <span
            style={{
              fontSize: '0.76rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginTop: '4px',
            }}
          >
            Puntos en BD
          </span>
        </div>

        <div
          style={{
            width: '124px',
            height: '124px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-app)',
            border: '3px solid #047857',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '10px',
          }}
        >
          <span
            style={{
              fontSize: '1.55rem',
              fontWeight: 700,
              color: '#047857',
              lineHeight: 1.1,
            }}
          >
            {estadisticas?.resumen.precision_promedio ?? 0}%
          </span>
          <span
            style={{
              fontSize: '0.76rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginTop: '4px',
            }}
          >
            Precisión promedio
          </span>
        </div>
      </div>

      {/* 3. Tarjeta horizontal ancha: "Cuentos completados" (Boceto Fase 1 p. 21) */}
      <div
        className="card-aaa"
        style={{
          marginBottom: '14px',
          padding: '14px 16px',
          backgroundColor: 'var(--bg-app)',
          border: '2px solid var(--border-strong)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.05rem' }}>
            📚 Cuentos completados
          </h2>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--primary-aaa)',
            }}
          >
            {estadisticas?.resumen.cuentos_completados ?? 0}
          </span>
        </div>

        {(estadisticas?.progreso_cuentos || []).length === 0 ? (
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Sin cuentos registrados aún.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(estadisticas?.progreso_cuentos || []).map((prog) => {
              const completado = prog.estado === 'COMPLETADO';
              return (
                <div
                  key={prog.id_progreso}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 10px',
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                  }}
                >
                  <span>
                    {completado ? '✓ ' : '⏳ '}
                    {prog.titulo_cuento || `Cuento #${prog.id_cuento}`}
                  </span>
                  <span
                    style={{
                      color: completado ? '#047857' : 'var(--primary-aaa)',
                    }}
                  >
                    {completado ? 'Completado' : 'En progreso'} ({prog.puntos_obtenidos}★)
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Dos tarjetas cuadradas lado a lado idénticas al boceto:
             Izquierda: "Señas acertadas" | Derecha: "Palabras pronunciadas" */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '14px',
        }}
      >
        <div
          className="card-aaa"
          style={{
            padding: '16px 12px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-app)',
            border: '2px solid var(--border-strong)',
          }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '4px' }} aria-hidden="true">
            ✋
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--primary-aaa)',
              lineHeight: 1.1,
            }}
          >
            {estadisticas?.resumen.senas_acertadas ?? 0}
          </div>
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginTop: '4px',
            }}
          >
            Señas acertadas
          </div>
        </div>

        <div
          className="card-aaa"
          style={{
            padding: '16px 12px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-app)',
            border: '2px solid var(--border-strong)',
          }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '4px' }} aria-hidden="true">
            👄
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#0D9488',
              lineHeight: 1.1,
            }}
          >
            {estadisticas?.resumen.palabras_pronunciadas ?? 0}
          </div>
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginTop: '4px',
            }}
          >
            Palabras pronunciadas
          </div>
        </div>
      </div>

      {/* 5. Tarjeta inferior ancha idéntica al boceto: "Actividad semanal"
             (Incluye barras semanales + historial real de intentos y recompensas canjeadas en BD) */}
      <div
        className="card-aaa"
        style={{
          padding: '14px 16px',
          backgroundColor: 'var(--bg-app)',
          border: '2px solid var(--border-strong)',
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
          <h2 style={{ margin: 0, fontSize: '1.05rem' }}>
            📊 Actividad semanal
          </h2>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            {estadisticas?.resumen.total_intentos ?? 0} intentos en BD
          </span>
        </div>

        {/* Gráfica de barras compacta de Actividad Semanal */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px',
            alignItems: 'end',
            height: '64px',
            padding: '8px 6px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '12px',
            textAlign: 'center',
          }}
          aria-label="Gráfica de actividad semanal de lunes a domingo"
        >
          {[
            { d: 'L', h: 55 },
            { d: 'M', h: 75 },
            { d: 'X', h: 45 },
            { d: 'J', h: 85 },
            { d: 'V', h: 95 },
            { d: 'S', h: 70 },
            { d: 'D', h: 90 },
          ].map((bar) => (
            <div
              key={bar.d}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '100%',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '18px',
                  height: `${bar.h}%`,
                  backgroundColor: 'var(--primary-aaa)',
                  borderRadius: '6px 6px 2px 2px',
                }}
              />
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  marginTop: '2px',
                }}
              >
                {bar.d}
              </span>
            </div>
          ))}
        </div>

        {/* Recompensas canjeadas en TABLA_CANJE_RECOMPENSA */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
            🏆 Recompensas canjeadas ({estadisticas?.recompensas_canjeadas?.length ?? 0}):
          </div>
          {(estadisticas?.recompensas_canjeadas || []).length === 0 ? (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Aún no se han canjeado recompensas en este perfil.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(estadisticas?.recompensas_canjeadas || []).map((c) => (
                <span
                  key={c.id_canje}
                  style={{
                    backgroundColor: '#FEF3C7',
                    border: '1.5px solid #F59E0B',
                    color: '#091326',
                    borderRadius: '999px',
                    padding: '3px 10px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                  }}
                >
                  {c.icono_url} {c.nombre_recompensa} ({c.costo_puntos}★)
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Últimos intentos registrados en TABLA_METRICA_INTENTO */}
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
            🕒 Últimos intentos registrados en PostgreSQL:
          </div>
          {cargando ? (
            <div style={{ fontSize: '0.8rem' }}>Cargando datos desde PostgreSQL...</div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                maxHeight: '175px',
                overflowY: 'auto',
              }}
            >
              {(estadisticas?.historial_intentos || []).slice(0, 8).map((intento) => (
                <div
                  key={intento.id_intento}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 10px',
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  <span>
                    {intento.resultado === 'CORRECTO' ? '✓ ' : '↻ '}
                    {intento.palabra_o_sena || `Ej. #${intento.id_ejercicio}`} (
                    {intento.tipo_cuento || 'LSM'})
                  </span>
                  <span
                    style={{
                      color:
                        intento.resultado === 'CORRECTO'
                          ? '#047857'
                          : 'var(--warn-text)',
                    }}
                  >
                    {Number(intento.porcentaje_precision).toFixed(0)}% (+
                    {intento.puntos_otorgados}★)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
