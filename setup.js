const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT)", (err) => {
    if (err) {
      console.error("Error creating table:", err.message);
    } else {
      console.log("Table created successfully!");
    }
  });
});

db.close();
