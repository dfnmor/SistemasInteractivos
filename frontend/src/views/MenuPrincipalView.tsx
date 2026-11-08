import React, { useState } from 'react';
import {
  PerfilNino,
  Recompensa,
  VistaActiva,
} from '../types/meexuu';

/* =============================================================================
 * PANEL DE INICIO Y SELECCIÓN DE MÓDULO (tras elegir perfil)
 * Wireframe 1 (Fase 2, Act. 6, p. 9): "1. Inicio y Selección de Módulo"
 *   1. Tarjeta "¡BIENVENIDO DE VUELTA! / ¡Hola, [nombre]!" con puntos (★)
 *   2. Tarjeta "Misión de Hoy" ("2 de 3 logradas") con barra de progreso y
 *      3 metas: Seña "Hola", Boca "A-O", Cuento Conejo
 *   3. Tarjeta "Aprende LSM" ("Visual & Espacial") con botón "▶ Jugar Cuentos"
 *   4. Tarjeta "Habla y Pronuncia" ("Espejo & Fonemas") con botón "🎙 Entrenar Boca"
 *   5. Sección "Mis Trofeos Ganados" (Super Estrella, Manita Maestra, Voz Clara)
 *   6. Tarjeta "ZONA PROTEGIDA: Modo Padres y Terapeutas" con botón "Entrar"
 * ============================================================================= */

interface MenuPrincipalViewProps {
  perfilActivo: PerfilNino;
  recompensas: Recompensa[];
  onNavigate: (vista: VistaActiva, path?: string) => void;
  onCanjearRecompensa: (
    id_recompensa: number
  ) => Promise<{ ok: boolean; mensaje: string }>;
}

export const MenuPrincipalView: React.FC<MenuPrincipalViewProps> = ({
  perfilActivo,
  recompensas,
  onNavigate,
  onCanjearRecompensa,
}) => {
  const esNoLector = perfilActivo.nivel_lectura === 'NO_LECTOR';
  const nombreCorto = perfilActivo.nombre_apodo.split('(')[0].trim();
  const [estadoCanje, setEstadoCanje] = useState<{
    ok: boolean;
    mensaje: string;
  } | null>(null);

  const misiones = [
    { icono: '✓', texto: esNoLector ? '✋' : 'Seña "Hola"', lograda: true },
    { icono: '✓', texto: esNoLector ? '👄' : 'Boca "A-O"', lograda: true },
    { icono: '☆', texto: esNoLector ? '🐰' : 'Cuento Conejo', lograda: false },
  ];
  const logradas = 2;

  return (
    <section
      aria-labelledby="titulo-hola"
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      {/* 1. Tarjeta de bienvenida: "¡Hola, [nombre]!" con puntos (Wireframe 1) */}
      <div
        className="card-aaa"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            aria-hidden="true"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#DBEAFE',
              border: '2px solid #93C5FD',
              color: '#0052A3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              flexShrink: 0,
            }}
          >
            👤
          </div>
          <div>
            {!esNoLector && (
              <p
                className="text-support"
                style={{
                  fontWeight: 700,
                  color: '#0052A3',
                  fontSize: '0.78rem',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
              >
                ¡BIENVENIDO DE VUELTA!
              </p>
            )}
            <h1 id="titulo-hola" style={{ margin: 0, fontSize: '1.45rem' }}>
              ¡Hola, {nombreCorto}!
            </h1>
          </div>
        </div>

        <div
          className="star-counter-badge"
          style={{ fontSize: '1.05rem' }}
          aria-label={`${perfilActivo.puntos_acumulados} puntos`}
        >
          <span aria-hidden="true">★</span>
          <span>{perfilActivo.puntos_acumulados}</span>
        </div>
      </div>

      {/* 2. Misión de Hoy con barra de progreso (Wireframe 1) */}
      <div className="card-aaa">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <h2 className="section-title">
            <span aria-hidden="true">🎯 </span>
            {esNoLector ? 'Hoy' : 'Misión de Hoy'}
          </h2>
          <span
            className="pill-label"
            style={{ backgroundColor: '#DBEAFE', color: '#1E3A8A' }}
          >
            {logradas} {esNoLector ? '/ 3' : 'de 3 logradas'}
          </span>
        </div>

        {/* Barra de progreso de Misión de Hoy */}
        <div
          className="progress-track-aaa"
          style={{ margin: '10px 0 14px 0', height: '10px' }}
        >
          <div
            className="progress-fill-aaa"
            style={{ width: `${(logradas / 3) * 100}%` }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            textAlign: 'center',
          }}
        >
          {misiones.map((m) => (
            <div
              key={m.texto}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: m.lograda ? '#DBEAFE' : 'transparent',
                  border: m.lograda
                    ? '2px solid #0052A3'
                    : '2px dashed var(--border-strong)',
                  color: m.lograda ? '#0052A3' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.15rem',
                }}
              >
                {m.icono}
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)',
                }}
              >
                {m.texto}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Tarjeta Módulo 1: "Aprende LSM" → "▶ Jugar Cuentos" (Wireframe 1) */}
      <div
        className="card-aaa"
        style={{
          borderColor: '#93C5FD',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div>
            <span
              className="pill-label"
              style={{ backgroundColor: '#DBEAFE', color: '#1E3A8A' }}
            >
              👁 {esNoLector ? 'LSM' : 'Visual & Espacial'}
            </span>
            <h2
              className="section-title"
              style={{ fontSize: '1.3rem', marginTop: '8px' }}
            >
              Aprende LSM
            </h2>
            {!esNoLector && (
              <p className="text-support" style={{ marginTop: '4px' }}>
                Mira los cuentos animados y practica señas con tus manos.
              </p>
            )}
          </div>

          <div
            aria-hidden="true"
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              backgroundColor: '#DBEAFE',
              color: '#0052A3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.9rem',
              flexShrink: 0,
            }}
          >
            ✋
          </div>
        </div>

        <button
          type="button"
          className="btn-primary-aaa"
          style={{ width: '100%' }}
          onClick={() => onNavigate('CATALOGO_CUENTOS', '/cuentos')}
        >
          <span aria-hidden="true">▶</span>
          <span>Jugar Cuentos</span>
        </button>
      </div>

      {/* 4. Tarjeta Módulo 2: "Habla y Pronuncia" → "🎙 Entrenar Boca" (Wireframe 1) */}
      <div
        className="card-aaa"
        style={{
          borderColor: '#5EEAD4',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div>
            <span
              className="pill-label"
              style={{ backgroundColor: '#CCFBF1', color: '#115E59' }}
            >
              👄 {esNoLector ? 'Habla' : 'Espejo & Fonemas'}
            </span>
            <h2
              className="section-title"
              style={{ fontSize: '1.3rem', marginTop: '8px' }}
            >
              Habla y Pronuncia
            </h2>
            {!esNoLector && (
              <p className="text-support" style={{ marginTop: '4px' }}>
                Mira cómo se mueve la boca frente a la cámara y repite los
                sonidos.
              </p>
            )}
          </div>

          <div
            aria-hidden="true"
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              backgroundColor: '#CCFBF1',
              color: '#0F5E59',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.9rem',
              flexShrink: 0,
            }}
          >
            🗣️
          </div>
        </div>

        <button
          type="button"
          className="btn-teal-aaa"
          style={{ width: '100%' }}
          onClick={() => onNavigate('MODULO_2_ARTICULACION', '/articulacion')}
        >
          <span aria-hidden="true">🎙</span>
          <span>Entrenar Boca</span>
        </button>
      </div>

      {/* 5. Mis Trofeos Ganados (Wireframe 1) */}
      <div className="card-aaa">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <h2 className="section-title">
            <span aria-hidden="true">🏆 </span>
            {esNoLector ? 'Trofeos' : 'Mis Trofeos Ganados'}
          </h2>
          {!esNoLector && (
            <button
              type="button"
              onClick={() => onNavigate('PANEL_TUTOR', '/tutor')}
              style={{
                minHeight: '48px',
                padding: '4px 10px',
                backgroundColor: 'transparent',
                color: '#0052A3',
                fontSize: '0.84rem',
                fontWeight: 700,
              }}
            >
              Ver todos →
            </button>
          )}
        </div>

        {estadoCanje && (
          <div
            role="status"
            style={{
              marginBottom: '10px',
              padding: '8px 12px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.85rem',
              backgroundColor: estadoCanje.ok
                ? 'var(--success-bg)'
                : 'var(--warn-bg)',
              border: `2px solid ${
                estadoCanje.ok ? 'var(--success-border)' : 'var(--warn-border)'
              }`,
              color: estadoCanje.ok
                ? 'var(--success-text)'
                : 'var(--warn-text)',
            }}
          >
            {estadoCanje.ok ? '✓ ' : '⚠️ '}
            {estadoCanje.mensaje}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
          }}
        >
          {recompensas.map((rec) => {
            const nombreCortoTrofeo = rec.nombre
              .replace(' Dorada', '')
              .replace(' LSM', '')
              .replace('Trofeo ', '');
            return (
              <button
                key={rec.id_recompensa}
                type="button"
                disabled={rec.desbloqueada}
                onClick={async () =>
                  setEstadoCanje(await onCanjearRecompensa(rec.id_recompensa))
                }
                aria-label={
                  rec.desbloqueada
                    ? `${rec.nombre}: Ganado`
                    : `Canjear ${rec.nombre} por ${rec.costo_puntos} estrellas`
                }
                style={{
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '10px 6px',
                  minHeight: '100px',
                  borderRadius: '16px',
                  border: `2px solid ${
                    rec.desbloqueada ? '#F59E0B' : 'var(--border-subtle)'
                  }`,
                  backgroundColor: rec.desbloqueada
                    ? '#FFFBEB'
                    : 'var(--bg-surface)',
                  color: '#0F172A',
                  cursor: rec.desbloqueada ? 'default' : 'pointer',
                }}
              >
                <span style={{ fontSize: '1.75rem' }} aria-hidden="true">
                  {rec.icono_url}
                </span>
                {!esNoLector && (
                  <span style={{ fontSize: '0.8rem', lineHeight: 1.15 }}>
                    {nombreCortoTrofeo}
                  </span>
                )}
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: rec.desbloqueada ? '#047857' : '#0052A3',
                  }}
                >
                  {rec.desbloqueada ? 'Ganado' : `★ ${rec.costo_puntos}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Zona Protegida: Modo Padres y Terapeutas (Wireframe 1) */}
      <div
        className="card-aaa"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: 'var(--bg-surface-soft)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            aria-hidden="true"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              flexShrink: 0,
            }}
          >
            🛡
          </div>
          <div>
            <p
              className="text-support"
              style={{
                fontWeight: 700,
                fontSize: '0.74rem',
                letterSpacing: '0.04em',
              }}
            >
              ZONA PROTEGIDA
            </p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.96rem' }}>
              Modo Padres y Terapeutas
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn-secondary-aaa"
          onClick={() => onNavigate('PANEL_TUTOR', '/tutor')}
        >
          Entrar
        </button>
      </div>
    </section>
  );
};
