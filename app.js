const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = new sqlite3.Database('students.sqlite', (err) => {
  if (err) return console.error('Error al conectar con la base de datos', err.message);
  console.log('Conectado a la base de datos SQLite');
});

// Cambié la creación de la tabla para que solo tenga nombre y correo
db.run(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL
  )
`);

// Rutas para gestionar los estudiantes

// Obtener todas las personas
app.get('/personas', (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear una nueva persona
app.post('/personas', (req, res) => {
  const { nombre, correo } = req.body;
  if (!nombre || !correo) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = 'INSERT INTO students (firstname, lastname) VALUES (?, ?)';
  db.run(sql, [nombre, correo], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Persona creada', id: this.lastID });
  });
});

// Obtener una persona por ID
app.get('/persona/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Persona no encontrada' });
    res.json(row);
  });
});

// Modificar una persona por ID
app.put('/persona/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, correo } = req.body;

  const sql = 'UPDATE students SET firstname = ?, lastname = ? WHERE id = ?';
  db.run(sql, [nombre, correo, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Persona no encontrada' });
    res.json({ message: 'Persona actualizada' });
  });
});

// Eliminar una persona por ID
app.delete('/persona/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM students WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Persona no encontrada' });
    res.json({ message: `Persona con ID ${id} eliminada` });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});
