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
      description:
        "Zonrox Bleach delivers a 6-in-1 Total Clean for 99.9% antibacterial protection, whitening, deodorizing, elimination of disease-causing germs.",
      image: "zonrox.jpeg",
    },
    {
      id: "2331047840521",
      name: "Baygon",
      size: "1L",
      price: 192.32,
      description:
        "Proven to kill small and large cockroaches. · Kills fast and keeps on killing for up to 3 weeks. · Kills the eggs roaches carry.",
      image: "baygon.jpg",
    },
    {
      id: "5131047982521",
      name: "Vicks",
      size: null,
      price: 450.5,
      description:
        "Vicks is a popular brand of over-the-counter cold and flu remedies, known for its signature mentholated ointment, Vicks VapoRub, used to relieve coughs and minor aches by creating cooling vapors from ingredients like camphor, menthol, and eucalyptus oil.",
      image: "vicks.jpg",
    },
    {
      id: "92919459824228",
      name: "Pringles",
      size: 0.74,
      price: 75.0,
      description:
        "Pringles is an American brand of stackable potato-based chips invented by Procter & Gamble (P&G) in 1968 and marketed 'Pringle's Newfangled Potato Chips'.",
      image: "pringles.jpg",
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
