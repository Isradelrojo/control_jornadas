// src/components/VistaEstadisticas.jsx
import React from 'react';
import { BarChart3, Wallet, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const VistaEstadisticas = ({ jornadas }) => {

  // --- 1. FUNCIÓN: Agrupar jornadas por semanas (Para el Gráfico y la Lista de semanas) ---
  const procesarDatosSemanales = () => {
    const semanas = {};
    const jornadasOrdenadas = [...jornadas].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    jornadasOrdenadas.forEach(j => {
      const fechaBase = new Date(j.fecha);
      const fechaJornada = new Date(Date.UTC(fechaBase.getUTCFullYear(), fechaBase.getUTCMonth(), fechaBase.getUTCDate()));
      
      const diaSemana = fechaJornada.getUTCDay(); // 0 = Domingo, 1 = Lunes
      const diferenciaALunes = diaSemana === 0 ? -6 : 1 - diaSemana;
      
      const lunes = new Date(fechaJornada);
      lunes.setUTCDate(fechaJornada.getUTCDate() + diferenciaALunes);
      
      const domingo = new Date(lunes);
      domingo.setUTCDate(lunes.getUTCDate() + 6);

      const opciones = { day: '2-digit', month: '2-digit', timeZone: 'UTC' };
      const etiquetaSemana = `${lunes.toLocaleDateString('es-AR', opciones)} al ${domingo.toLocaleDateString('es-AR', opciones)}`;

      const netoDia = (Number(j.ingreso_uber) + Number(j.ingreso_cabify)) 
        - Number(j.gasto_combustible) - Number(j.gasto_extra);

      if (!semanas[etiquetaSemana]) {
        semanas[etiquetaSemana] = 0;
      }
      semanas[etiquetaSemana] += netoDia;
    });

    return Object.keys(semanas).map(semana => ({
      semana,
      totalNeto: semanas[semana]
    })).slice(-4); // Mantenemos el máximo de 4 semanas
  };

  // --- 2. FUNCIÓN: Calcular el total del mes actual puro (Para la Tarjeta de abajo) ---
  const calcularTotalMensualPuro = () => {
    let totalMes = 0;
    let nombreMesLabel = "Mes Actual";

    if (jornadas.length === 0) return { totalMes, nombreMesLabel };

    // Buscamos cuál es el mes más reciente cargado en la base de datos
    const jornadasOrdenadas = [...jornadas].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const ultimaJornada = jornadasOrdenadas[jornadasOrdenadas.length - 1];
    const fechaUltima = new Date(ultimaJornada.fecha);
    
    const anioActual = fechaUltima.getUTCFullYear();
    const mesActualIndex = fechaUltima.getUTCMonth(); // 0 = Enero, 4 = Mayo, etc.

    // Formateamos el nombre para la etiqueta (ej: "Mayo 2026")
    const nombreMes = fechaUltima.toLocaleDateString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    nombreMesLabel = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

    // Sumamos SÓLO las jornadas que pertenezcan a ese mismo mes y año calendario
    jornadas.forEach(j => {
      const f = new Date(j.fecha);
      if (f.getUTCFullYear() === anioActual && f.getUTCMonth() === mesActualIndex) {
        const netoDia = (Number(j.ingreso_uber) + Number(j.ingreso_cabify)) 
          - Number(j.gasto_combustible) - Number(j.gasto_extra);
        totalMes += netoDia;
      }
    });

    return { totalMes, nombreMesLabel };
  };

  const datosSemanales = procesarDatosSemanales();
  const { totalMes: totalMensualActual, nombreMesLabel: nombreMesActual } = calcularTotalMensualPuro();

  return (
    <div className="card">
      <h2 className="title"><BarChart3 size={20} /> Rendimiento por Semanas</h2>
      <p className="est-subtitulo">Resultados netos agrupados de Lunes a Domingo</p>

      {/* Gráfico Semanal (Cronológico: de más vieja a más nueva) */}
      <div className="est-grafico-contenedor">
        <ResponsiveContainer>
          <BarChart data={datosSemanales}>
            <XAxis dataKey="semana" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{ fill: 'transparent' }} 
              formatter={(value) => [`$${value}`, 'Ganancia Neta']}
            />
            <Bar dataKey="totalNeto" radius={[4, 4, 0, 0]}>
              {datosSemanales.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.totalNeto >= 0 ? '#27ae60' : '#e74c3c'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Lista Detallada Semana a Semana (Como estaba antes, la más nueva arriba) */}
      <h3 className="title">
        <Calendar size={16} /> Desglose de Caja Semanal
      </h3>
      
      <div className="est-lista-desglose">
        {[...datosSemanales].reverse().map((item, idx) => (
          <div 
            key={idx} 
            className={`est-item-semana ${item.totalNeto >= 0 ? 'positivo' : 'negativo'}`}
          >
            <span className="est-texto-semana">Semana {item.semana}</span>
            <strong className={item.totalNeto >= 0 ? 'est-monto-positivo' : 'est-monto-negativo'}>
              {item.totalNeto >= 0 ? `+$${item.totalNeto}` : `-$${Math.abs(item.totalNeto)}`}
            </strong>
          </div>
        ))}
      </div>

      {/* Tarjeta de Total Mensual Inteligente (Suma mes calendario cerrado) */}
      <div className="tarjeta-mensual">
        <div className="tarjeta-mensual-contenido">
          <Wallet size={24} color="#27ae60" />
          <div>
            <p className="tarjeta-mensual-titulo">Total Neto ({nombreMesActual})</p>
            <h3 className={`tarjeta-mensual-monto ${totalMensualActual >= 0 ? 'positivo' : 'negativo'}`}>
              ${totalMensualActual}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaEstadisticas;