const express = require('express');
const router = express.Router();
const jornadaController = require('../controllers/jornadaController');

// Ruta: /api/jornadas
router.post('/', jornadaController.crearOModificarJornada);
router.get('/', jornadaController.obtenerJornadas);
router.delete('/:id', jornadaController.eliminarJornada);



module.exports = router;