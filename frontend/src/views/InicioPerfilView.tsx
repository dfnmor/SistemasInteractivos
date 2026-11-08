import React, { useState } from 'react';
import {
  PerfilNino,
  TipoSordera,
  NivelLectura,
  ConfiguracionAccesibilidad,
} from '../types/meexuu';

interface InicioPerfilViewProps {
  perfiles: PerfilNino[];
  perfilActivo: PerfilNino;
  configAccesibilidad: ConfiguracionAccesibilidad;
  onSelectPerfil: (perfil: PerfilNino) => void;
  onCreatePerfil: (nuevo: {
    nombre_apodo: string;
    fecha_nacimiento: string;
    tipo_sordera: TipoSordera;
    nivel_lectura: NivelLectura;
  }) => Promise<void>;
  onUpdateConfig: (partial: Partial<ConfiguracionAccesibilidad>) => void;
  onIrAlMenu: () => void;
}

const AVATARES_INFANTILES: Record<number, string> = {
  1: '🧒🏽',
  2: '👧🏻',
  3: '👦🏼',
  4: '👧🏾',
};

export const InicioPerfilView: React.FC<InicioPerfilViewProps> = ({
  perfiles,
  perfilActivo,
  onSelectPerfil,
  onCreatePerfil,
  onIrAlMenu,
}) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombreApodo, setNombreApodo] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('2020-05-15');
  const [tipoSordera, setTipoSordera] = useState<TipoSordera>('PARCIAL');
  const [nivelLectura, setNivelLectura] = useState<NivelLectura>('NO_LECTOR');
  const [guardando, setGuardando] = useState(false);

  const esNoLector = perfilActivo.nivel_lectura === 'NO_LECTOR';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreApodo.trim()) return;
    setGuardando(true);
    try {
      await onCreatePerfil({
        nombre_apodo: nombreApodo.trim(),
        fecha_nacimiento: fechaNacimiento,
        tipo_sordera: tipoSordera,
        nivel_lectura: nivelLectura,
      });
      setNombreApodo('');
      setMostrarFormulario(false);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section
      aria-labelledby="titulo-inicio-boceto"
      style={{
        minHeight: '640px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '24px 16px',
      }}
    >
      {/* =====================================================================
          BOCETO 1 (Fase 1, Act. 6, p. 21): "Pantalla de inicio"
          Distribución vertical centrada:
          - "¡Hola!"
          - "Aprendamos juntos con LSM y habla"
          - Botón oscuro "Iniciar sesión"
          - Botón oscuro "Crear cuenta"
         ===================================================================== */}
      <div
        style={{
          width: '100%',
          maxWidth: '340px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            fontSize: '3.6rem',
            lineHeight: 1,
            marginBottom: '4px',
          }}
          aria-hidden="true"
        >
          🤟🏽 👋🏽
        </div>

        <h1
          id="titulo-inicio-boceto"
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            margin: 0,
            color: 'var(--text-primary)',
          }}
        >
          ¡Hola!
        </h1>

        {esNoLector ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              padding: '10px 18px',
              borderRadius: '18px',
              backgroundColor: 'var(--bg-card-highlight)',
              border: '2px solid var(--primary-aaa)',
              fontSize: '2rem',
            }}
            aria-label="Modo no lector: Aprende señas LSM y habla con íconos"
          >
            <span title="Lengua de Señas Mexicana">✋🤟🏽</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>+</span>
            <span title="Articulación Oral">👄🗣️</span>
          </div>
        ) : (
          <p
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              margin: '0 0 8px 0',
              maxWidth: '260px',
              lineHeight: 1.35,
            }}
          >
            Aprendamos juntos con LSM y habla
          </p>
        )}

        {/* Selector de Perfil Adaptativo conectado a PostgreSQL (TABLA_PERFIL) */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-app)',
            border: '2px solid var(--border-subtle)',
            borderRadius: '18px',
            padding: '12px',
            marginBottom: '6px',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '8px',
              textAlign: 'center',
            }}
          >
            👤 {esNoLector ? 'Perfil' : 'Selecciona tu perfil adaptativo'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {perfiles.map((perfil) => {
              const activo = perfil.id_perfil === perfilActivo.id_perfil;
              const nombreLimpio = perfil.nombre_apodo.split('(')[0].trim();
              const perfilEsNoLector = perfil.nivel_lectura === 'NO_LECTOR';
              return (
                <button
                  key={perfil.id_perfil}
                  type="button"
                  onClick={() => {
                    onSelectPerfil(perfil);
                    onIrAlMenu();
                  }}
                  style={{
                    minHeight: '52px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '14px',
                    border: activo
                      ? '3px solid var(--primary-aaa)'
                      : '2px solid var(--border-subtle)',
                    backgroundColor: activo
                      ? 'var(--bg-card-highlight)'
                      : 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    textAlign: 'left',
                  }}
                  aria-pressed={activo}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.65rem' }} aria-hidden="true">
                      {AVATARES_INFANTILES[perfil.id_perfil] || '🧒'}
                    </span>
                    <span>
                      <span style={{ display: 'block', fontSize: '1rem' }}>
                        {nombreLimpio}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {perfilEsNoLector
                          ? '🖼️ Sin texto (No lector) • 🦻 ' + perfil.tipo_sordera
                          : `📖 ${perfil.nivel_lectura.replace('_', ' ')} • 🦻 ${
                              perfil.tipo_sordera
                            }`}
                      </span>
                    </span>
                  </span>
                  <span
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: '999px',
                      backgroundColor: activo ? 'var(--primary-aaa)' : '#E2E8F0',
                      color: activo ? '#FFFFFF' : '#0F172A',
                    }}
                  >
                    {activo ? '✓' : '★ ' + perfil.puntos_acumulados}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dos botones oscuros apilados idénticos al boceto "Pantalla de inicio" */}
        <button
          type="button"
          className="btn-dark-wireframe"
          onClick={onIrAlMenu}
          style={{ width: '100%', maxWidth: '260px' }}
        >
          <span>🔑</span>
          <span>{esNoLector ? 'Entrar' : 'Iniciar sesión'}</span>
        </button>

        <button
          type="button"
          className="btn-dark-wireframe"
          onClick={() => setMostrarFormulario((prev) => !prev)}
          aria-expanded={mostrarFormulario}
          style={{
            width: '100%',
            maxWidth: '260px',
            backgroundColor: mostrarFormulario ? '#334155' : '#1E293B',
          }}
        >
          <span>➕</span>
          <span>{esNoLector ? 'Nuevo' : 'Crear cuenta'}</span>
        </button>
      </div>

      {/* Formulario desplegable al pulsar "Crear cuenta" (CU-02 / RF-01) */}
      {mostrarFormulario && (
        <form
          onSubmit={handleSubmit}
          className="card-aaa"
          style={{
            width: '100%',
            marginTop: '20px',
            textAlign: 'left',
            border: '2px solid var(--border-strong)',
          }}
        >
          <h2 style={{ margin: '0 0 12px 0', fontSize: '1.15rem' }}>
            ➕ Crear cuenta / Nuevo perfil infantil
          </h2>

          <div className="form-group-aaa">
            <label htmlFor="input-nombre-nino" className="form-label-aaa">
              🧒 Nombre o apodo:
            </label>
            <input
              id="input-nombre-nino"
              type="text"
              className="form-input-aaa"
              placeholder="Ej. Leo"
              value={nombreApodo}
              onChange={(e) => setNombreApodo(e.target.value)}
              required
            />
          </div>

          <div className="form-group-aaa">
            <label htmlFor="input-fecha-nac" className="form-label-aaa">
              🎂 Fecha de nacimiento:
            </label>
            <input
              id="input-fecha-nac"
              type="date"
              className="form-input-aaa"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              required
            />
          </div>

          <div className="form-group-aaa">
            <label htmlFor="select-tipo-sordera" className="form-label-aaa">
              🦻 Condición auditiva:
            </label>
            <select
              id="select-tipo-sordera"
              className="form-input-aaa"
              value={tipoSordera}
              onChange={(e) => setTipoSordera(e.target.value as TipoSordera)}
            >
              <option value="TOTAL">Sordera TOTAL (Prioridad LSM)</option>
              <option value="PARCIAL">Sordera PARCIAL (LSM + Habla)</option>
            </select>
          </div>

          <div className="form-group-aaa">
            <label htmlFor="select-nivel-lectura" className="form-label-aaa">
              📖 Nivel de lectura:
            </label>
            <select
              id="select-nivel-lectura"
              className="form-input-aaa"
              value={nivelLectura}
              onChange={(e) => setNivelLectura(e.target.value as NivelLectura)}
            >
              <option value="NO_LECTOR">NO_LECTOR (Solo íconos e imágenes)</option>
              <option value="LECTURA_INICIAL">LECTURA_INICIAL (Texto de apoyo breve)</option>
              <option value="LECTOR_AVANZADO">LECTOR_AVANZADO (Oraciones completas)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button
              type="submit"
              className="btn-primary-aaa"
              style={{ flex: 1 }}
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : '✓ Guardar'}
            </button>
            <button
              type="button"
              className="btn-secondary-aaa"
              onClick={() => setMostrarFormulario(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
};
