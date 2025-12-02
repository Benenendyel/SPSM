const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./products.db");

db.serialize(() => {
  // Create products table with image column
  db.run(
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, 
      prodName TEXT NOT NULL, 
      prodSize TEXT, 
      prodPrice REAL NOT NULL, 
      prodDescription TEXT,
      prodImage TEXT
    )`
  );

  // Insert sample products
  const products = [
    {
      id: "4800047840012",
      name: "Zonrox",
      size: "1L",
      price: 199.0,
      description: "A cloth cleaner thingy",
      image: "zonrox.jpeg",
    },
    {
      id: "2331047840521",
      name: "Baygon",
      size: "1L",
      price: 192.32,
      description: "For spraying insects",
      image: "baygon.jpg",
    },
    {
      id: "5131047982521",
      name: "Vicks",
      size: null,
      price: 450.5,
      description: "For nose whaetevr",
      image: "vicks.jpg",
    },
  ];

  const insertStmt = db.prepare(
    `INSERT OR IGNORE INTO products (id, prodName, prodSize, prodPrice, prodDescription, prodImage) 
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  products.forEach((product) => {
    insertStmt.run([
      product.id,
      product.name,
      product.size,
      product.price,
      product.description,
      product.image,
    ]);
  });

  insertStmt.finalize();

  // Verify products were inserted
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      console.error("Error reading products:", err);
    } else {
      console.log("Products in database:");
      console.table(rows);
    }
  });
});

db.close((err) => {
  if (err) {
    console.error("Error closing database:", err);
  } else {
    console.log("Database setup complete!");
  }
});
