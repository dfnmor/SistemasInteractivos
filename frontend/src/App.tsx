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
  crearNuevoPerfil,
  guardarProgresoCuento,
  enviarMetricaIntento,
  canjearRecompensaApi,
} from './services/api';
import { InicioPerfilView } from './views/InicioPerfilView';
import { MenuPrincipalView } from './views/MenuPrincipalView';
import { CatalogoCuentosView } from './views/CatalogoCuentosView';
import { PracticaSenaV1View } from './views/PracticaSenaV1View';
import { ModuloLSMView } from './views/ModuloLSMView';
import { ModuloArticulacionView } from './views/ModuloArticulacionView';
import { PanelTutorView } from './views/PanelTutorView';

function resolveVistaFromPathname(pathname: string): VistaActiva {
  if (pathname === '/practica-v1') return 'PRACTICA_V1';
  if (pathname === '/practica-v2') return 'PRACTICA_V2';
  if (pathname === '/menu') return 'MENU_PRINCIPAL';
  if (pathname === '/cuentos') return 'CATALOGO_CUENTOS';
  if (pathname === '/articulacion') return 'MODULO_2_ARTICULACION';
  if (pathname === '/tutor') return 'PANEL_TUTOR';
  return 'INICIO_PERFIL';
}

export const App: React.FC = () => {
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>(() =>
    resolveVistaFromPathname(window.location.pathname)
  );
  const [modoDemo, setModoDemo] = useState<boolean>(() =>
    new URLSearchParams(window.location.search).get('demo') === '1'
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
      MENU_PRINCIPAL: '/menu',
      CATALOGO_CUENTOS: '/cuentos',
      PRACTICA_V1: '/practica-v1',
      PRACTICA_V2: '/practica-v2',
      MODULO_2_ARTICULACION: '/articulacion',
      PANEL_TUTOR: '/tutor',
    };
    const nextPath = customPath || defaultPaths[vista] || '/';
    const search = window.location.search;
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', `${nextPath}${search}`);
    }
  }, []);

  const handleToggleDemo = useCallback(() => {
    setModoDemo((prev) => {
      const next = !prev;
      const params = new URLSearchParams(window.location.search);
      if (next) {
        params.set('demo', '1');
      } else {
        params.delete('demo');
      }
      const query = params.toString();
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}${query ? `?${query}` : ''}`
      );
      return next;
    });
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setVistaActiva(resolveVistaFromPathname(window.location.pathname));
      setModoDemo(
        new URLSearchParams(window.location.search).get('demo') === '1'
      );
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const cargarDatosPerfil = useCallback(async (idPerfil: number) => {
    const [listaPerfiles, listaCuentos, listaRecompensas] = await Promise.all([
      fetchPerfiles(),
      fetchCuentos({ id_perfil: idPerfil }),
      fetchRecompensas(idPerfil),
    ]);

    setPerfiles(listaPerfiles);
    const encontrado =
      listaPerfiles.find((p) => p.id_perfil === idPerfil) || listaPerfiles[0];
    if (encontrado) {
      setPerfilActivo(encontrado);
    }
    setCuentos(listaCuentos);
    setRecompensas(listaRecompensas);
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
    handleNavigate('MENU_PRINCIPAL', '/menu');
  };

  const handleCompletarCuento = async (idCuento: number) => {
    await guardarProgresoCuento(idCuento, perfilActivo.id_perfil, 30, 'COMPLETADO');
    await cargarDatosPerfil(perfilActivo.id_perfil);
  };

  const handleActualizarProgresoParcial = async (
    idCuento: number,
    puntosEstimados = 15
  ) => {
    await guardarProgresoCuento(
      idCuento,
      perfilActivo.id_perfil,
      puntosEstimados,
      'EN_PROGRESO'
    );
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

  const esNoLector = perfilActivo.nivel_lectura === 'NO_LECTOR';

  // /practica-v1 se mantiene sin modificar (versión "antes de DIX09")
  if (vistaActiva === 'PRACTICA_V1') {
    return (
      <div className="app-shell">
        <main role="main">
          <PracticaSenaV1View
            perfilActivo={perfilActivo}
            cuentos={cuentos}
            senaInicial={ejercicioSeleccionado}
            onRegistrarIntento={handleRegistrarIntento}
            onNavigate={handleNavigate}
          />
        </main>
      </div>
    );
  }

  const subtituloHeader =
    vistaActiva === 'CATALOGO_CUENTOS' ? 'Cuentos LSM' : 'Inicio';

  return (
    <div className="app-shell">
      <div className="wireframe-device-frame">
        {/* ===================================================================
            BARRA SUPERIOR IDÉNTICA A LOS WIREFRAMES 1 Y 2 (p. 9)
            "Señas y Sonrisas (Inicio / Cuentos LSM) | ☆ [puntos] | 🔔 | 🛡"
           =================================================================== */}
        <header className="wireframe-top-bar" role="banner">
          <div
            className="wireframe-brand"
            style={{ cursor: 'pointer' }}
            onClick={() => handleNavigate('INICIO_PERFIL', '/')}
            title="Cambiar perfil adaptativo"
          >
            <div>
              <p className="wireframe-brand-title">Señas y Sonrisas</p>
              {!esNoLector && (
                <p className="wireframe-brand-sub">{subtituloHeader}</p>
              )}
            </div>
          </div>

          <div className="wireframe-top-actions">
            <div
              className="star-counter-badge"
              aria-label={`Puntos acumulados: ${perfilActivo.puntos_acumulados}`}
            >
              <span>☆</span>
              <span>{perfilActivo.puntos_acumulados}</span>
            </div>

            <button
              type="button"
              className="icon-btn-48"
              aria-pressed={configAccesibilidad.pausaSensorialActiva}
              onClick={() =>
                handleUpdateConfig({
                  pausaSensorialActiva: !configAccesibilidad.pausaSensorialActiva,
                })
              }
              title="Pausa sensorial / Calma visual"
              aria-label="Activar o desactivar pausa sensorial"
            >
              🔔
            </button>

            <button
              type="button"
              className="icon-btn-48"
              onClick={() =>
                handleUpdateConfig({
                  contraste:
                    configAccesibilidad.contraste === 'AAA_ESTANDAR'
                      ? 'AAA_ALTO_CONTRASTE'
                      : 'AAA_ESTANDAR',
                })
              }
              title="Alternar contraste WCAG 2.2 AAA"
              aria-label="Alternar modo de alto contraste AAA"
            >
              🛡
            </button>
          </div>
        </header>

        {configAccesibilidad.pausaSensorialActiva && (
          <div
            className="sensory-pause-banner"
            style={{ margin: '10px 14px 0 14px' }}
            role="alert"
          >
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>
              🌿 Pausa sensorial activa (Brillo suavizado y sin límite de tiempo)
            </div>
            <button
              type="button"
              className="btn-primary-aaa"
              style={{ padding: '6px 12px', fontSize: '0.84rem' }}
              onClick={() => handleUpdateConfig({ pausaSensorialActiva: false })}
            >
              Reanudar
            </button>
          </div>
        )}

        {/* ===================================================================
            CUERPO DE LA PANTALLA ACTIVA SEGÚN EL WIREFRAME
           =================================================================== */}
        <main className="wireframe-screen-body" role="main">
          {vistaActiva === 'INICIO_PERFIL' && (
            <InicioPerfilView
              perfiles={perfiles}
              perfilActivo={perfilActivo}
              configAccesibilidad={configAccesibilidad}
              onSelectPerfil={handleSelectPerfil}
              onCreatePerfil={handleCreatePerfil}
              onUpdateConfig={handleUpdateConfig}
              onIrAlMenu={() => handleNavigate('MENU_PRINCIPAL', '/menu')}
            />
          )}

          {vistaActiva === 'MENU_PRINCIPAL' && (
            <MenuPrincipalView
              perfilActivo={perfilActivo}
              recompensas={recompensas}
              onNavigate={handleNavigate}
              onCanjearRecompensa={handleCanjearRecompensa}
            />
          )}

          {vistaActiva === 'CATALOGO_CUENTOS' && (
            <CatalogoCuentosView
              perfilActivo={perfilActivo}
              cuentos={cuentos}
              onNavigate={handleNavigate}
              onCompletarCuento={handleCompletarCuento}
              onGuardarProgresoParcial={handleActualizarProgresoParcial}
              onPracticarEjercicio={handlePracticarEjercicio}
            />
          )}

          {vistaActiva === 'PRACTICA_V2' && (
            <ModuloLSMView
              perfilActivo={perfilActivo}
              cuentos={cuentos}
              senaInicial={ejercicioSeleccionado}
              modoDemo={modoDemo}
              onToggleDemo={handleToggleDemo}
              onRegistrarIntento={handleRegistrarIntento}
              onNavigate={handleNavigate}
            />
          )}

          {vistaActiva === 'MODULO_2_ARTICULACION' && (
            <ModuloArticulacionView
              perfilActivo={perfilActivo}
              cuentos={cuentos}
              palabraInicial={ejercicioSeleccionado}
              modoDemo={modoDemo}
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

        {/* ===================================================================
            BARRA DE NAVEGACIÓN INFERIOR DE 4 PESTAÑAS IDÉNTICA A LOS WIREFRAMES 1 Y 2
            "🏠 Inicio | 📖 Cuentos | 📹 Práctica | 📈 Progreso"
           =================================================================== */}
        <nav
          className="bottom-nav-aaa"
          aria-label="Navegación principal de Señas y Sonrisas"
        >
          <button
            type="button"
            className="bottom-nav-btn"
            aria-current={
              vistaActiva === 'INICIO_PERFIL' || vistaActiva === 'MENU_PRINCIPAL'
                ? 'page'
                : undefined
            }
            onClick={() => handleNavigate('MENU_PRINCIPAL', '/menu')}
          >
            <span style={{ fontSize: '1.25rem' }} aria-hidden="true">
              🏠
            </span>
            <span>{esNoLector ? '' : 'Inicio'}</span>
          </button>

          <button
            type="button"
            className="bottom-nav-btn"
            aria-current={vistaActiva === 'CATALOGO_CUENTOS' ? 'page' : undefined}
            onClick={() => handleNavigate('CATALOGO_CUENTOS', '/cuentos')}
          >
            <span style={{ fontSize: '1.25rem' }} aria-hidden="true">
              📖
            </span>
            <span>{esNoLector ? '' : 'Cuentos'}</span>
          </button>

          <button
            type="button"
            className="bottom-nav-btn"
            aria-current={
              vistaActiva === 'PRACTICA_V2' ||
              vistaActiva === 'MODULO_2_ARTICULACION'
                ? 'page'
                : undefined
            }
            onClick={() => handleNavigate('PRACTICA_V2', '/practica-v2')}
          >
            <span style={{ fontSize: '1.25rem' }} aria-hidden="true">
              📹
            </span>
            <span>{esNoLector ? '' : 'Práctica'}</span>
          </button>

          <button
            type="button"
            className="bottom-nav-btn"
            aria-current={vistaActiva === 'PANEL_TUTOR' ? 'page' : undefined}
            onClick={() => handleNavigate('PANEL_TUTOR', '/tutor')}
          >
            <span style={{ fontSize: '1.25rem' }} aria-hidden="true">
              📈
            </span>
            <span>{esNoLector ? '' : 'Progreso'}</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default App;
