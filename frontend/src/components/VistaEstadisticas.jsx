// src/components/VistaEstadisticas.jsx
import React from 'react';
import { BarChart3, Wallet, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const VistaEstadisticas = ({ jornadas }) => {

  // --- 1. FUNCIÓN: Agrupar por semanas (Para el Gráfico) ---
  const procesarDatosSemanales = () => {
    const semanas = {};
    const jornadasOrdenadas = [...jornadas].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    jornadasOrdenadas.forEach(j => {
      const fechaBase = new Date(j.fecha);
      const fechaJornada = new Date(Date.UTC(fechaBase.getUTCFullYear(), fechaBase.getUTCMonth(), fechaBase.getUTCDate()));
      
      const diaSemana = fechaJornada.getUTCDay();
      const diferenciaALunes = diaSemana === 0 ? -6 : 1 - diaSemana;
      
      const lunes = new Date(fechaJornada);
      lunes.setUTCDate(fechaJornada.getUTCDate() + diferenciaALunes);
      
      const domingo = new Date(lunes);
      domingo.setUTCDate(lunes.getUTCDate() + 6);

      const opciones = { day: '2-digit', month: '2-digit', timeZone: 'UTC' };
      const etiquetaSemana = `${lunes.toLocaleDateString('es-AR', opciones)} al ${domingo.toLocaleDateString('es-AR', opciones)}`;

      const netoDia = (Number(j.ingreso_uber) + Number(j.ingreso_cabify)) 
        - Number(j.gasto_combustible) - Number(j.gasto_extra);

      if (!semanas[etiquetaSemana]) semanas[etiquetaSemana] = 0;
      semanas[etiquetaSemana] += netoDia;
    });

    return Object.keys(semanas).map(semana => ({
      semana,
      totalNeto: semanas[semana]
    })).slice(-4); // Top de 4 semanas para el gráfico
  };

  // --- 2. FUNCIÓN: Agrupar por Mes Calendario Puro (Para la lista y el total) ---
  const procesarDatosMensuales = () => {
    const meses = {};
    // Ordenamos cronológicamente
    const jornadasOrdenadas = [...jornadas].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    jornadasOrdenadas.forEach(j => {
      const fechaBase = new Date(j.fecha);
      
      // Obtenemos el mes y año en formato UTC puro
      const anio = fechaBase.getUTCFullYear();
      const mesIndex = fechaBase.getUTCMonth(); // 0 = Enero, 1 = Febrero...

      // Creamos una etiqueta única para el objeto (ej: "2026-04" para ordenar fácil)
      const claveMes = `${anio}-${String(mesIndex + 1).padStart(2, '0')}`;

      // Nombre del mes legible para mostrar (ej: "Mayo 2026")
      const nombreMes = fechaBase.toLocaleDateString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
      // Ponemos la primera letra en mayúscula para que quede prolijo
      const etiquetaMes = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

      const netoDia = (Number(j.ingreso_uber) + Number(j.ingreso_cabify)) 
        - Number(j.gasto_combustible) - Number(j.gasto_extra);

      if (!meses[claveMes]) {
        meses[claveMes] = { label: etiquetaMes, totalNeto: 0 };
      }
      meses[claveMes].totalNeto += netoDia;
    });

    // Convertimos el objeto en un array ordenado por su clave año-mes
    return Object.keys(meses).map(clave => ({
      mes: meses[clave].label,
      totalNeto: meses[clave].totalNeto
    }));
  };

  const datosSemanales = procesarDatosSemanales();
  const datosMensuales = procesarDatosMensuales();

  // Sacamos el neto del último mes registrado para la tarjeta principal (o 0 si no hay datos)
  const totalMensualActual = datosMensuales.length > 0 ? datosMensuales[datosMensuales.length - 1].totalNeto : 0;
  const nombreMesActual = datosMensuales.length > 0 ? datosMensuales[datosMensuales.length - 1].mes : "Mes Actual";

  return (
    <div className="card">
      <h2 className="title"><BarChart3 size={20} /> Rendimiento Semanal</h2>
      <p className="est-subtitulo">Tendencia de las últimas 4 semanas de trabajo</p>

      {/* Gráfico Semanal */}
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

      {/* Lista Desglose Mensual */}
      <h3 className="title">
        <Calendar size={16} /> Desglose de Caja Mensual
      </h3>
      <p className="est-subtitulo">Ganancia neta acumulada por mes calendario</p>
      
      <div className="est-lista-desglose">
        {/* Mostramos los meses al revés (el mes más nuevo arriba de todo) */}
        {[...datosMensuales].reverse().map((item, idx) => (
          <div 
            key={idx} 
            className={`est-item-semana ${item.totalNeto >= 0 ? 'positivo' : 'negativo'}`}
          >
            <span className="est-texto-semana">{item.mes}</span>
            <strong className={item.totalNeto >= 0 ? 'est-monto-positivo' : 'est-monto-negativo'}>
              {item.totalNeto >= 0 ? `+$${item.totalNeto}` : `-$${Math.abs(item.totalNeto)}`}
            </strong>
          </div>
        ))}
      </div>

      {/* Tarjeta de Total del Mes en Curso */}
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