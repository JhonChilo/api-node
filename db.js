const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./students.sqlite', (err) => {
  if (err) {
    console.error("Error al abrir la base de datos:", err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }
});

const createTableQuery = `CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  gender TEXT NOT NULL,
  age TEXT
)`;

db.run(createTableQuery, (err) => {
  if (err) {
    console.error("Error al crear la tabla:", err.message);
  } else {
    console.log('Tabla "students" creada o ya existe.');
  }
});

db.close((err) => {
  if (err) {
    console.error("Error al cerrar la base de datos:", err.message);
  } else {
    console.log('Conexión cerrada.');
  }
});
