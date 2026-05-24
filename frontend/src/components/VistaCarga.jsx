// src/components/VistaCarga.jsx
import React from 'react';
import { Fuel } from 'lucide-react';

const VistaCarga = ({ 
  formData, 
  handleChange, 
  handleFocus, 
  handleBlur, 
  handleSubmit, 
  totalEnVivo 
}) => {
  return (
    <div className="card">
      <h2 className="title">Nueva Carga</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="group group-fecha">
          <label>📅 Fecha de la Jornada</label>
          <input
            name="fechaElegida"
            type="date"
            value={formData.fechaElegida}
            onChange={handleChange}
          />
        </div>
        <div className="row">
          <div className="group">
            <label>Uber ($)</label>
            <input name="ingreso_uber" type="text" inputMode="numeric"
              value={formData.ingreso_uber} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
          </div>
          <div className="group">
            <label>Cabify ($)</label>
            <input name="ingreso_cabify" type="text" inputMode="numeric"
              value={formData.ingreso_cabify} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
          </div>
        </div>

        <div className="group">
          <label><Fuel size={16} /> Combustible</label>
          <input name="gasto_combustible" type="text" inputMode="numeric"
            value={formData.gasto_combustible} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
        </div>

        <div className="row">
          <div className="group">
            <label>Gasto Extra</label>
            <input name="gasto_extra" type="text" inputMode="numeric"
              value={formData.gasto_extra} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
          </div>
          <div className="group">
            <label>Detalle</label>
            <input name="detalle_extra" type="text" placeholder="Ej: Lavado"
              value={formData.detalle_extra} onChange={handleChange} />
          </div>
        </div>

        <div className="total-box">
          <span>Ganancia Neta:</span>
          <strong className={totalEnVivo >= 0 ? 'neto-positivo' : 'neto-negativo'}>
            ${totalEnVivo}
          </strong>
        </div>

        <button type="submit" className="btn-submit">Guardar Jornada</button>
      </form>
    </div>
  );
};

export default VistaCarga;