import React, { useEffect, useState } from 'react';
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
  onNavigate: (vista: VistaActiva) => void;
}

const ACTIVIDAD_SEMANAL_DIAS = [
  { dia: 'Lun', minutos: 12, aciertos: 4 },
  { dia: 'Mar', minutos: 18, aciertos: 6 },
  { dia: 'Mié', minutos: 10, aciertos: 3 },
  { dia: 'Jue', minutos: 22, aciertos: 8 },
  { dia: 'Vie', minutos: 16, aciertos: 5 },
  { dia: 'Sáb', minutos: 25, aciertos: 9 },
  { dia: 'Dom', minutos: 15, aciertos: 5 },
];

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

  useEffect(() => {
    setTipoSorderaEdit(perfilActivo.tipo_sordera);
    setNivelLecturaEdit(perfilActivo.nivel_lectura);
    setCargando(true);
    fetchEstadisticasPerfil(perfilActivo.id_perfil)
      .then((data) => setEstadisticas(data))
      .finally(() => setCargando(false));
  }, [perfilActivo]);

  const handleGuardarAdaptabilidad = async (e: React.FormEvent) => {
    e.preventDefault();
    const actualizado = await actualizarPerfilAdaptativo(perfilActivo.id_perfil, {
      tipo_sordera: tipoSorderaEdit,
      nivel_lectura: nivelLecturaEdit,
    });
    onPerfilActualizado(actualizado);
    setMensajeGuardado(
      '✓ Configuración del perfil adaptativo actualizada en TABLA_PERFIL.'
    );
    setTimeout(() => setMensajeGuardado(null), 4000);
  };

  const nombreCorto = perfilActivo.nombre_apodo.split('(')[0].trim();

  return (
    <section aria-labelledby="titulo-panel-tutor">
      {/* Encabezado del Panel de Seguimiento (Fase 1 Act. 6: "Panel de seguimiento de [Name]") */}
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
              👨‍👩‍👧 Zona Protegida • Padre / Tutor y Terapeuta de Lenguaje (RF-12 / CU-07 / CU-08)
            </span>
            <h1 id="titulo-panel-tutor" style={{ margin: '6px 0 4px 0', fontSize: '1.9rem' }}>
              Panel de seguimiento de {nombreCorto}
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Reportes visuales de avance, precisión de visión artificial y control del perfil
              adaptativo (ISO/IEC 25010 Comprensibilidad).
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
              onClick={() => onNavigate('CATALOGO_CUENTOS')}
            >
              ← Volver a Modo Niño
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas Resumen (Bosquejo Fase 1 Act. 6: Cuentos completados, Señas acertadas, Palabras pronunciadas) */}
      <div className="grid-4-cols" style={{ marginBottom: '24px' }}>
        <div className="card-aaa" style={{ borderLeft: '6px solid var(--primary-aaa)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            📚 CUENTOS COMPLETADOS
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 700, margin: '6px 0' }}>
            {estadisticas?.resumen.cuentos_completados ?? 2}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            +{estadisticas?.resumen.cuentos_en_progreso ?? 1} cuento en curso
          </div>
        </div>

        <div className="card-aaa" style={{ borderLeft: '6px solid var(--success-border)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            🤟 SEÑAS ACERTADAS (LSM)
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 700, margin: '6px 0' }}>
            {estadisticas?.resumen.senas_acertadas ?? 4}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Validadas por Visión Artificial
          </div>
        </div>

        <div className="card-aaa" style={{ borderLeft: '6px solid var(--purple-aaa)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            👄 PALABRAS PRONUNCIADAS
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 700, margin: '6px 0' }}>
            {estadisticas?.resumen.palabras_pronunciadas ?? 2}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Módulo 2 • Espejo AR Bucal
          </div>
        </div>

        <div className="card-aaa" style={{ borderLeft: '6px solid var(--warn-border)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            🎯 PRECISIÓN PROMEDIO NUI
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 700, margin: '6px 0' }}>
            {estadisticas?.resumen.precision_promedio ?? 88.5}%
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            ⏱️ {estadisticas?.resumen.tiempo_uso_estimado_min ?? 40} min de práctica
          </div>
        </div>
      </div>

      {/* Dos Columnas: Gráfica de Actividad Semanal y Editor del Perfil Adaptativo */}
      <div className="grid-2-cols" style={{ marginBottom: '24px' }}>
        {/* Gráfica Visual de Actividad Semanal (Bosquejo Fase 1 Act. 6: "Actividad semanal") */}
        <div className="card-aaa">
          <h2 style={{ marginTop: 0 }}>📊 Actividad Semanal (Sesiones de 10-25 min)</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
            Sesiones breves diseñadas bajo ergonomía infantil (&lt;35 puntos NASA-TLX, Act. 2):
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '10px',
              alignItems: 'end',
              height: '200px',
              padding: '20px 10px 10px 10px',
              backgroundColor: 'var(--bg-app)',
              borderRadius: '16px',
              border: '2px solid var(--border-subtle)',
            }}
            role="img"
            aria-label="Gráfica de barras de actividad semanal en minutos por día"
          >
            {ACTIVIDAD_SEMANAL_DIAS.map((item) => {
              const alturaPct = Math.round((item.minutos / 25) * 100);
              return (
                <div
                  key={item.dia}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
                    {item.minutos}m
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '42px',
                      height: `${alturaPct}%`,
                      backgroundColor: 'var(--primary-aaa)',
                      borderRadius: '8px 8px 0 0',
                      border: '2px solid var(--border-strong)',
                    }}
                    title={`${item.dia}: ${item.minutos} min (${item.aciertos} ejercicios logrados)`}
                  />
                  <span style={{ fontWeight: 700, marginTop: '6px', fontSize: '0.9rem' }}>
                    {item.dia}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Configuración del Perfil Adaptativo (CU-02 / Actividad 7: tipo_sordera y nivel_lectura) */}
        <div className="card-aaa">
          <h2 style={{ marginTop: 0 }}>
            ⚙️ Ajustar Perfil Adaptativo en BD (`TABLA_PERFIL`)
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
            Permite al padre/tutor o terapeuta graduar la complejidad de lectura y el enfoque
            auditivo del niño:
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
                  PARCIAL (Hipoacusia Parcial / Auxiliar Auditivo — LSM + Articulación Oral)
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
                <option value="NO_LECTOR">
                  NO_LECTOR (Pre-lector: 1 a 3 palabras clave e iconografía máxima)
                </option>
                <option value="LECTURA_INICIAL">
                  LECTURA_INICIAL (Intermedio: 3 a 10 palabras clave y etiquetas breves)
                </option>
                <option value="LECTOR_AVANZADO">
                  LECTOR_AVANZADO (Avanzado: Oraciones estructuradas y subtítulos completos)
                </option>
              </select>
            </div>

            <button type="submit" className="btn-primary-aaa" style={{ width: '100%' }}>
              💾 Guardar Cambios del Perfil Adaptativo
            </button>
          </form>
        </div>
      </div>

      {/* Tabla Detallada de Métricas de Intentos de Visión Artificial (CU-08 / TABLA_METRICA_INTENTO) */}
      <div className="card-aaa">
        <h2 style={{ marginTop: 0 }}>
          🔍 Historial Detallado de Visión Artificial (`TABLA_METRICA_INTENTO` - CU-08)
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
          Registro cronológico de cada ejercicio de LSM y Articulación Oral ejecutado frente a
          la cámara:
        </p>

        {cargando ? (
          <p>Cargando métricas desde la base de datos...</p>
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
                  <th style={{ padding: '12px' }}>Seña / Palabra Practicada</th>
                  <th style={{ padding: '12px' }}>Cuento Asociado</th>
                  <th style={{ padding: '12px' }}>Precisión Visión Artificial</th>
                  <th style={{ padding: '12px' }}>Resultado DUA</th>
                  <th style={{ padding: '12px' }}>Estrellas</th>
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
                      {intento.titulo_cuento || 'Práctica libre'}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>
                      {Number(intento.porcentaje_precision).toFixed(1)}%
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge-aaa badge-success">
                        {intento.resultado === 'CORRECTO'
                          ? '✓ CORRECTO'
                          : '🔄 REINTENTO FORMATIVO'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>
                      +{intento.puntos_otorgados} ⭐
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
