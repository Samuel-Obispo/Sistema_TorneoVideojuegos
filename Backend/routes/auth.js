const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', async (req, res) => {
    let { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    nombre = nombre.trim();
    correo = correo.trim().toLowerCase();

    if (!EMAIL_REGEX.test(correo)) {
        return res.status(400).json({ error: 'El formato del correo es inválido' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    try {
        const [existente] = await pool.query('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo]);
        if (existente.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const [resultado] = await pool.query(
            'INSERT INTO usuarios (nombre, correo, password_hash) VALUES (?, ?, ?)',
            [nombre, correo, passwordHash]
        );

        res.status(201).json({ message: 'Usuario registrado correctamente', id: resultado.insertId });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno al registrar usuario' });
    }
});


router.post('/login', async (req, res) => {
    let { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contraseña requeridos' });
    }

    correo = correo.trim().toLowerCase();

    try {
        const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        if (usuarios.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const usuario = usuarios[0];
        const esValida = await bcrypt.compare(password, usuario.password_hash);
        if (!esValida) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const token = jwt.sign(
            { id_usuario: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            message: 'Autenticación exitosa',
            token,
            usuario: { id: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno al iniciar sesión' });
    }
});

module.exports = router;