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
  configAccesibilidad,
  onSelectPerfil,
  onCreatePerfil,
  onUpdateConfig,
  onIrAlMenu,
}) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombreApodo, setNombreApodo] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('2020-05-15');
  const [tipoSordera, setTipoSordera] = useState<TipoSordera>('PARCIAL');
  const [nivelLectura, setNivelLectura] = useState<NivelLectura>('NO_LECTOR');
  const [guardando, setGuardando] = useState(false);

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
    <section aria-labelledby="titulo-inicio-bienvenida">
      {/* Hero de Bienvenida basado en el Bosquejo 1 de la Actividad 6 (Fase 1, p. 21) */}
      <div
        className="card-aaa"
        style={{
          marginBottom: '24px',
          background:
            configAccesibilidad.contraste === 'AAA_ALTO_CONTRASTE'
              ? 'var(--bg-surface)'
              : 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)',
          borderWidth: '3px',
          borderColor: 'var(--primary-aaa)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <div style={{ flex: '1 1 380px' }}>
            <span className="badge-aaa badge-lsm" style={{ marginBottom: '10px' }}>
              ✨ MEEXUU Framework • Multimodalidad Adaptativa (WCAG 2.2 AAA)
            </span>
            <h1
              id="titulo-inicio-bienvenida"
              style={{ fontSize: '2.2rem', margin: '6px 0 10px 0' }}
            >
              ¡Hola! Aprendamos juntos con LSM y habla 👋
            </h1>
            <p
              style={{
                fontSize: '1.1rem',
                color: 'var(--text-secondary)',
                margin: '0 0 18px 0',
              }}
            >
              Selecciona tu perfil infantil para adaptar los cuentos interactivos, la
              cantidad de texto y los ejercicios de cámara con Realidad Aumentada.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <button
                type="button"
                className="btn-primary-aaa"
                onClick={onIrAlMenu}
                aria-label={`Iniciar sesión como ${perfilActivo.nombre_apodo}`}
              >
                🚀 Iniciar sesión como {perfilActivo.nombre_apodo.split('(')[0].trim()}
              </button>
              <button
                type="button"
                className="btn-secondary-aaa"
                onClick={() => setMostrarFormulario((prev) => !prev)}
                aria-expanded={mostrarFormulario}
              >
                {mostrarFormulario ? '✖ Cerrar registro' : '➕ Crear cuenta / Nuevo perfil (Tutor)'}
              </button>
            </div>
          </div>

          {/* Tarjeta Resumen del Perfil Seleccionado */}
          <div
            className="card-aaa"
            style={{
              flex: '0 1 340px',
              backgroundColor: 'var(--bg-surface)',
              border: '3px solid var(--primary-aaa)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  fontSize: '2.8rem',
                  width: '68px',
                  height: '68px',
                  borderRadius: '18px',
                  backgroundColor: 'var(--bg-card-highlight)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--primary-aaa)',
                }}
                aria-hidden="true"
              >
                {AVATARES_INFANTILES[perfilActivo.id_perfil] || '🧒'}
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  PERFIL ACTIVO SELECCIONADO
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {perfilActivo.nombre_apodo}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  <span className="badge-aaa badge-lsm">
                    🦻 Sordera: {perfilActivo.tipo_sordera}
                  </span>
                  <span className="badge-aaa badge-articulacion">
                    📖 {perfilActivo.nivel_lectura.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario CU-02: Crear Cuenta / Gestionar Perfil (Padre/Tutor) */}
      {mostrarFormulario && (
        <div
          className="card-aaa"
          style={{
            marginBottom: '24px',
            border: '3px solid var(--purple-aaa)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            👨‍👩‍👧 Crear Cuenta / Configurar Nuevo Perfil Adaptativo (CU-02 / RF-01)
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Formulario asistido para el Padre, Madre, Tutor o Terapeuta de Lenguaje (WCAG 3.3.2).
          </p>
          <form onSubmit={handleSubmit} className="grid-2-cols">
            <div className="form-group-aaa">
              <label htmlFor="input-nombre-nino" className="form-label-aaa">
                🧒 Nombre o Apodo del Niño(a):
              </label>
              <input
                id="input-nombre-nino"
                type="text"
                className="form-input-aaa"
                placeholder="Ej. Camila (Niña A: Lectora Inicial)"
                value={nombreApodo}
                onChange={(e) => setNombreApodo(e.target.value)}
                required
              />
            </div>

            <div className="form-group-aaa">
              <label htmlFor="input-fecha-nac" className="form-label-aaa">
                🎂 Fecha de Nacimiento (~6 años):
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
                🦻 Condición Auditiva (`tipo_sordera` en BD):
              </label>
              <select
                id="select-tipo-sordera"
                className="form-input-aaa"
                value={tipoSordera}
                onChange={(e) => setTipoSordera(e.target.value as TipoSordera)}
              >
                <option value="TOTAL">
                  TOTAL — Hipoacusia Completa (Prioriza Módulo 1 LSM)
                </option>
                <option value="PARCIAL">
                  PARCIAL — Hipoacusia Parcial / Auxiliar Auditivo (LSM + Articulación Oral)
                </option>
              </select>
            </div>

            <div className="form-group-aaa">
              <label htmlFor="select-nivel-lectura" className="form-label-aaa">
                📚 Nivel de Alfabetización (`nivel_lectura` en BD):
              </label>
              <select
                id="select-nivel-lectura"
                className="form-input-aaa"
                value={nivelLectura}
                onChange={(e) => setNivelLectura(e.target.value as NivelLectura)}
              >
                <option value="NO_LECTOR">
                  NO_LECTOR — Sin alfabetización (Iconografía grande y 1-3 palabras clave)
                </option>
                <option value="LECTURA_INICIAL">
                  LECTURA_INICIAL — Alfabetización inicial (Etiquetas breves, 3-10 palabras)
                </option>
                <option value="LECTOR_AVANZADO">
                  LECTOR_AVANZADO — Lector fluido (Oraciones breves + subtítulos completos)
                </option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-primary-aaa" disabled={guardando}>
                {guardando ? '⏳ Guardando en PostgreSQL...' : '✅ Guardar Perfil y Activar'}
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
        </div>
      )}

      {/* Selección de los 4 Perfiles Adaptativos Oficiales (Fase 1, Actividad 3, Página 9) */}
      <h2 style={{ marginBottom: '12px' }}>
        🎭 Perfiles Adaptativos del Niño (Fase 1 - Actividad 3)
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: '18px' }}>
        Toca una tarjeta grande (≥ 48×48 dp) para cambiar el perfil activo y observar cómo la
        interfaz se adapta automáticamente a su condición auditiva y nivel de lectura:
      </p>

      <div className="grid-2-cols" style={{ marginBottom: '28px' }}>
        {perfiles.map((perfil) => {
          const esActivo = perfil.id_perfil === perfilActivo.id_perfil;
          const implicacionDUA =
            perfil.nivel_lectura === 'NO_LECTOR'
              ? 'Flujos basados en iconografía y animaciones. Mínima carga de texto.'
              : perfil.tipo_sordera === 'PARCIAL'
              ? 'Subtítulos sincronizados + apoyo visual de articulación bucal.'
              : 'Lengua de Señas Mexicana (LSM) como canal de instrucción primario.';

          return (
            <div
              key={perfil.id_perfil}
              className="card-aaa-interactive"
              style={{
                borderColor: esActivo ? 'var(--primary-aaa)' : 'var(--border-strong)',
                backgroundColor: esActivo ? 'var(--bg-card-highlight)' : 'var(--bg-surface)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '2.5rem' }} aria-hidden="true">
                    {AVATARES_INFANTILES[perfil.id_perfil] || '🧒'}
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.22rem' }}>{perfil.nombre_apodo}</h3>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Tutor: {perfil.nombre_tutor || 'Laura Gómez'}
                    </span>
                  </div>
                </div>
                <span className="star-counter-badge" title="Puntos acumulados">
                  ⭐ {perfil.puntos_acumulados}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  margin: '14px 0',
                }}
              >
                <span className="badge-aaa badge-lsm">
                  🦻 Sordera: {perfil.tipo_sordera}
                </span>
                <span className="badge-aaa badge-articulacion">
                  📚 Nivel: {perfil.nivel_lectura}
                </span>
              </div>

              <p
                style={{
                  fontSize: '0.96rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '16px',
                }}
              >
                <strong>Adaptación DUA:</strong> {implicacionDUA}
              </p>

              <button
                type="button"
                className={esActivo ? 'btn-success-aaa' : 'btn-primary-aaa'}
                style={{ width: '100%' }}
                onClick={() => {
                  onSelectPerfil(perfil);
                }}
              >
                {esActivo
                  ? '✓ Perfil Activo — Continuar al Menú'
                  : `Seleccionar a ${perfil.nombre_apodo.split('(')[0].trim()}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Matriz DUA - Momento 1: Anticipación y Configuración Sensorial Previa (Fase 2, Act. 1.1) */}
      <div className="card-aaa">
        <h2 style={{ marginTop: 0 }}>
          🛡️ Momento 1 DUA: Anticipación y Confort Sensorial Previo al Estímulo
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
          Ajusta el entorno visual y acústico antes de iniciar la sesión para evitar fatiga visual
          o picos auditivos en usuarios de implantes cocleares o auxiliares auditivos:
        </p>

        <div className="grid-3-cols">
          <div className="card-aaa" style={{ backgroundColor: 'var(--bg-app)' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.05rem' }}>
              🔊 Traducción Cromático-Lumínica (dB)
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
              Simula el umbral de decibeles ambiental (&lt;50 dB Zona Segura, 50-65 dB Advertencia,
              &gt;65 dB atenúa luminancia automáticamente):
            </p>
            <label htmlFor="slider-decibeles" className="form-label-aaa">
              Nivel actual: {configAccesibilidad.nivelDecibeles} dB
            </label>
            <input
              id="slider-decibeles"
              type="range"
              min={30}
              max={75}
              step={1}
              value={configAccesibilidad.nivelDecibeles}
              onChange={(e) =>
                onUpdateConfig({ nivelDecibeles: Number(e.target.value) })
              }
              style={{ width: '100%', minHeight: '48px' }}
            />
          </div>

          <div className="card-aaa" style={{ backgroundColor: 'var(--bg-app)' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.05rem' }}>
              🔤 Tamaño de Texto y Contraste AAA
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
              Fuente Atkinson Hyperlegible con contraste ≥ 7:1 e interlineado 1.55x:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(['NORMAL', 'GRANDE', 'EXTRA_GRANDE'] as const).map((tam) => (
                <button
                  key={tam}
                  type="button"
                  className={
                    configAccesibilidad.tamanoTexto === tam
                      ? 'btn-primary-aaa'
                      : 'btn-secondary-aaa'
                  }
                  onClick={() => onUpdateConfig({ tamanoTexto: tam })}
                  style={{ flex: 1, padding: '8px 10px', fontSize: '0.9rem' }}
                >
                  {tam.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="card-aaa" style={{ backgroundColor: 'var(--bg-app)' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.05rem' }}>
              🤫 Exploración Sin Estrés
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
              Permite recorrer las pantallas en silencio total sin estímulos sonoros súbitos:
            </p>
            <button
              type="button"
              className={
                configAccesibilidad.modoPreExploracionSilenciosa
                  ? 'btn-success-aaa'
                  : 'btn-secondary-aaa'
              }
              style={{ width: '100%' }}
              onClick={() =>
                onUpdateConfig({
                  modoPreExploracionSilenciosa:
                    !configAccesibilidad.modoPreExploracionSilenciosa,
                })
              }
            >
              {configAccesibilidad.modoPreExploracionSilenciosa
                ? '✓ Modo Pre-exploración Silenciosa Activo'
                : 'Activar Pre-exploración Silenciosa'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
