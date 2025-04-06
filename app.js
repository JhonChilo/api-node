const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = 8001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = new sqlite3.Database('students.sqlite', (err) => {
  if (err) return console.error('Error al conectar con la base de datos', err.message);
  console.log('Conectado a la base de datos SQLite');
});

db.run(`
  CREATE TABLE IF NOT EXISTS personas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL
  )
`);


app.get('/personas', (req, res) => {
  db.all('SELECT * FROM personas', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/personas', (req, res) => {
  const { nombre, correo } = req.body;
  if (!nombre || !correo) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Ahora la tabla es 'personas' y los campos 'nombre' y 'correo'
  const sql = 'INSERT INTO personas (nombre, correo) VALUES (?, ?)';
  db.run(sql, [nombre, correo], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Persona creada', id: this.lastID });
  });
});

// Obtener una persona por ID
app.get('/persona/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM personas WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Persona no encontrada' });
    res.json(row);
  });
});

// Modificar una persona por ID
app.put('/persona/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, correo } = req.body;

  // Actualizar la tabla 'personas' y los campos 'nombre' y 'correo'
  const sql = 'UPDATE personas SET nombre = ?, correo = ? WHERE id = ?';
  db.run(sql, [nombre, correo, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Persona no encontrada' });
    res.json({ message: 'Persona actualizada' });
  });
});

// Eliminar una persona por ID
app.delete('/persona/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM personas WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Persona no encontrada' });
    res.json({ message: `Persona con ID ${id} eliminada` });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});
