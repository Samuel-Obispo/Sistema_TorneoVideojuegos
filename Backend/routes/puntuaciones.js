const express = require('express');
const router = express.Router();
const db = require('../db');

// Este bloque de codigo registra las puntuaciones de los jugadores
router.post('/', async (req, res) => {
    const { id_jugador, id_videojuego, puntuacion } = req.body;

    if (!id_jugador || !id_videojuego || puntuacion === undefined || puntuacion === null) {
        return res.status(400).json({ error: 'Faltan campos que son obligatorios' });
    }

    if (Number(puntuacion) < 0) {
        return res.status(400).json({ error: 'La puntuación no puede ser negativa' });
    }

    try {
        const [jugadorExistente] = await db.query('SELECT * FROM jugadores WHERE id_jugador = ?', [id_jugador]);
        if (jugadorExistente.length === 0) {
            return res.status(404).json({ error: 'El jugador no existe' });
        }

        const [videojuegoExistente] = await db.query('SELECT * FROM videojuegos WHERE id_videojuego = ?', [id_videojuego]);
        if (videojuegoExistente.length === 0) {
            return res.status(404).json({ error: 'El videojuego no existe' });
        }

        const [resultado] = await db.query(
            'INSERT INTO puntuaciones (id_jugador, id_videojuego, puntuacion, fecha) VALUES (?, ?, ?, NOW())',
            [id_jugador, id_videojuego, puntuacion]
        );
        res.status(201).json({ message: 'Puntuación registrada exitosamente', id: resultado.insertId });
    } catch (error) {
        console.error('Error al registrar la puntuación:', error);
        res.status(500).json({ error: 'Error al registrar la puntuación', detalle: error.message });
    }


});


// Este bloque de codigo es para obtener las puntuaciones 

router.get('/', async (req, res) => {
    try {
        const query = `
        SELECT 
            p.id_puntuacion,
            n.nombre AS nombre_jugador,
            n.gamertag AS gamertag_jugador,
            v.nombre AS nombre_videojuego,
            p.puntuacion,
            p.fecha
        FROM puntuaciones p
        JOIN jugadores n ON p.id_jugador = n.id_jugador
        JOIN videojuegos v ON p.id_videojuego = v.id_videojuego
        ORDER BY p.puntuacion DESC
        `;

        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener las puntuaciones:', error);
        res.status(500).json({ error: 'Error al obtener las puntuaciones', detalle: error.message });
    }


});

module.exports = router;