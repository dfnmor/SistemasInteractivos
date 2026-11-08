import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PerfilNino, Cuento, VistaActiva } from '../types/meexuu';

interface PracticaSenaV1ViewProps {
  perfilActivo: PerfilNino;
  cuentos: Cuento[];
  senaInicial?: { palabra: string; idEjercicio: number; idCuento?: number };
  onRegistrarIntento: (
    idEjercicio: number,
    precision: number
  ) => Promise<{
    titulo: string;
    mensaje: string;
    icono: string;
  }>;
  onNavigate: (vista: VistaActiva, path?: string) => void;
}

export const PracticaSenaV1View: React.FC<PracticaSenaV1ViewProps> = ({
  perfilActivo,
  cuentos,
  senaInicial,
  onRegistrarIntento,
  onNavigate,
}) => {
  // Extraer dinámicamente todos los ejercicios de LSM desde los cuentos de PostgreSQL
  const ejerciciosLSM = useMemo(() => {
    const lista: Array<{
      id_ejercicio: number;
      id_cuento: number;
      palabra_o_sena: string;
      titulo_cuento: string;
      imagen_portada: string;
    }> = [];
    cuentos
      .filter((c) => c.tipo === 'LSM')
      .forEach((c) => {
        (c.ejercicios || []).forEach((ej) => {
          lista.push({
            id_ejercicio: ej.id_ejercicio,
            id_cuento: c.id_cuento,
            palabra_o_sena: ej.palabra_o_sena,
            titulo_cuento: c.titulo,
            imagen_portada: c.imagen_portada || '🤟🏽',
          });
        });
      });
    return lista;
  }, [cuentos]);

  const ejercicioDefault =
    ejerciciosLSM.find((e) => e.id_ejercicio === senaInicial?.idEjercicio) ||
    ejerciciosLSM[0] || {
      id_ejercicio: 1,
      id_cuento: 1,
      palabra_o_sena: 'HOLA',
      titulo_cuento: 'El Conejito y la Luna',
      imagen_portada: '🐰🌙',
    };

  const [idEjercicioSeleccionado, setIdEjercicioSeleccionado] = useState<number>(
    ejercicioDefault.id_ejercicio
  );

  useEffect(() => {
    if (senaInicial?.idEjercicio) {
      setIdEjercicioSeleccionado(senaInicial.idEjercicio);
    }
  }, [senaInicial]);

  const ejercicioActual =
    ejerciciosLSM.find((e) => e.id_ejercicio === idEjercicioSeleccionado) ||
    ejercicioDefault;

  const [camaraActiva, setCamaraActiva] = useState(false);
  const [errorCamara, setErrorCamara] = useState<string | null>(null);
  const [analizando, setAnalizando] = useState(false);
  const [ultimoResultado, setUltimoResultado] = useState<{
    precision: number;
    correcto: boolean;
    titulo: string;
    mensaje: string;
    icono: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // En v1 (antes de DIX09): La cámara se activa directamente sin cuenta regresiva 3-2-1
  const toggleCamaraDirecta = async () => {
    if (camaraActiva) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCamaraActiva(false);
      return;
    }

    setErrorCamara(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      setCamaraActiva(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 80);
    } catch {
      setErrorCamara(
        'No se detectó cámara física o permiso en el navegador. Puedes usar los botones de prueba para registrar intentos en PostgreSQL.'
      );
      setCamaraActiva(false);
    }
  };

  const procesarIntento = async (precision: number) => {
    setAnalizando(true);
    try {
      const retro = await onRegistrarIntento(
        ejercicioActual.id_ejercicio,
        precision
      );
      setUltimoResultado({
        precision,
        correcto: precision >= 75,
        titulo: retro.titulo,
        mensaje: retro.mensaje,
        icono: retro.icono,
      });
    } finally {
      setAnalizando(false);
    }
  };

  const handleSimularAleatorio = () => {
    const esAcierto = Math.random() >= 0.4;
    const precision = esAcierto
      ? Math.floor(80 + Math.random() * 19)
      : Math.floor(45 + Math.random() * 25);
    procesarIntento(precision);
  };

  return (
    <section aria-labelledby="titulo-practica-v1">
      {/* Cabecera de Versión V1 (Original, Antes de DIX09) */}
      <div
        className="card-aaa"
        style={{
          marginBottom: '20px',
          border: '3px solid var(--border-strong)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <span className="badge-aaa badge-lsm">
              Ruta: /practica-v1 • Versión 1 (Original, antes de mejoras DIX09)
            </span>
            <h1 id="titulo-practica-v1" style={{ margin: '6px 0 0 0', fontSize: '1.75rem' }}>
              Módulo 1 (v1): Práctica de Seña — {ejercicioActual.palabra_o_sena}
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
              Cuento: <strong>{ejercicioActual.titulo_cuento}</strong> • Perfil:{' '}
              <strong>{perfilActivo.nombre_apodo}</strong> (⭐{' '}
              {perfilActivo.puntos_acumulados} pts)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary-aaa"
              onClick={() => onNavigate('CATALOGO_CUENTOS', '/cuentos')}
            >
              ← Volver a Cuentos
            </button>
            <button
              type="button"
              className="btn-primary-aaa"
              onClick={() => onNavigate('PRACTICA_V2', '/practica-v2')}
            >
              ✨ Ver Versión Mejorada DIX09 (/practica-v2)
            </button>
          </div>
        </div>

        {/* Selector de Ejercicio conectado a TABLA_EJERCICIO_CUENTO */}
        <div style={{ marginTop: '14px' }}>
          <label
            htmlFor="select-ejercicio-v1"
            style={{ fontWeight: 700, marginRight: '10px' }}
          >
            Ejercicio de Base de Datos (`TABLA_EJERCICIO_CUENTO`):
          </label>
          <select
            id="select-ejercicio-v1"
            className="form-input-aaa"
            value={ejercicioActual.id_ejercicio}
            onChange={(e) => setIdEjercicioSeleccionado(Number(e.target.value))}
          >
            {ejerciciosLSM.map((ej) => (
              <option key={ej.id_ejercicio} value={ej.id_ejercicio}>
                #{ej.id_ejercicio} — {ej.palabra_o_sena} ({ej.titulo_cuento})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dos Columnas V1: Referencia Básica y Cámara con Contorno Estático */}
      <div className="grid-2-cols" style={{ marginBottom: '22px' }}>
        {/* Columna Izquierda: Referencia Estática V1 */}
        <div className="card-aaa">
          <h2 style={{ marginTop: 0 }}>Referencia de Seña (v1)</h2>
          <div
            style={{
              backgroundColor: 'var(--bg-card-highlight)',
              border: '2px solid var(--border-strong)',
              borderRadius: '16px',
              padding: '32px 20px',
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '4.5rem' }} aria-hidden="true">
              {ejercicioActual.imagen_portada} 🤟🏽
            </div>
            <h3 style={{ fontSize: '1.8rem', margin: '10px 0 4px 0' }}>
              {ejercicioActual.palabra_o_sena}
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Realiza la seña frente a la cámara dentro del contorno guía.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Cámara getUserMedia con Contorno Guía Superpuesto (Estático en v1) */}
        <div className="card-aaa">
          <h2 style={{ marginTop: 0 }}>Cámara en Vivo (`getUserMedia` - v1)</h2>

          <div
            className="ar-camera-stage"
            style={{ position: 'relative', minHeight: '340px' }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="ar-video-element"
              style={{
                display: camaraActiva ? 'block' : 'none',
                width: '100%',
                height: '320px',
              }}
            />

            {/* Contorno guía superpuesto sobre el video (Estático en v1) */}
            <div
              style={{
                position: 'absolute',
                inset: '24px',
                border: '3px dashed #94A3B8',
                borderRadius: '18px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                backgroundColor: camaraActiva
                  ? 'rgba(15, 23, 42, 0.18)'
                  : 'rgba(15, 23, 42, 0.75)',
                padding: '16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '3.5rem', opacity: 0.85 }} aria-hidden="true">
                🖐️
              </div>
              <div style={{ fontWeight: 700, color: '#F8FAFC', marginTop: '6px' }}>
                Contorno Guía Estático (v1): Coloca tu mano y rostro aquí
              </div>
            </div>
          </div>

          {errorCamara && (
            <p
              style={{
                marginTop: '10px',
                color: 'var(--warn-text)',
                backgroundColor: 'var(--warn-bg)',
                padding: '10px',
                borderRadius: '10px',
                fontWeight: 600,
              }}
            >
              ⚠️ {errorCamara}
            </p>
          )}

          {/* Controles de Cámara y Botones de Prueba Conectados a TABLA_METRICA_INTENTO */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginTop: '14px',
            }}
          >
            <button
              type="button"
              className="btn-primary-aaa"
              onClick={toggleCamaraDirecta}
            >
              {camaraActiva ? '⏹ Apagar Cámara' : '📷 Activar Cámara (Directo v1)'}
            </button>

            <button
              type="button"
              className="btn-secondary-aaa"
              disabled={analizando}
              onClick={handleSimularAleatorio}
            >
              🎲 Reconocer (Aleatorio)
            </button>

            <button
              type="button"
              className="btn-success-aaa"
              disabled={analizando}
              onClick={() => procesarIntento(92)}
            >
              ✅ Simular acierto (92%)
            </button>

            <button
              type="button"
              className="btn-secondary-aaa"
              disabled={analizando}
              onClick={() => procesarIntento(52)}
            >
              ❌ Simular fallo (52%)
            </button>
          </div>
        </div>
      </div>

      {/* Resultado básico V1 */}
      {ultimoResultado && (
        <div
          className="card-aaa"
          style={{
            backgroundColor: ultimoResultado.correcto
              ? 'var(--success-bg)'
              : 'var(--warn-bg)',
            borderColor: ultimoResultado.correcto
              ? 'var(--success-border)'
              : 'var(--warn-border)',
            color: ultimoResultado.correcto
              ? 'var(--success-text)'
              : 'var(--warn-text)',
            borderWidth: '3px',
          }}
          role="status"
        >
          <strong>
            {ultimoResultado.icono} {ultimoResultado.titulo} ({ultimoResultado.precision}%)
          </strong>
          <p style={{ margin: '6px 0 0 0' }}>
            {ultimoResultado.mensaje} — Guardado en `TABLA_METRICA_INTENTO`.
          </p>
        </div>
      )}
    </section>
  );
};

