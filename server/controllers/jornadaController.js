// const Jornada = require('../models/Jornada');

// // Crear una nueva jornada
// exports.crearJornada = async (req, res) => {
//     try {
//         const nuevaJornada = new Jornada(req.body);
//         await nuevaJornada.save();
//         res.status(201).json({ mensaje: "Jornada guardada con éxito", data: nuevaJornada });
//     } catch (error) {
//         res.status(400).json({ mensaje: "Error al guardar la jornada", error: error.message });
//     }
// };





const Jornada = require('../models/Jornada');

exports.crearOModificarJornada = async (req, res) => {
    try {
        // Recibimos 'esEdicion' desde el frontend para saber si el usuario clickeó "Editar" explícitamente
        const { fechaElegida, ingreso_uber, ingreso_cabify, gasto_combustible, gasto_extra, detalle_extra, esEdicion } = req.body;

        // 1. Desarmamos el string "YYYY-MM-DD" que viene del calendario
        const stringFecha = fechaElegida || new Date().toLocaleDateString('sv-SE');
        const [anio, mes, dia] = stringFecha.split('-');

        // 2. Forzamos a crear la fecha usando valores locales
        const inicioDia = new Date(Number(anio), Number(mes) - 1, Number(dia), 0, 0, 0, 0);
        const finDia    = new Date(Number(anio), Number(mes) - 1, Number(dia), 23, 59, 59, 999);

        // 3. Buscamos si ya existe en ese rango
        let jornadaExistente = await Jornada.findOne({
            fecha: { $gte: inicioDia, $lte: finDia }
        });

        if (jornadaExistente) {
            // 🌟 CANDADO CRÍTICO: Si el día existe pero NO viene del botón de editar, rebotamos la petición
            if (!esEdicion) {
                return res.status(400).json({ 
                    mensaje: "Ese día ya tiene una jornada registrada. Si querés modificarla, hacelo desde el Historial Diario." 
                });
            }

            // Si 'esEdicion' es true, significa que viene del flujo correcto. Actualizamos de forma segura.
            jornadaExistente.ingreso_uber = Number(ingreso_uber || 0);
            jornadaExistente.ingreso_cabify = Number(ingreso_cabify || 0);
            jornadaExistente.gasto_combustible = Number(gasto_combustible || 0);
            jornadaExistente.gasto_extra = Number(gasto_extra || 0);
            jornadaExistente.detalle_extra = detalle_extra;

            await jornadaExistente.save();
            return res.status(200).json({ mensaje: "Jornada actualizada con éxito", data: jornadaExistente });
            
        } else {
            // Creamos una nueva jornada de forma normal
            const nuevaJornada = new Jornada({
                fecha: inicioDia, 
                ingreso_uber: Number(ingreso_uber || 0),
                ingreso_cabify: Number(ingreso_cabify || 0),
                gasto_combustible: Number(gasto_combustible || 0),
                gasto_extra: Number(gasto_extra || 0),
                detalle_extra
            });

            await nuevaJornada.save();
            return res.status(201).json({ mensaje: "Jornada creada con éxito", data: nuevaJornada });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todas las jornadas (para el historial)
exports.obtenerJornadas = async (req, res) => {
    try {
        const jornadas = await Jornada.find().sort({ fecha: -1 }); // De la más reciente a la más vieja
        res.status(200).json(jornadas);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener los datos", error: error.message });
    }
};

// Eliminar una jornada por su ID
exports.eliminarJornada = async (req, res) => {
    try {
        const { id } = req.params;
        await Jornada.findByIdAndDelete(id);
        res.json({ mensaje: "Jornada eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};