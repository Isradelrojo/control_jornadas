// src/components/VistaEstadisticas.jsx
import React from 'react';
import { BarChart3, Wallet, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const VistaEstadisticas = ({ jornadas }) => {

  // --- FUNCIÓN: Agrupar jornadas por semanas (Lunes a Domingo) ---
  const procesarDatosSemanales = () => {
    const semanas = {};

    // Ordenamos las jornadas de la más vieja a la más nueva antes de procesar
    const jornadasOrdenadas = [...jornadas].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    jornadasOrdenadas.forEach(j => {
      // 🛠️ CORREGIDO: Leemos la fecha en formato UTC puro para evitar el salto de día
      const fechaBase = new Date(j.fecha);
      const anio = fechaBase.getUTCFullYear();
      const mes = fechaBase.getUTCMonth();
      const dia = fechaBase.getUTCDate();
      
      const fechaJornada = new Date(Date.UTC(anio, mes, dia));
      
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

    // Convertimos a array estructurado
    const resultado = Object.keys(semanas).map(semana => ({
      semana,
      totalNeto: semanas[semana]
    }));

    // 🛠️ CORREGIDO: Devolvemos las últimas 4 semanas ordenadas cronológicamente (Vieja a Nueva)
    return resultado.slice(-4);
  };

  const datosSemanales = procesarDatosSemanales();
  
  // El total mensual acumulado sumará solo el bloque de las últimas 4 semanas visibles
  const totalMensualAcumulado = datosSemanales.reduce((acc, curr) => acc + curr.totalNeto, 0);

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

      {/* Lista Detallada (La más nueva arriba para control rápido) */}
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

      {/* Tarjeta de Total Mensual (Cierre de div corregido) */}
      <div className="tarjeta-mensual">
        <div className="tarjeta-mensual-contenido">
          <Wallet size={24} color="#27ae60" />
          <div>
            <p className="tarjeta-mensual-titulo">Total Acumulado (4 Semanas)</p>
            <h3 className={`tarjeta-mensual-monto ${totalMensualAcumulado >= 0 ? 'positivo' : 'negativo'}`}>
              ${totalMensualAcumulado}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaEstadisticas;