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

db.run(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    gender TEXT NOT NULL,
    age INTEGER
  )
`);

app.get('/students', (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/students', (req, res) => {
  const { firstname, lastname, gender, age } = req.body;
  if (!firstname || !lastname || !gender || !age) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = 'INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)';
  db.run(sql, [firstname, lastname, gender, age], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Estudiante creado', id: this.lastID });
  });
});

app.get('/student/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Estudiante no encontrado' });
    res.json(row);
  });
});

app.put('/student/:id', (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, gender, age } = req.body;

  const sql = 'UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?';
  db.run(sql, [firstname, lastname, gender, age, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    res.json({ message: 'Estudiante actualizado' });
  });
});

app.delete('/student/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM students WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    res.json({ message: `Estudiante con ID ${id} eliminado` });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});

