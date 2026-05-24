require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db.js');

const app = express();

// Conectar a la base de datos
conectarDB();

// Middlewares
// app.use(cors());
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Para que el servidor entienda JSON

app.use('/api/jornadas', require('./routes/jornadas'));

// Rutas (las crearemos en el siguiente paso)
// app.use('/api/jornadas', require('./routes/jornadas'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));