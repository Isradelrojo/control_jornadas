import { useState, useEffect } from 'react';
import api from './api';
import { PlusCircle, History, BarChart3 } from 'lucide-react';
import './App.css';
import { VistaHistorial, VistaCarga, VistaEstadisticas } from "./components";

function App() {

  const [vista, setVista] = useState('carga');
  const [jornadas, setJornadas] = useState([]);

  // Formateamos el día de hoy de forma local estricta
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const hoyFormateado = `${anio}-${mes}-${dia}`;

  const [formData, setFormData] = useState({
    fechaElegida: hoyFormateado,
    ingreso_uber: 0,
    ingreso_cabify: 0,
    gasto_combustible: 0,
    gasto_extra: 0,
    detalle_extra: ''
  });

  // --- LÓGICA DE INPUTS INTELIGENTES ---
  const handleFocus = (e) => {
    if (e.target.value === '0') {
      setFormData({ ...formData, [e.target.name]: '' });
    }
  };

  const handleBlur = (e) => {
    if (e.target.value === '') {
      setFormData({ ...formData, [e.target.name]: 0 });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.name ? e : e.target;

    if (name === 'fechaElegida' || name === 'detalle_extra') {
      setFormData({ ...formData, [name]: value });
      return;
    }

    if (isNaN(value)) return;
    setFormData({ ...formData, [name]: value });
  };

  const totalEnVivo = (Number(formData.ingreso_uber) + Number(formData.ingreso_cabify))
    - Number(formData.gasto_combustible) - Number(formData.gasto_extra);

  // 🛠️ CORREGIDO: Evita el descalce de 3 horas al editar
  const manejarEditar = (jornada) => {
    const fechaObj = new Date(jornada.fecha);
    const anioE = fechaObj.getUTCFullYear();
    const mesE = String(fechaObj.getUTCMonth() + 1).padStart(2, '0');
    const diaE = String(fechaObj.getUTCDate()).padStart(2, '0');
    const fechaFormateada = `${anioE}-${mesE}-${diaE}`;

    setFormData({
      _id: jornada._id, // Aseguramos pasar el ID para que el backend sepa que es edición
      fechaElegida: fechaFormateada,
      ingreso_uber: jornada.ingreso_uber,
      ingreso_cabify: jornada.ingreso_cabify,
      gasto_combustible: jornada.gasto_combustible,
      gasto_extra: jornada.gasto_extra,
      detalle_extra: jornada.detalle_extra || ''
    });

    setVista('carga');
  };

  const manejarEliminar = async (id) => {
    if (!confirm("⚠️ ¿Estás seguro?")) return;
    try {
      await api.delete(`/jornadas/${id}`);
      alert("🗑️ Jornada eliminada");
      cargarHistorial();
    } catch (err) {
      alert("❌ Error al eliminar la jornada");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ingresosTotales = Number(formData.ingreso_uber) + Number(formData.ingreso_cabify);
    if (ingresosTotales === 0) {
      alert("⚠️ No podés guardar una jornada vacía.");
      return;
    }

    if (totalEnVivo < 0 && !confirm("¿La jornada dio pérdida? ¿Deseas guardar igual?")) return;

    try {
      const datosEnviar = {
        ...formData,
        esEdicion: formData._id ? true : false
      };

      await api.post('/jornadas', datosEnviar);
      alert('✅ Datos guardados correctamente');

      setFormData({
        fechaElegida: hoyFormateado,
        ingreso_uber: 0,
        ingreso_cabify: 0,
        gasto_combustible: 0,
        gasto_extra: 0,
        detalle_extra: ''
      });

      cargarHistorial();
      setVista('historial');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        alert(`❌ ${err.response.data.mensaje || 'Este día ya fue cargado anteriormente.'}`);
        setFormData({
          ...formData,
          ingreso_uber: 0,
          ingreso_cabify: 0,
          gasto_combustible: 0,
          gasto_extra: 0,
          detalle_extra: ''
        });
      } else {
        alert('❌ Error en el servidor');
      }
    }
  };

  // 🛠️ CORREGIDO: Forzamos zona horaria UTC para que los gráficos muestren el día correcto
  const cargarHistorial = async () => {
    try {
      const res = await api.get('/jornadas');
      const datosFormateados = res.data.map(j => ({
        ...j,
        fechaCorta: new Date(j.fecha).toLocaleDateString('es-AR', {
          timeZone: 'UTC',
          weekday: 'short',
          day: 'numeric'
        })
      })).reverse();
      setJornadas(datosFormateados);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { cargarHistorial(); }, []);

  return (
    <div className="container">
      <nav className="nav">
        <button onClick={() => setVista('carga')} className={`btn-nav ${vista === 'carga' ? 'active' : ''}`}>
          <PlusCircle size={18} /> Cargar
        </button>
        <button onClick={() => setVista('historial')} className={`btn-nav ${vista === 'historial' ? 'active' : ''}`}>
          <History size={18} /> Historial
        </button>
        {/* 🛠️ CORREGIDO: quitamos comillas en size="{18}" */}
        <button onClick={() => setVista('estadisticas')} className={`btn-nav ${vista === 'estadisticas' ? 'active' : ''}`}>
          <BarChart3 size={18} /> Semanal/Mensual
        </button>
      </nav>

      {vista === 'carga' && (
        <VistaCarga
          formData={formData}
          handleChange={handleChange}
          handleFocus={handleFocus}
          handleBlur={handleBlur}
          handleSubmit={handleSubmit}
          totalEnVivo={totalEnVivo}
        />
      )}

      {vista === 'historial' && (
        <VistaHistorial
          jornadas={jornadas}
          manejarEditar={manejarEditar}
          manejarEliminar={manejarEliminar}
        />
      )}

      {vista === 'estadisticas' && (
        <VistaEstadisticas jornadas={jornadas} />
      )}

    </div>
  );
}

export default App;