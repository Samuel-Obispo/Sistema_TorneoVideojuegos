const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// Esta parte de obtiene todas las puntuaciones por GET

router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id_puntuacion,
                p.id_jugador,
                p.id_videojuego,
                j.nombre AS nombre_jugador,
                j.gamertag AS gamertag_jugador,
                v.nombre AS nombre_videojuego,
                p.puntuacion,
                p.fecha
            FROM puntuaciones p
            JOIN jugadores j ON p.id_jugador = j.id_jugador
            JOIN videojuegos v ON p.id_videojuego = v.id_videojuego
            ORDER BY p.fecha DESC;
        `;

        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener las puntuaciones:', error);
        res.status(500).json({ error: 'Error interno al obtener las puntuaciones' });
    }
});

// Esta parte se registran las puntuaciones por POST

router.post('/', authMiddleware, async (req, res) => {
    const { id_jugador, id_videojuego, puntuacion } = req.body;

    if (!id_jugador || !id_videojuego || puntuacion === undefined || puntuacion === null) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const valorPuntuacion = Number(puntuacion);
    if (isNaN(valorPuntuacion) || valorPuntuacion < 0) {
        return res.status(400).json({ error: 'La puntuación debe ser un número entero mayor o igual a 0' });
    }

    try {
        const [jugador] = await pool.query('SELECT id_jugador FROM jugadores WHERE id_jugador = ?', [id_jugador]);
        if (jugador.length === 0) {
            return res.status(404).json({ error: 'El jugador especificado no existe' });
        }

        const [videojuego] = await pool.query('SELECT id_videojuego FROM videojuegos WHERE id_videojuego = ?', [id_videojuego]);
        if (videojuego.length === 0) {
            return res.status(404).json({ error: 'El videojuego especificado no existe' });
        }

        const [resultado] = await pool.query(
            'INSERT INTO puntuaciones (id_jugador, id_videojuego, puntuacion, fecha) VALUES (?, ?, ?, NOW())',
            [id_jugador, id_videojuego, valorPuntuacion]
        );

        res.status(201).json({
            message: 'Puntuación registrada exitosamente',
            id: resultado.insertId
        });
    } catch (error) {
        console.error('Error al registrar la puntuación:', error);
        res.status(500).json({ error: 'Error interno al registrar la puntuación' });
    }
});

// Aqui se actulizan las puntuaciones por PUT

router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { puntuacion } = req.body;

    if (puntuacion === undefined || puntuacion === null) {
        return res.status(400).json({ error: 'El campo puntuación es obligatorio' });
    }

    const valorPuntuacion = Number(puntuacion);
    if (isNaN(valorPuntuacion) || valorPuntuacion < 0) {
        return res.status(400).json({ error: 'La puntuación debe ser un número entero mayor o igual a 0' });
    }

    try {
        const [existente] = await pool.query('SELECT * FROM puntuaciones WHERE id_puntuacion = ?', [id]);
        if (existente.length === 0) {
            return res.status(404).json({ error: 'La puntuación solicitada no existe' });
        }

        await pool.query(
            'UPDATE puntuaciones SET puntuacion = ? WHERE id_puntuacion = ?',
            [valorPuntuacion, id]
        );

        res.json({ message: 'Puntuación actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la puntuación:', error);
        res.status(500).json({ error: 'Error interno al actualizar la puntuación' });
    }
});

// Esta parte de codigo es para eliminar puntuacion por DELETE

router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const [existente] = await pool.query('SELECT * FROM puntuaciones WHERE id_puntuacion = ?', [id]);
        if (existente.length === 0) {
            return res.status(404).json({ error: 'La puntuación solicitada no existe' });
        }

        await pool.query('DELETE FROM puntuaciones WHERE id_puntuacion = ?', [id]);
        res.json({ message: 'Puntuación eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la puntuación:', error);
        res.status(500).json({ error: 'Error interno al eliminar la puntuación' });
    }
});

module.exports = router;