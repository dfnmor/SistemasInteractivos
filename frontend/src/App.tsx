import React, { useEffect, useState, useCallback } from 'react';
import {
  PerfilNino,
  Cuento,
  Recompensa,
  VistaActiva,
  ConfiguracionAccesibilidad,
  TipoCuento,
  TipoSordera,
  NivelLectura,
} from './types/meexuu';
import {
  fetchPerfiles,
  fetchCuentos,
  fetchRecompensas,
  fetchHealthStatus,
  crearNuevoPerfil,
  guardarProgresoCuento,
  enviarMetricaIntento,
  canjearRecompensaApi,
} from './services/api';
import { InicioPerfilView } from './views/InicioPerfilView';
import { CatalogoCuentosView } from './views/CatalogoCuentosView';
import { PracticaSenaV1View } from './views/PracticaSenaV1View';
import { ModuloLSMView } from './views/ModuloLSMView';
import { ModuloArticulacionView } from './views/ModuloArticulacionView';
import { PanelTutorView } from './views/PanelTutorView';

function resolveVistaFromPathname(pathname: string): VistaActiva {
  if (pathname === '/practica-v1') return 'PRACTICA_V1';
  if (pathname === '/practica-v2') return 'PRACTICA_V2';
  if (pathname === '/cuentos') return 'CATALOGO_CUENTOS';
  if (pathname === '/articulacion') return 'MODULO_2_ARTICULACION';
  if (pathname === '/tutor') return 'PANEL_TUTOR';
  return 'INICIO_PERFIL';
}

export const App: React.FC = () => {
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>(() =>
    resolveVistaFromPathname(window.location.pathname)
  );
  const [perfiles, setPerfiles] = useState<PerfilNino[]>([]);
  const [perfilActivo, setPerfilActivo] = useState<PerfilNino>({
    id_perfil: 1,
    id_tutor: 1,
    nombre_apodo: 'Mateo (Sordera Parcial • Lector Inicial)',
    fecha_nacimiento: '2020-04-15',
    tipo_sordera: 'PARCIAL',
    nivel_lectura: 'LECTURA_INICIAL',
    puntos_acumulados: 90,
  });
  const [cuentos, setCuentos] = useState<Cuento[]>([]);
  const [recompensas, setRecompensas] = useState<Recompensa[]>([]);
  const [healthInfo, setHealthInfo] = useState<{
    online: boolean;
    dbConnected: boolean;
    mode: string;
  }>({ online: false, dbConnected: false, mode: 'verificando' });

  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState<{
    palabra: string;
    idEjercicio: number;
    idCuento?: number;
  }>({ palabra: 'HOLA', idEjercicio: 1, idCuento: 1 });

  const [configAccesibilidad, setConfigAccesibilidad] =
    useState<ConfiguracionAccesibilidad>({
      tamanoTexto: 'NORMAL',
      contraste: 'AAA_ESTANDAR',
      velocidadAnimacion: 1.0,
      nivelDecibeles: 42,
      pausaSensorialActiva: false,
      modoPreExploracionSilenciosa: false,
    });

  const handleNavigate = useCallback((vista: VistaActiva, customPath?: string) => {
    setVistaActiva(vista);
    const defaultPaths: Record<VistaActiva, string> = {
      INICIO_PERFIL: '/',
      CATALOGO_CUENTOS: '/cuentos',
      PRACTICA_V1: '/practica-v1',
      PRACTICA_V2: '/practica-v2',
      MODULO_2_ARTICULACION: '/articulacion',
      PANEL_TUTOR: '/tutor',
    };
    const nextPath = customPath || defaultPaths[vista] || '/';
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setVistaActiva(resolveVistaFromPathname(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const cargarDatosPerfil = useCallback(async (idPerfil: number) => {
    const [listaPerfiles, listaCuentos, listaRecompensas, health] =
      await Promise.all([
        fetchPerfiles(),
        fetchCuentos({ id_perfil: idPerfil }),
        fetchRecompensas(idPerfil),
        fetchHealthStatus(),
      ]);

    setPerfiles(listaPerfiles);
    const encontrado =
      listaPerfiles.find((p) => p.id_perfil === idPerfil) || listaPerfiles[0];
    if (encontrado) {
      setPerfilActivo(encontrado);
    }
    setCuentos(listaCuentos);
    setRecompensas(listaRecompensas);
    setHealthInfo(health);
  }, []);

  useEffect(() => {
    cargarDatosPerfil(perfilActivo.id_perfil);
  }, [cargarDatosPerfil, perfilActivo.id_perfil]);

  useEffect(() => {
    const rootHtml = document.documentElement;
    rootHtml.setAttribute('data-contrast', configAccesibilidad.contraste);
    rootHtml.setAttribute('data-font-scale', configAccesibilidad.tamanoTexto);
    const atenuar =
      configAccesibilidad.pausaSensorialActiva ||
      configAccesibilidad.nivelDecibeles > 65;
    rootHtml.setAttribute('data-luminance-attenuated', String(atenuar));
  }, [configAccesibilidad]);

  const handleUpdateConfig = (partial: Partial<ConfiguracionAccesibilidad>) => {
    setConfigAccesibilidad((prev) => ({ ...prev, ...partial }));
  };

  const handleSelectPerfil = (perfil: PerfilNino) => {
    setPerfilActivo(perfil);
    cargarDatosPerfil(perfil.id_perfil);
  };

  const handleCreatePerfil = async (payload: {
    nombre_apodo: string;
    fecha_nacimiento: string;
    tipo_sordera: TipoSordera;
    nivel_lectura: NivelLectura;
  }) => {
    const creado = await crearNuevoPerfil(payload);
    setPerfiles((prev) => [...prev, creado]);
    setPerfilActivo(creado);
    handleNavigate('CATALOGO_CUENTOS', '/cuentos');
  };

  const handleCompletarCuento = async (idCuento: number) => {
    await guardarProgresoCuento(idCuento, perfilActivo.id_perfil, 30);
    await cargarDatosPerfil(perfilActivo.id_perfil);
  };

  const handleCanjearRecompensa = async (
    idRecompensa: number
  ): Promise<{ ok: boolean; mensaje: string }> => {
    const res = await canjearRecompensaApi(perfilActivo.id_perfil, idRecompensa);
    if (res.ok) {
      await cargarDatosPerfil(perfilActivo.id_perfil);
    }
    return { ok: res.ok, mensaje: res.mensaje };
  };

  const handleRegistrarIntento = async (
    idEjercicio: number,
    precision: number
  ) => {
    const res = await enviarMetricaIntento({
      id_perfil: perfilActivo.id_perfil,
      id_ejercicio: idEjercicio,
      porcentaje_precision: precision,
    });
    await cargarDatosPerfil(perfilActivo.id_perfil);
    return res.retroalimentacion;
  };

  const handlePracticarEjercicio = (
    tipo: TipoCuento,
    palabra: string,
    idEjercicio: number,
    idCuento?: number
  ) => {
    setEjercicioSeleccionado({ palabra, idEjercicio, idCuento });
    if (tipo === 'LSM') {
      handleNavigate('PRACTICA_V2', '/practica-v2');
    } else {
      handleNavigate('MODULO_2_ARTICULACION', '/articulacion');
    }
  };

  const dbClase =
    configAccesibilidad.nivelDecibeles < 50
      ? 'decibel-safe'
      : configAccesibilidad.nivelDecibeles <= 65
      ? 'decibel-warn'
      : 'decibel-peak';

  const dbEtiqueta =
    configAccesibilidad.nivelDecibeles < 50
      ? `🔵 ${configAccesibilidad.nivelDecibeles} dB • Zona Segura`
      : configAccesibilidad.nivelDecibeles <= 65
      ? `🟡 ${configAccesibilidad.nivelDecibeles} dB • Advertencia Suave`
      : `🟣 ${configAccesibilidad.nivelDecibeles} dB • Atenuando Luminancia`;

  return (
    <div className="app-shell">
      <header className="top-header-dua" role="banner">
        <div className="brand-block">
          <div className="brand-logo-badge" aria-hidden="true">
            🤟🏽
          </div>
          <div>
            <p className="brand-title">Señas y Sonrisas</p>
            <p className="brand-subtitle">
              MEEXUU Framework • {perfilActivo.nombre_apodo.split('(')[0].trim()} (
              {perfilActivo.tipo_sordera} / {perfilActivo.nivel_lectura})
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            className="star-counter-badge"
            aria-label={`Puntos acumulados en BD: ${perfilActivo.puntos_acumulados}`}
          >
            <span>⭐</span>
            <span>{perfilActivo.puntos_acumulados} pts</span>
          </div>

          <div className={`decibel-pill ${dbClase}`}>{dbEtiqueta}</div>

          <button
            type="button"
            className="btn-calm-sensory"
            aria-pressed={configAccesibilidad.pausaSensorialActiva}
            onClick={() =>
              handleUpdateConfig({
                pausaSensorialActiva: !configAccesibilidad.pausaSensorialActiva,
              })
            }
          >
            {configAccesibilidad.pausaSensorialActiva
              ? '🌿 Reanudar Actividad'
              : '🌿 Pausa Sensorial'}
          </button>

          <button
            type="button"
            className="btn-secondary-aaa"
            onClick={() =>
              handleUpdateConfig({
                contraste:
                  configAccesibilidad.contraste === 'AAA_ESTANDAR'
                    ? 'AAA_ALTO_CONTRASTE'
                    : 'AAA_ESTANDAR',
              })
            }
          >
            {configAccesibilidad.contraste === 'AAA_ESTANDAR'
              ? '🌗 Contraste AAA Nocturno'
              : '☀️ Contraste AAA Diurno'}
          </button>
        </div>
      </header>

      {configAccesibilidad.pausaSensorialActiva && (
        <div className="sensory-pause-banner" role="alert">
          <div>
            <strong style={{ fontSize: '1.15rem' }}>
              🌿 Modo de Calma y Pausa Sensorial Activo (DUA Principio III)
            </strong>
            <p style={{ margin: '4px 0 0 0' }}>
              El sonido está silenciado al 100%, el brillo está suavizado y tu progreso en
              PostgreSQL está guardado sin límite de tiempo.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary-aaa"
            onClick={() => handleUpdateConfig({ pausaSensorialActiva: false })}
          >
            ✨ Estoy listo para continuar
          </button>
        </div>
      )}

      <main role="main" style={{ flex: 1 }}>
        {vistaActiva === 'INICIO_PERFIL' && (
          <InicioPerfilView
            perfiles={perfiles}
            perfilActivo={perfilActivo}
            configAccesibilidad={configAccesibilidad}
            onSelectPerfil={handleSelectPerfil}
            onCreatePerfil={handleCreatePerfil}
            onUpdateConfig={handleUpdateConfig}
            onIrAlMenu={() => handleNavigate('CATALOGO_CUENTOS', '/cuentos')}
          />
        )}

        {vistaActiva === 'CATALOGO_CUENTOS' && (
          <CatalogoCuentosView
            perfilActivo={perfilActivo}
            cuentos={cuentos}
            recompensas={recompensas}
            onNavigate={handleNavigate}
            onCompletarCuento={handleCompletarCuento}
            onCanjearRecompensa={handleCanjearRecompensa}
            onPracticarEjercicio={handlePracticarEjercicio}
          />
        )}

        {vistaActiva === 'PRACTICA_V1' && (
          <PracticaSenaV1View
            perfilActivo={perfilActivo}
            cuentos={cuentos}
            senaInicial={ejercicioSeleccionado}
            onRegistrarIntento={handleRegistrarIntento}
            onNavigate={handleNavigate}
          />
        )}

        {vistaActiva === 'PRACTICA_V2' && (
          <ModuloLSMView
            perfilActivo={perfilActivo}
            cuentos={cuentos}
            senaInicial={ejercicioSeleccionado}
            onRegistrarIntento={handleRegistrarIntento}
            onNavigate={handleNavigate}
          />
        )}

        {vistaActiva === 'MODULO_2_ARTICULACION' && (
          <ModuloArticulacionView
            perfilActivo={perfilActivo}
            palabraInicial={ejercicioSeleccionado}
            onRegistrarIntento={handleRegistrarIntento}
            onNavigate={handleNavigate}
          />
        )}

        {vistaActiva === 'PANEL_TUTOR' && (
          <PanelTutorView
            perfiles={perfiles}
            perfilActivo={perfilActivo}
            onSelectPerfil={handleSelectPerfil}
            onPerfilActualizado={(actualizado) => {
              setPerfilActivo(actualizado);
              setPerfiles((prev) =>
                prev.map((p) =>
                  p.id_perfil === actualizado.id_perfil ? actualizado : p
                )
              );
            }}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      <footer
        style={{
          marginTop: '28px',
          padding: '12px 16px',
          borderRadius: '14px',
          backgroundColor: 'var(--bg-surface)',
          border: '2px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem',
          color: 'var(--text-secondary)',
        }}
      >
        <div>
          <strong>Clave:</strong> TSI-2026-MEEXUU • <strong>Rutas Activas:</strong>{' '}
          <code>/practica-v1</code> (Original) y <code>/practica-v2</code> (DIX09)
        </div>
        <div>
          <strong>Estado Backend/PostgreSQL:</strong>{' '}
          {healthInfo.online && healthInfo.dbConnected
            ? '🟢 Conectado a PostgreSQL (db_meexuu)'
            : healthInfo.online
            ? '🟡 API Conectada'
            : '🔴 Sin conexión a API'}
        </div>
      </footer>

      <nav
        className="bottom-nav-aaa"
        aria-label="Navegación principal de Señas y Sonrisas"
      >
        <button
          type="button"
          className="bottom-nav-btn"
          aria-current={vistaActiva === 'INICIO_PERFIL' ? 'page' : undefined}
          onClick={() => handleNavigate('INICIO_PERFIL', '/')}
        >
          <span style={{ fontSize: '1.3rem' }} aria-hidden="true">
            🧒
          </span>
          <span>1. Perfiles</span>
        </button>

        <button
          type="button"
          className="bottom-nav-btn"
          aria-current={vistaActiva === 'CATALOGO_CUENTOS' ? 'page' : undefined}
          onClick={() => handleNavigate('CATALOGO_CUENTOS', '/cuentos')}
        >
          <span style={{ fontSize: '1.3rem' }} aria-hidden="true">
            📚
          </span>
          <span>2. Cuentos</span>
        </button>

        <button
          type="button"
          className="bottom-nav-btn"
          aria-current={vistaActiva === 'PRACTICA_V1' ? 'page' : undefined}
          onClick={() => handleNavigate('PRACTICA_V1', '/practica-v1')}
        >
          <span style={{ fontSize: '1.3rem' }} aria-hidden="true">
            📷
          </span>
          <span>3a. LSM v1 (Antes)</span>
        </button>

        <button
          type="button"
          className="bottom-nav-btn"
          aria-current={vistaActiva === 'PRACTICA_V2' ? 'page' : undefined}
          onClick={() => handleNavigate('PRACTICA_V2', '/practica-v2')}
        >
          <span style={{ fontSize: '1.3rem' }} aria-hidden="true">
            ✨
          </span>
          <span>3b. LSM v2 (DIX09)</span>
        </button>

        <button
          type="button"
          className="bottom-nav-btn"
          aria-current={
            vistaActiva === 'MODULO_2_ARTICULACION' ? 'page' : undefined
          }
          onClick={() => handleNavigate('MODULO_2_ARTICULACION', '/articulacion')}
        >
          <span style={{ fontSize: '1.3rem' }} aria-hidden="true">
            👄
          </span>
          <span>4. Habla</span>
        </button>

        <button
          type="button"
          className="bottom-nav-btn"
          aria-current={vistaActiva === 'PANEL_TUTOR' ? 'page' : undefined}
          onClick={() => handleNavigate('PANEL_TUTOR', '/tutor')}
        >
          <span style={{ fontSize: '1.3rem' }} aria-hidden="true">
            📊
          </span>
          <span>5. Tutor</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
