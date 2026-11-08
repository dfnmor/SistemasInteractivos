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
import { ModuloLSMView } from './views/ModuloLSMView';
import { ModuloArticulacionView } from './views/ModuloArticulacionView';
import { PanelTutorView } from './views/PanelTutorView';

export const App: React.FC = () => {
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('CATALOGO_CUENTOS');
  const [perfiles, setPerfiles] = useState<PerfilNino[]>([]);
  const [perfilActivo, setPerfilActivo] = useState<PerfilNino>({
    id_perfil: 1,
    id_tutor: 1,
    nombre_apodo: 'Mateo (Niño A: Lector Inicial)',
    fecha_nacimiento: '2020-04-15',
    tipo_sordera: 'PARCIAL',
    nivel_lectura: 'LECTURA_INICIAL',
    puntos_acumulados: 120,
    nombre_tutor: 'Laura Gómez (Mamá de Mateo)',
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
  }>({ palabra: 'HOLA (Saludo)', idEjercicio: 1 });

  const [configAccesibilidad, setConfigAccesibilidad] =
    useState<ConfiguracionAccesibilidad>({
      tamanoTexto: 'NORMAL',
      contraste: 'AAA_ESTANDAR',
      velocidadAnimacion: 1.0,
      nivelDecibeles: 42,
      pausaSensorialActiva: false,
      modoPreExploracionSilenciosa: false,
    });

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

  // Sincronizar atributos de accesibilidad WCAG 2.2 AAA en el elemento raíz <html>
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
    setVistaActiva('CATALOGO_CUENTOS');
  };

  const handleCompletarCuento = async (idCuento: number) => {
    await guardarProgresoCuento(idCuento, perfilActivo.id_perfil, 30);
    await cargarDatosPerfil(perfilActivo.id_perfil);
  };

  const handleCanjearRecompensa = async (idRecompensa: number) => {
    const res = await canjearRecompensaApi(perfilActivo.id_perfil, idRecompensa);
    if (res.ok) {
      await cargarDatosPerfil(perfilActivo.id_perfil);
    }
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
    idEjercicio: number
  ) => {
    setEjercicioSeleccionado({ palabra, idEjercicio });
    if (tipo === 'LSM') {
      setVistaActiva('MODULO_1_LSM');
    } else {
      setVistaActiva('MODULO_2_ARTICULACION');
    }
  };

  // Semáforo Cromático-Lumínico de Decibeles (Fase 2, Actividad 1.2)
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
      {/* =====================================================================
          HEADER PERSISTENTE DUA & WCAG 2.2 AAA (MOCKUP ACT. 6)
         ===================================================================== */}
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
          {/* Contador de Estrellas / Puntos Acumulados */}
          <div
            className="star-counter-badge"
            aria-label={`Puntos acumulados: ${perfilActivo.puntos_acumulados} estrellas`}
          >
            <span>⭐</span>
            <span>{perfilActivo.puntos_acumulados}</span>
          </div>

          {/* Traducción Cromático-Lumínica del Sonido */}
          <div
            className={`decibel-pill ${dbClase}`}
            title="Traducción Cromático-Lumínica del Sonido (Fase 2, Act. 1.2)"
          >
            {dbEtiqueta}
          </div>

          {/* Botón Persistente de Calma: 'Pausa Sensorial' (Fase 2, Act. 1.1) */}
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

          {/* Conmutador de Contraste WCAG 2.2 AAA (7:1 Estándar vs 14:1 Nocturno) */}
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
            title="Alternar modo de contraste WCAG 2.2 AAA (>= 7:1)"
          >
            {configAccesibilidad.contraste === 'AAA_ESTANDAR'
              ? '🌗 Contraste AAA Nocturno'
              : '☀️ Contraste AAA Diurno'}
          </button>
        </div>
      </header>

      {/* Banner activo cuando el niño presiona el Botón Persistente de Calma ('Pausa Sensorial') */}
      {configAccesibilidad.pausaSensorialActiva && (
        <div className="sensory-pause-banner" role="alert">
          <div>
            <strong style={{ fontSize: '1.15rem' }}>
              🌿 Modo de Calma y Pausa Sensorial Activo (DUA Principio III)
            </strong>
            <p style={{ margin: '4px 0 0 0' }}>
              El sonido está silenciado al 100%, el brillo está suavizado y tu progreso en los
              cuentos está completamente guardado sin límite de tiempo.
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

      {/* =====================================================================
          CONTENIDO PRINCIPAL: LAS 5 VISTAS DEL SISTEMA
         ===================================================================== */}
      <main role="main" style={{ flex: 1 }}>
        {vistaActiva === 'INICIO_PERFIL' && (
          <InicioPerfilView
            perfiles={perfiles}
            perfilActivo={perfilActivo}
            configAccesibilidad={configAccesibilidad}
            onSelectPerfil={handleSelectPerfil}
            onCreatePerfil={handleCreatePerfil}
            onUpdateConfig={handleUpdateConfig}
            onIrAlMenu={() => setVistaActiva('CATALOGO_CUENTOS')}
          />
        )}

        {vistaActiva === 'CATALOGO_CUENTOS' && (
          <CatalogoCuentosView
            perfilActivo={perfilActivo}
            cuentos={cuentos}
            recompensas={recompensas}
            onNavigate={setVistaActiva}
            onCompletarCuento={handleCompletarCuento}
            onCanjearRecompensa={handleCanjearRecompensa}
            onPracticarEjercicio={handlePracticarEjercicio}
          />
        )}

        {vistaActiva === 'MODULO_1_LSM' && (
          <ModuloLSMView
            perfilActivo={perfilActivo}
            senaInicial={ejercicioSeleccionado}
            onRegistrarIntento={handleRegistrarIntento}
            onNavigate={setVistaActiva}
          />
        )}

        {vistaActiva === 'MODULO_2_ARTICULACION' && (
          <ModuloArticulacionView
            perfilActivo={perfilActivo}
            palabraInicial={ejercicioSeleccionado}
            onRegistrarIntento={handleRegistrarIntento}
            onNavigate={setVistaActiva}
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
            onNavigate={setVistaActiva}
          />
        )}
      </main>

      {/* Pie de Estado Técnico (Conexión API / PostgreSQL Docker) */}
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
          <strong>Clave del Sistema:</strong> TSI-2026-MEEXUU •{' '}
          <strong>Normativa:</strong> WCAG 2.2 AAA (≥7:1, ≥48×48 dp) + EN 301 549 + DUA
        </div>
        <div>
          <strong>Estado Backend/BD:</strong>{' '}
          {healthInfo.online
            ? healthInfo.dbConnected
              ? '🟢 Conectado a PostgreSQL (db_meexuu)'
              : '🟢 API Activa (Modo Resiliente RNF-06)'
            : '🟡 Modo Offline Escolar Activo (RNF-06)'}
        </div>
      </footer>

      {/* =====================================================================
          BARRA DE NAVEGACIÓN INFERIOR ACCESIBLE (MOCKUP ACT. 6: >= 48x48 dp)
         ===================================================================== */}
      <nav
        className="bottom-nav-aaa"
        aria-label="Navegación principal de Señas y Sonrisas"
      >
        <button
          type="button"
          className="bottom-nav-btn"
          aria-current={vistaActiva === 'INICIO_PERFIL' ? 'page' : undefined}
          onClick={() => setVistaActiva('INICIO_PERFIL')}
        >
          <span style={{ fontSize: '1.4rem' }} aria-hidden="true">
            🧒
          </span>
          <span>1. Perfiles</span>
        </button>

        <button
          type="button"
          className="bottom-nav-btn"
          aria-current={vistaActiva === 'CATALOGO_CUENTOS' ? 'page' : undefined}
          onClick={() => setVistaActiva('CATALOGO_CUENTOS')}
        >
          <span style={{ fontSize: '1.4rem' }} aria-hidden="true">
            📚
          </span>
          <span>2. Cuentos</span>
        </button>

        <button
          type="button"
          className="bottom-nav-btn"
          aria-current={vistaActiva === 'MODULO_1_LSM' ? 'page' : undefined}
          onClick={() => setVistaActiva('MODULO_1_LSM')}
        >
          <span style={{ fontSize: '1.4rem' }} aria-hidden="true">
            🤟
          </span>
          <span>3. Módulo LSM</span>
        </button>

        <button
          type="button"
          className="bottom-nav-btn"
          aria-current={
            vistaActiva === 'MODULO_2_ARTICULACION' ? 'page' : undefined
          }
          onClick={() => setVistaActiva('MODULO_2_ARTICULACION')}
        >
          <span style={{ fontSize: '1.4rem' }} aria-hidden="true">
            👄
          </span>
          <span>4. Articulación</span>
        </button>

        <button
          type="button"
          className="bottom-nav-btn"
          aria-current={vistaActiva === 'PANEL_TUTOR' ? 'page' : undefined}
          onClick={() => setVistaActiva('PANEL_TUTOR')}
        >
          <span style={{ fontSize: '1.4rem' }} aria-hidden="true">
            📊
          </span>
          <span>5. Panel Tutor</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
