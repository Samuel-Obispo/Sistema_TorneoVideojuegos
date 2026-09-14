
const express = require('express');
const router = express.Router();
const db = require('../db');



// Este bloque de codigo es para registrar los videojuegos

router.post('/', async (req, res) => {
    const { nombre, genero } = req.body;

    if (!nombre || !genero) {
        return res.status(400).json({ error: 'Faltan campos que son obligatorios' });
    }
    try {
        const [existenteVideojuego] = await db.query('SELECT * FROM videojuegos WHERE nombre = ?', [nombre]);
        if (existenteVideojuego.length > 0) {
            return res.status(400).json({ error: 'El videojuego ya está registrado' });
        }
        const [resultado] = await db.query(
            'INSERT INTO videojuegos (nombre, genero) VALUES (?, ?)',
            [nombre, genero]
        );
        res.status(201).json({ message: 'Videojuego registrado exitosamente', id: resultado.insertId });
    } catch (error) {
        console.error('Error al registrar el videojuego:', error);
        res.status(500).json({ error: 'Error al registrar', detalle: error.message });
    }
});


// Esta parte de codigo es para tener todos los videojuegos

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM videojuegos');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los videojuegos:', error);
        res.status(500).json({ error: 'Error al obtener los videojuegos' });
    }
});


module.exports = router;