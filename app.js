const express = require('express');
const bodyParser = require('body-parser');
const { db, initDB } = require('./db');

const app = express();
const port = 8001;

app.use(bodyParser.json());

initDB();

app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ users: rows });
  });
});

app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ user: row });
  });
});

app.post('/users', (req, res) => {
  const { name, email } = req.body;
  db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ updated: this.changes });
  });
});

app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

app.patch('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  let updates = [];
  let params = [];

  if (name) {
    updates.push('name = ?');
    params.push(name);
  }

  if (email) {
    updates.push('email = ?');
    params.push(email);
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    return;
  }

  params.push(id);

  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ updated: this.changes });
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API REST en http://0.0.0.0:${port}`);
});
