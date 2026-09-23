const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');


// Esta parte de codifgo es para registrar videojuegos por POST

router.post('/', authMiddleware, async (req, res) => {
    let { nombre, genero } = req.body;

    if (!nombre || !genero) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    nombre = nombre.trim();
    genero = genero.trim();
    try {
        const [existente] = await pool.query('SELECT id_videojuego FROM videojuegos WHERE nombre = ?', [nombre]);
        if (existente.length > 0) {
            return res.status(400).json({ error: 'El videojuego ya está registrado' });
        }

        const [resultado] = await pool.query(
            'INSERT INTO videojuegos (nombre, genero) VALUES (?, ?)',
            [nombre, genero]
        );

        res.status(201).json({
            message: 'Videojuego registrado correctamente',
            id: resultado.insertId
        });
    } catch (error) {
        console.error('Error al registrar el videojuego:', error);
        res.status(500).json({ error: 'Error al registrar el videojuego' });
    }
});


// Esta parte de codigo sirve para obtener todos lo videojuegos por GET

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM videojuegos ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los videojuegos:', error);
        res.status(500).json({ error: 'Error interno al obtener los videojuegos' });
    }
});


// Esta parte de para actualizar videojuegos por PUT

router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    let { nombre, genero } = req.body;

    if (!nombre || !genero) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    nombre = nombre.trim();
    genero = genero.trim();

    try {
        const [existente] = await pool.query('SELECT * FROM videojuegos WHERE id_videojuego = ?', [id]);
        if (existente.length === 0) {
            return res.status(404).json({ error: 'El videojuego no existe' });
        }

        const [dupNombre] = await pool.query(
            'SELECT id_videojuego FROM videojuegos WHERE nombre = ? AND id_videojuego != ?',
            [nombre, id]
        );
        if (dupNombre.length > 0) {
            return res.status(400).json({ error: 'Ya existe otro videojuego con ese nombre' });
        }

        await pool.query(
            'UPDATE videojuegos SET nombre = ?, genero = ? WHERE id_videojuego = ?',
            [nombre, genero, id]
        );

        res.json({ message: 'Videojuego actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el videojuego:', error);
        res.status(500).json({ error: 'Error interno al actualizar el videojuego' });
    }
});


// Esta parte de codigo es para eliminar videojuegos por DELETE

router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const [existente] = await pool.query('SELECT * FROM videojuegos WHERE id_videojuego = ?', [id]);
        if (existente.length === 0) {
            return res.status(404).json({ error: 'El videojuego no existe' });
        }

        await pool.query('DELETE FROM videojuegos WHERE id_videojuego = ?', [id]);
        res.json({ message: 'Videojuego eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el videojuego:', error);
        res.status(500).json({ error: 'Error interno al eliminar el videojuego' });
    }
});

module.exports = router;