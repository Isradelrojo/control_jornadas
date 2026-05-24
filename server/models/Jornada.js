const mongoose = require('mongoose');

const JornadaSchema = new mongoose.Schema({
    fecha: { type: Date, default: Date.now },
    ingreso_uber: { type: Number, default: 0 },
    ingreso_cabify: { type: Number, default: 0 },
    gasto_combustible: { type: Number, required: true },
    gasto_extra: { type: Number, default: 0 },
    detalle_extra: { type: String, default: "" },
    total_dia: { type: Number }
}, { timestamps: true });

// Middleware profesional con async/await
JornadaSchema.pre('save', async function() {
    // Calculamos el total antes de que se guarde el documento
    const ingresos = Number(this.ingreso_uber || 0) + Number(this.ingreso_cabify || 0);
    const gastos = Number(this.gasto_combustible || 0) + Number(this.gasto_extra || 0);
    
    this.total_dia = ingresos - gastos;
});

module.exports = mongoose.model('Jornada', JornadaSchema);