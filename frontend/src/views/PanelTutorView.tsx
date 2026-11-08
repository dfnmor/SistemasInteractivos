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
    setMensajeGuardado(
      '✓ Configuración del perfil adaptativo actualizada en PostgreSQL (TABLA_PERFIL).'
    );
    setTimeout(() => setMensajeGuardado(null), 4000);
  };

  const nombreCorto = perfilActivo.nombre_apodo.split('(')[0].trim();

  return (
    <section aria-labelledby="titulo-panel-tutor">
      {/* Encabezado del Panel del Tutor */}
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
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div>
            <span className="badge-aaa badge-lsm">
              👨‍👩‍👧 Panel del Tutor • Datos Reales desde PostgreSQL (`db_meexuu`)
            </span>
            <h1 id="titulo-panel-tutor" style={{ margin: '6px 0 4px 0', fontSize: '1.9rem' }}>
              Panel de Seguimiento de {nombreCorto}
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Consulta en vivo de `TABLA_PROGRESO_CUENTO`, `TABLA_METRICA_INTENTO` y
              `TABLA_CANJE_RECOMPENSA`.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <label htmlFor="select-cambiar-nino-tutor" style={{ fontWeight: 700 }}>
              Niño supervisado:
            </label>
            <select
              id="select-cambiar-nino-tutor"
              className="form-input-aaa"
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
              onClick={() => cargarEstadisticasReales(perfilActivo.id_perfil)}
            >
              🔄 Actualizar desde BD
            </button>
            <button
              type="button"
              className="btn-secondary-aaa"
              onClick={() => onNavigate('CATALOGO_CUENTOS', '/cuentos')}
            >
              ← Volver a Cuentos
            </button>
          </div>
        </div>
      </div>

      {/* 4 Tarjetas Resumen Reales desde PostgreSQL */}
      <div className="grid-4-cols" style={{ marginBottom: '24px' }}>
        <div className="card-aaa" style={{ borderLeft: '6px solid var(--primary-aaa)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            📚 PROGRESO EN CUENTOS
          </div>
          <div style={{ fontSize: '2.3rem', fontWeight: 700, margin: '6px 0' }}>
            {estadisticas?.resumen.cuentos_completados ?? 0} completados
          </div>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            +{estadisticas?.resumen.cuentos_en_progreso ?? 0} cuentos en progreso
          </div>
        </div>

        <div className="card-aaa" style={{ borderLeft: '6px solid var(--success-border)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            🤟 INTENTOS REGISTRADOS
          </div>
          <div style={{ fontSize: '2.3rem', fontWeight: 700, margin: '6px 0' }}>
            {estadisticas?.resumen.total_intentos ?? 0} intentos
          </div>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            {estadisticas?.resumen.senas_acertadas ?? 0} señas LSM +{' '}
            {estadisticas?.resumen.palabras_pronunciadas ?? 0} articulación
          </div>
        </div>

        <div className="card-aaa" style={{ borderLeft: '6px solid var(--purple-aaa)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            🎯 PRECISIÓN PROMEDIO (BD)
          </div>
          <div style={{ fontSize: '2.3rem', fontWeight: 700, margin: '6px 0' }}>
            {estadisticas?.resumen.precision_promedio ?? 0}%
          </div>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Calculada sobre `TABLA_METRICA_INTENTO`
          </div>
        </div>

        <div className="card-aaa" style={{ borderLeft: '6px solid var(--warn-border)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            🏆 RECOMPENSAS CANJEADAS
          </div>
          <div style={{ fontSize: '2.3rem', fontWeight: 700, margin: '6px 0' }}>
            {estadisticas?.recompensas_canjeadas?.length ?? 0} trofeos
          </div>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Saldo actual: ⭐ {estadisticas?.perfil.puntos_acumulados ?? perfilActivo.puntos_acumulados} pts
          </div>
        </div>
      </div>

      {/* Dos Columnas: 1. Progreso por Cuento y Recompensas Canjeadas | 2. Editor de Perfil */}
      <div className="grid-2-cols" style={{ marginBottom: '24px' }}>
        <div className="card-aaa">
          <h2 style={{ marginTop: 0 }}>
            📖 Progreso por Cuento (`TABLA_PROGRESO_CUENTO`)
          </h2>
          {(estadisticas?.progreso_cuentos || []).length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>
              Aún no hay cuentos registrados para este perfil.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(estadisticas?.progreso_cuentos || []).map((prog) => {
                const esCompletado = prog.estado === 'COMPLETADO';
                return (
                  <div
                    key={prog.id_progreso}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--bg-app)',
                      border: '2px solid var(--border-subtle)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px',
                        gap: '8px',
                      }}
                    >
                      <strong>
                        {prog.titulo_cuento || `Cuento #${prog.id_cuento}`} (
                        {prog.tipo_cuento || 'LSM'})
                      </strong>
                      <span
                        className={`badge-aaa ${
                          esCompletado ? 'badge-success' : 'badge-lsm'
                        }`}
                      >
                        {esCompletado ? '✓ COMPLETADO' : '⏳ EN PROGRESO'} •{' '}
                        {prog.puntos_obtenidos} pts
                      </span>
                    </div>
                    <div className="progress-track-aaa">
                      <div
                        className={
                          esCompletado ? 'progress-fill-success' : 'progress-fill-aaa'
                        }
                        style={{ width: esCompletado ? '100%' : '60%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <h2 style={{ marginTop: '24px' }}>
            🏆 Recompensas Canjeadas (`TABLA_CANJE_RECOMPENSA`)
          </h2>
          {(estadisticas?.recompensas_canjeadas || []).length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>
              Este perfil aún no ha canjeado recompensas. Ve a la pestaña Cuentos para
              canjear puntos.
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {(estadisticas?.recompensas_canjeadas || []).map((canje) => (
                <div
                  key={canje.id_canje}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    backgroundColor: 'var(--success-bg)',
                    border: '2px solid var(--success-border)',
                    color: 'var(--success-text)',
                    fontWeight: 700,
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }} aria-hidden="true">
                    {canje.icono_url}
                  </span>
                  <div>
                    <div>{canje.nombre_recompensa}</div>
                    <small>
                      Canjeado por {canje.costo_puntos} ⭐ (ID #{canje.id_canje})
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Configuración del Perfil Adaptativo en PostgreSQL */}
        <div className="card-aaa">
          <h2 style={{ marginTop: 0 }}>
            ⚙️ Configurar Perfil Adaptativo en BD (`TABLA_PERFIL`)
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
            Actualiza en tiempo real la condición auditiva y el nivel de lectura del niño:
          </p>

          {mensajeGuardado && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: 'var(--success-bg)',
                border: '2px solid var(--success-border)',
                color: 'var(--success-text)',
                fontWeight: 700,
                marginBottom: '12px',
              }}
              role="status"
            >
              {mensajeGuardado}
            </div>
          )}

          <form onSubmit={handleGuardarAdaptabilidad}>
            <div className="form-group-aaa">
              <label htmlFor="tutor-edit-sordera" className="form-label-aaa">
                🦻 Condición Auditiva (`tipo_sordera`):
              </label>
              <select
                id="tutor-edit-sordera"
                className="form-input-aaa"
                value={tipoSorderaEdit}
                onChange={(e) => setTipoSorderaEdit(e.target.value as TipoSordera)}
              >
                <option value="TOTAL">TOTAL (Hipoacusia Completa — Prioridad LSM)</option>
                <option value="PARCIAL">
                  PARCIAL (Hipoacusia Parcial — LSM + Articulación Oral)
                </option>
              </select>
            </div>

            <div className="form-group-aaa">
              <label htmlFor="tutor-edit-lectura" className="form-label-aaa">
                📖 Nivel de Lectura (`nivel_lectura`):
              </label>
              <select
                id="tutor-edit-lectura"
                className="form-input-aaa"
                value={nivelLecturaEdit}
                onChange={(e) => setNivelLecturaEdit(e.target.value as NivelLectura)}
              >
                <option value="NO_LECTOR">NO_LECTOR (Nivel 1)</option>
                <option value="LECTURA_INICIAL">LECTURA_INICIAL (Nivel 2)</option>
                <option value="LECTOR_AVANZADO">LECTOR_AVANZADO (Nivel 3)</option>
              </select>
            </div>

            <button type="submit" className="btn-primary-aaa" style={{ width: '100%' }}>
              💾 Guardar Cambios en PostgreSQL
            </button>
          </form>
        </div>
      </div>

      {/* Tabla Detallada de Métricas de Intentos de Visión Artificial (TABLA_METRICA_INTENTO) */}
      <div className="card-aaa">
        <h2 style={{ marginTop: 0 }}>
          🔍 Historial Real de Intentos (`TABLA_METRICA_INTENTO` —{' '}
          {estadisticas?.historial_intentos.length ?? 0} registros)
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
          Cada intento realizado en el Módulo 1 (`/practica-v1` o `/practica-v2`) y Módulo 2
          se almacena en PostgreSQL y aparece inmediatamente aquí:
        </p>

        {cargando ? (
          <p>Consultando registros en PostgreSQL...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '3px solid var(--border-strong)',
                    backgroundColor: 'var(--bg-app)',
                  }}
                >
                  <th style={{ padding: '12px' }}>ID Intento</th>
                  <th style={{ padding: '12px' }}>Módulo</th>
                  <th style={{ padding: '12px' }}>Ejercicio (`palabra_o_sena`)</th>
                  <th style={{ padding: '12px' }}>Cuento Asociado</th>
                  <th style={{ padding: '12px' }}>Precisión (`DECIMAL`)</th>
                  <th style={{ padding: '12px' }}>Resultado (`ENUM`)</th>
                  <th style={{ padding: '12px' }}>Puntos Otorgados</th>
                  <th style={{ padding: '12px' }}>Fecha / Hora</th>
                </tr>
              </thead>
              <tbody>
                {(estadisticas?.historial_intentos || []).map((intento) => (
                  <tr
                    key={intento.id_intento}
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <td style={{ padding: '12px', fontWeight: 700 }}>
                      #{intento.id_intento}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        className={`badge-aaa ${
                          intento.tipo_cuento === 'ARTICULACION'
                            ? 'badge-articulacion'
                            : 'badge-lsm'
                        }`}
                      >
                        {intento.tipo_cuento || 'LSM'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>
                      {intento.palabra_o_sena || `Ejercicio #${intento.id_ejercicio}`}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {intento.titulo_cuento || 'Práctica de cuento'}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>
                      {Number(intento.porcentaje_precision).toFixed(1)}%
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        className="badge-aaa"
                        style={{
                          backgroundColor:
                            intento.resultado === 'CORRECTO'
                              ? 'var(--success-bg)'
                              : 'var(--warn-bg)',
                          color:
                            intento.resultado === 'CORRECTO'
                              ? 'var(--success-text)'
                              : 'var(--warn-text)',
                          borderColor:
                            intento.resultado === 'CORRECTO'
                              ? 'var(--success-border)'
                              : 'var(--warn-border)',
                        }}
                      >
                        {intento.resultado === 'CORRECTO'
                          ? '✓ CORRECTO'
                          : '🔄 REINTENTO'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>
                      +{intento.puntos_otorgados} ⭐
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                      {new Date(intento.fecha_hora).toLocaleString('es-MX')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
