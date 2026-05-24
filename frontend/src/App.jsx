import { useState, useEffect } from 'react';
import api from './api';
import { Fuel, PlusCircle, History, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './App.css';
import { VistaHistorial, VistaCarga, VistaEstadisticas } from "./components";

function App() {

  const [vista, setVista] = useState('carga');
  const [jornadas, setJornadas] = useState([]);
  // Buscamos la fecha de hoy en formato YYYY-MM-DD para el input html
  const hoyFormateado = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    fechaElegida: hoyFormateado, // <-- Nueva variable
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
    const { name, value } = e.name ? e : e.target; // Captura segura del elemento

    // 1. Si es la fecha, la dejamos pasar directo sin validar números
    if (name === 'fechaElegida') {
      setFormData({ ...formData, [name]: value });
      return; // Corta acá para que no siga a las reglas de números
    }

    // 2. Si es el detalle extra (texto), también pasa directo
    if (name === 'detalle_extra') {
      setFormData({ ...formData, [name]: value });
      return;
    }

    // 3. Para todo lo demás (Uber, Cabify, Nafta, Extras), validamos que sea número
    if (isNaN(value)) return; // Si meten letras, no hace nada
    setFormData({ ...formData, [name]: value });
  };

  const totalEnVivo = (Number(formData.ingreso_uber) + Number(formData.ingreso_cabify))
    - Number(formData.gasto_combustible) - Number(formData.gasto_extra);

  const manejarEditar = (jornada) => {
    // Pasamos la fecha de la base de datos (ISO) al formato YYYY-MM-DD que entiende el calendario
    const fechaFormateada = new Date(jornada.fecha).toISOString().split('T')[0];



    setFormData({
      fechaElegida: fechaFormateada,
      ingreso_uber: jornada.ingreso_uber,
      ingreso_cabify: jornada.ingreso_cabify,
      gasto_combustible: jornada.gasto_combustible,
      gasto_extra: jornada.gasto_extra,
      detalle_extra: jornada.detalle_extra || ''
    });

    // Llevamos al usuario al formulario
    setVista('carga');
  };

  const manejarEliminar = async (id) => {
    console.log("El ID que llegó al botón es:", id); // <-- Meté esta línea de prueba
    if (!confirm("⚠️ ¿Estás seguro?")) return;

    try {
      await api.delete(`/jornadas/${id}`);
      alert("🗑️ Jornada eliminada");
      cargarHistorial(); // Refrescamos la lista al toque
    } catch (err) {
      alert("❌ Error al eliminar la jornada");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validamos que no se intente mandar una jornada vacía en $0
    const ingresosTotales = Number(formData.ingreso_uber) + Number(formData.ingreso_cabify);
    if (ingresosTotales === 0) {
      alert("⚠️ No podés guardar una jornada vacía. Si no trabajaste este día, simplemente saltealo.");
      return;
    }

    // 2. Alerta por pérdida
    if (totalEnVivo < 0 && !confirm("¿La jornada dio pérdida? ¿Deseas guardar igual?")) return;

    try {
      // Mandamos de forma dinámica si es edición o no basándonos en si existe el _id
      const datosEnviar = { 
        ...formData, 
        esEdicion: formData._id ? true : false 
      };

      await api.post('/jornadas', datosEnviar);
      alert('✅ Datos guardados correctamente');
      
      // Limpieza estándar si todo sale bien
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
      // 3. Capturamos si el backend nos frena porque quisimos pisar un día existente
      if (err.response && err.response.status === 400) {
        alert(`❌ ${err.response.data.mensaje || 'Este día ya fue cargado anteriormente.'}`);
        
        // 🌟 ACÁ ESTÁ EL CAMBIO: Si da error por día repetido, limpiamos los números en vivo
        setFormData({
          ...formData, // Mantenemos la fecha elegida para que no se te mueva el calendario de donde estabas
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
    
  //   // 1. Validamos que no se intente mandar una jornada vacía en $0
  //   const ingresosTotales = Number(formData.ingreso_uber) + Number(formData.ingreso_cabify);
  //   if (ingresosTotales === 0) {
  //     alert("⚠️ No podés guardar una jornada vacía. Si no trabajaste este día, simplemente saltealo.");
  //     return;
  //   }

  //   // 2. Alerta por pérdida
  //   if (totalEnVivo < 0 && !confirm("¿La jornada dio pérdida? ¿Deseas guardar igual?")) return;

  //   try {
  //     // 🌟 ACÁ ESTÁ EL TRUCO MAGICO:
  //     // Si formData tiene un _id, significa que viene del historial (esEdicion: true).
  //     // Si NO tiene _id, es una carga limpia desde cero (esEdicion: false).
  //     const datosEnviar = { 
  //       ...formData, 
  //       esEdicion: formData._id ? true : false 
  //     };

  //     // Le mandamos 'datosEnviar' al servidor en vez de 'formData' a secas
  //     await api.post('/jornadas', datosEnviar);
  //     alert('✅ Datos guardados correctamente');
      
  //     setFormData({ 
  //       fechaElegida: hoyFormateado, 
  //       ingreso_uber: 0, 
  //       ingreso_cabify: 0, 
  //       gasto_combustible: 0, 
  //       gasto_extra: 0, 
  //       detalle_extra: '' 
  //     });
      
  //     cargarHistorial();
  //     setVista('historial');
  //   } catch (err) { 
  //     // 3. Capturamos si el backend nos frena porque quisimos pisar un día sin estar en modo edición
  //     if (err.response && err.response.status === 400) {
  //       alert(`❌ ${err.response.data.mensaje || 'Este día ya fue cargado anteriormente.'}`);
  //     } else {
  //       alert('❌ Error en el servidor'); 
  //     }
  //   }
  // };

  const cargarHistorial = async () => {
    try {
      const res = await api.get('/jornadas');
      // Formatear fechas para el gráfico (ej: "Lun 12")
      const datosFormateados = res.data.map(j => ({
        ...j,
        fechaCorta: new Date(j.fecha).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' })
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
        <button onClick={() => setVista('estadisticas')} className={`btn-nav ${vista === 'estadisticas' ? 'active' : ''}`}>
          <BarChart3 size="{18}" /> Semanal/Mensual
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