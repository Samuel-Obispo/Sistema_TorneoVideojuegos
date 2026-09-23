const express = require('express');
const router = express.Router();
const pool = require('../db');

// Este bloque de codigo es para tener estadisticas, utilizando la informacion en MySQL

router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM jugadores) AS total_jugadores,
                (SELECT COUNT(*) FROM videojuegos) AS total_videojuegos,
                (SELECT COUNT(*) FROM puntuaciones) AS total_puntuaciones,
                IFNULL((SELECT ROUND(AVG(puntuacion), 2) FROM puntuaciones), 0) AS puntuacion_promedio;
        `;

        const [rows] = await pool.query(query);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error interno al obtener estadísticas' });
    }
});

module.exports = router;