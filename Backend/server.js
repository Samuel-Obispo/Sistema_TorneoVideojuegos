
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/estoy_vivo', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({
            estado: 'La conexion a la base de datos es exitosa',
            resultado: rows[0].solution
        })
    }
    catch (error) {
        res.status(500).json({
            estado: 'Error al conectar a la base de datos',
            error: error.message
        });
    }

});

app.listen(PORT, () => {
    console.log(`El servidor está corriendo en el puerto ${PORT}`);
});
