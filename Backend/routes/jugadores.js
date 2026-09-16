
const express = require('express');
const router = express.Router();
const pool = require('../db');


// Esta parte de codigo es para registrar a los jugadores

router.post('/', async (req, res) => {
    const { nombre, gamertag, correo} = req.body;

    if (!nombre || !gamertag || !correo) {
        return res.status(400).json({ error: 'Faltan campos que son obligatorios' });
    }
    try {
        const [existenteJugador] = await pool.query('SELECT * FROM jugadores WHERE gamertag = ?', [gamertag]);
        if (existenteJugador.length > 0) {
            return res.status(400).json({ error: 'El gamertag ya está registrado' });
    
        }

        const fecha_registro = new Date();
        const [resultado] = await pool.query(
            'INSERT INTO jugadores (nombre, gamertag, correo, fecha_registro) VALUES (?, ?, ?, ?)',
            [nombre, gamertag, correo, fecha_registro]
        );
        res.status(201).json({ message: 'Jugador registrado exitosamente', id: resultado.insertId });

    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el jugador', detalle: error.message });
    }

});


//Aqui buscamos a los jugadores por su gamertag o el nombre

router.get('/buscar_jugador', async (req, res) => {
    const {q} = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Falta el termino de busqueda (q)' });
    }

    try {
        const terminoBusqueda = `%${q}%`;
        const [filas] = await pool.query(
            'SELECT * FROM jugadores WHERE gamertag LIKE ? OR nombre LIKE ?',
            [terminoBusqueda, terminoBusqueda]
        );
        res.json(filas);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar jugadores', detalle: error.message });
    }
});

// Aqui es para consultar todos los jugadores

router.get('/', async (req, res) => {
    try {
        const [filas] = await pool.query('SELECT * FROM jugadores ORDER BY fecha_registro DESC');
        res.json(filas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener jugadores', detalle: error.message });
    }
});

module.exports = router;