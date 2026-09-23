const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// Validar formato de correo
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


// Esta parte de codigo es para registrar a los jugadores por POST

router.post('/', authMiddleware, async (req, res) => {
    let { nombre, gamertag, correo } = req.body;

    if (!nombre || !gamertag || !correo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    nombre = nombre.trim();
    gamertag = gamertag.trim();
    correo = correo.trim().toLowerCase();

    if (!EMAIL_REGEX.test(correo)) {
        return res.status(400).json({ error: 'El correo electrónico no es válido' });
    }

    try {
        const [existenteGamertag] = await pool.query('SELECT id_jugador FROM jugadores WHERE gamertag = ?', [gamertag]);
        if (existenteGamertag.length > 0) {
            return res.status(400).json({ error: 'El gamertag ya está registrado' });
        }

        const [existenteCorreo] = await pool.query('SELECT id_jugador FROM jugadores WHERE correo = ?', [correo]);
        if (existenteCorreo.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
        }

        const [resultado] = await pool.query(
            'INSERT INTO jugadores (nombre, gamertag, correo, fecha_registro) VALUES (?, ?, ?, NOW())',
            [nombre, gamertag, correo]
        );

        res.status(201).json({
            message: 'Jugador registrado correctamente',
            id: resultado.insertId
        });
    } catch (error) {
        console.error('Error al registrar jugador:', error);
        res.status(500).json({ error: 'Error al registrar el jugador' });
    }
});

// Esta parte de codigo es para obtener a todos los jugadores por GET

router.get('/', async (req, res) => {
    try {
        const [filas] = await pool.query(
            'SELECT id_jugador, nombre, gamertag, correo, fecha_registro FROM jugadores ORDER BY fecha_registro DESC'
        );
        res.json(filas);
    } catch (error) {
        console.error('Error al obtener jugadores:', error);
        res.status(500).json({ error: 'Error al obtener jugadores' });
    }
});

// Este parte de codigo es para buscar un jugador por gamertag o nombre por GET

router.get('/buscar_jugador', async (req, res) => {
    const { q } = req.query;

    if (!q || !q.trim()) {
        return res.status(400).json({ error: 'Falta el término de búsqueda (q)' });
    }

    try {
        const termino = `%${q.trim()}%`;
        const [filas] = await pool.query(
            'SELECT id_jugador, nombre, gamertag, correo, fecha_registro FROM jugadores WHERE gamertag LIKE ? OR nombre LIKE ? ORDER BY fecha_registro DESC',
            [termino, termino]
        );
        res.json(filas);
    } catch (error) {
        console.error('Error al buscar jugadores:', error);
        res.status(500).json({ error: 'Error al buscar jugadores' });
    }
});

// Esta parte de codigo es para actulizar al jugador por PUT

router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    let { nombre, gamertag, correo } = req.body;

    if (!nombre || !gamertag || !correo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    nombre = nombre.trim();
    gamertag = gamertag.trim();
    correo = correo.trim().toLowerCase();

    if (!EMAIL_REGEX.test(correo)) {
        return res.status(400).json({ error: 'El correo electrónico no es válido' });
    }

    try {
        const [jugadorExistente] = await pool.query('SELECT * FROM jugadores WHERE id_jugador = ?', [id]);
        if (jugadorExistente.length === 0) {
            return res.status(404).json({ error: 'El jugador no existe' });
        }

        const [dupGamertag] = await pool.query(
            'SELECT id_jugador FROM jugadores WHERE gamertag = ? AND id_jugador != ?',
            [gamertag, id]
        );
        if (dupGamertag.length > 0) {
            return res.status(400).json({ error: 'El gamertag ya esta en uso' });
        }

        const [dupCorreo] = await pool.query(
            'SELECT id_jugador FROM jugadores WHERE correo = ? AND id_jugador != ?',
            [correo, id]
        );
        if (dupCorreo.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya esta en uso' });
        }

        await pool.query(
            'UPDATE jugadores SET nombre = ?, gamertag = ?, correo = ? WHERE id_jugador = ?',
            [nombre, gamertag, correo, id]
        );

        res.json({ message: 'Jugador actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar jugador:', error);
        res.status(500).json({ error: 'Error al actualizar el jugador' });
    }
});

// Esta parte de codigo es para eliminar a un jugador por DELETE

router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const [jugadorExistente] = await pool.query('SELECT * FROM jugadores WHERE id_jugador = ?', [id]);
        if (jugadorExistente.length === 0) {
            return res.status(404).json({ error: 'El jugador no existe' });
        }

        await pool.query('DELETE FROM jugadores WHERE id_jugador = ?', [id]);
        res.json({ message: 'Jugador eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar jugador:', error);
        res.status(500).json({ error: 'Error al eliminar el jugador' });
    }
});

module.exports = router;