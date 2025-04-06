const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('students.sqlite', (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos', err.message);
    return;
  }
  console.log('Conectado a la base de datos SQLite');
});

const initDB = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL
    )
  `);
};

module.exports = { db, initDB };
