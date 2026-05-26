// src/components/VistaHistorial.jsx
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const VistaHistorial = ({ jornadas, manejarEditar, manejarEliminar }) => {
  return (
    <div className="card">
      <h2 className="title"><BarChart3 size={20} /> Rendimiento Semanal</h2>

      {/* Gráfico */}
      <div className="historial-grafico-contenedor">
        <ResponsiveContainer>
          <BarChart data={jornadas.slice(-7)}>
            <XAxis dataKey="fechaCorta" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: 'transparent' }} />
            <Bar dataKey="total_dia" radius={[4, 4, 0, 0]}>
              {jornadas.slice(-7).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.total_dia > 0 ? '#27ae60' : '#e74c3c'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Lista del historial */}
      <h2 className="title">Historial Reciente</h2>
      <div className="historial-lista">
        {jornadas.slice().reverse().map(j => (
          <div key={j._id} className="historial-item">
            <div className="historial-header">
              {/* 🛠️ CORREGIDO: Forzamos timeZone UTC para evitar el desfase en la lista */}
              <strong>
                {new Date(j.fecha).toLocaleDateString('es-AR', { timeZone: 'UTC' })}
              </strong>

              <div className="historial-acciones">
                <span className="badge">${j.total_dia}</span>

                {/* BOTÓN EDITAR */}
                <button 
                  onClick={() => manejarEditar(j)} 
                  className="btn-accion btn-editar" 
                  title="Editar"
                >
                  ✏️
                </button>

                {/* BOTÓN ELIMINAR */}
                <button 
                  onClick={() => manejarEliminar(j._id)} 
                  className="btn-accion btn-eliminar" 
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>

            <p className="historial-detalle">
              🚕 U: ${j.ingreso_uber} | C: ${j.ingreso_cabify} <br />
              ⛽ Nafta: ${j.gasto_combustible} | 🛠️ Extra: ${j.gasto_extra}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VistaHistorial;