const http = require("http");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const PORT = 3000;

function getContentType(filePath) {
  const ext = path.extname(filePath);
  const contentTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".json": "application/json",
  };
  return contentTypes[ext] || "application/octet-stream";
}

function handleScanRequest(req, res) {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      const { barcode } = JSON.parse(body);

      const cleanBarcode = String(barcode).trim();

      // for debugging lang naman kung nakikita talaga
      console.log("=== SCAN REQUEST ===");
      console.log("Raw barcode:", JSON.stringify(barcode));
      console.log("Clean barcode:", cleanBarcode);
      console.log("Barcode length:", cleanBarcode.length);
      console.log("===================");

      if (!cleanBarcode) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid barcode" }));
        return;
      }

      const db = new sqlite3.Database("./database/products.db");

      db.get(
        "SELECT * FROM products WHERE id = ?",
        [cleanBarcode],
        (err, row) => {
          if (err) {
            console.error("Database error:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Database error" }));
          } else if (!row) {
            console.log("Product not found for barcode:", cleanBarcode);
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Product not found" }));
          } else {
            console.log("Product found:", row);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(row));
          }
          db.close();
        }
      );
    } catch (error) {
      console.error("Error parsing request:", error);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid request" }));
    }
  });
}

function handleStaticFile(req, res) {
  let filePath = "";

  if (req.url === "/") {
    filePath = "./public/index.html";
  } else if (req.url === "/customer") {
    filePath = "./public/customer.html";
  } else if (req.url === "/cashier") {
    filePath = "./public/cashier.html";
  } else if (req.url === "/admin") {
    filePath = "./public/admin.html";
  } else if (
    req.url.startsWith("/assets/") ||
    req.url.startsWith("/css/") ||
    req.url.startsWith("/js/")
  ) {
    filePath = "./public" + req.url;
  } else if (req.url.startsWith("/node_modules/")) {
    filePath = "." + req.url;
  } else {
    filePath = "./public/404.html";
  }

  console.log(`Request: ${req.url} -> ${filePath}`);

  fs.readFile(filePath, (error, data) => {
    if (error) {
      console.error(`Error reading file: ${filePath}`, error);
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>404 - File Not Found</h1>");
    } else {
      const contentType = getContentType(filePath);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/scan") {
    handleScanRequest(req, res);
    return;
  }

  handleStaticFile(req, res);
});

server.listen(PORT, (error) => {
  if (error) {
    console.error("Server error:", error);
  } else {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Customer page: http://localhost:${PORT}/customer`);
    console.log(`Cashier page: http://localhost:${PORT}/cashier`);
    console.log(`Admin page: http://localhost:${PORT}/admin`);
  }
});
