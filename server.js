const http = require("http");
const fs = require("fs");
const path = require("path");
const port = 3000;

function getContentType(filePath) {
  const extname = path.extname(filePath);
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
  };
  return contentTypes[extname] || "application/octet-stream";
}

const server = http.createServer(function (req, res) {
  let filePath = "";

  if (
    req.url.startsWith("/assets/") ||
    req.url.startsWith("/css/") ||
    req.url.startsWith("/js/")
  ) {
    filePath = "./public" + req.url;
  } else if (req.url.startsWith("/node_modules/")) {
    // Serve node_modules files
    filePath = "." + req.url; // e.g., /node_modules/some-lib/somefile.js
    console.log("Serving from node_modules:", filePath);
  } else if (req.url === "/") {
    filePath = "./public/index.html";
  } else if (req.url === "/customer") {
    filePath = "./public/customer.html";
    console.log("Displaying:", filePath);
  } else if (req.url === "/cashier") {
    filePath = "./public/cashier.html";
    console.log("Displaying:", filePath);
  } else if (req.url === "/admin") {
    filePath = "./public/admin.html";
    console.log("Displaying:", filePath);
  } else {
    filePath = "./public/404.html";
    console.log("Displaying:", filePath);
  }

  fs.readFile(filePath, function (error, data) {
    if (error) {
      res.writeHead(404);
      res.write("Error: File not found");
    } else {
      const contentType = getContentType(filePath);
      res.writeHead(200, { "Content-Type": contentType });
      res.write(data);
    }
    res.end();
  });
});

server.listen(port, function (error) {
  if (error) {
    console.log("There was an error", error);
  } else {
    console.log("Listening to port", port);
  }
});
