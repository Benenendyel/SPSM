const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./products.db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, prodName TEXT NOT NULL, prodSize TEXT, prodPrice REAL NOT NULL, prodDescription TEXT)"
  );

  db.run(
    "INSERT INTO products (id, prodName,  prodSize, prodPrice, prodDescription) VALUES (?, ?, ?, ?, ?)",
    [4800047840012, "Zonrox", "1L", 1999.0, "A cloth cleaner thingy"]
  );

  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      console.error("Error: ", err);
    } else {
      console.log("Products in databse");
      console.log(rows);
    }
  });
});

db.close((err) => {
  if (err) {
    console.error("Error closing database:", err);
  } else {
    console.log("Database closed successfully");
  }
});
