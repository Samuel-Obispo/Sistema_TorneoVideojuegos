const express = require('express');
const router = express.Router();
const db = require('../db');


// Este archivo es para mostrar el ranking de los jugadores de mayor a menor

router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                j.gamertag AS jugador,
                v.nombre AS videojuego,
                p.puntuacion
            FROM puntuaciones p
            JOIN jugadores j ON p.id_jugador = j.id_jugador
            JOIN videojuegos v ON p.id_videojuego = v.id_videojuego
            ORDER BY p.puntuacion DESC;
        `;
        
        const [rows] = await pool.query(query);

        const ranking = rows.map((row, index) => ({
            posicion: index + 1,
            jugador: row.jugador,
            videojuego: row.videojuego,
            puntuacion: row.puntuacion
        }));

        res.json(ranking);
    } catch (error) {
        console.error('Error al obtener el ranking:', error);
        res.status(500).json({ error: 'Error interno al consultar el ranking' });
    }
});

module.exports = router;