let scannedResult = null;
const scanner = new Html5QrcodeScanner("reader", {
  fps: 20,
  qrbox: function (viewfinderWidth, viewfinderHeight) {
    return {
      width: Math.min(viewfinderWidth * 1, viewfinderHeight * 1),
      height: Math.min(viewfinderWidth * 1, viewfinderHeight * 1),
    };
  },
});

scanner.render(success, error);

function success(result) {
  scannedResult = result.trim();
  console.log("Scanned result:", scannedResult);

  fetch("/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ barcode: scannedResult }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Product data received:", data);

      if (data.error) {
        displayError(data.error);
      } else {
        displayProduct(data);
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      displayError("Failed to connect to server");
    });

  document.getElementById("result").innerHTML = `Scanned!`;
  setTimeout(() => {
    document.getElementById("result").innerHTML = "Scanning...";
  }, 5000);
}

function displayProduct(product) {
  document.getElementById("prodName").textContent =
    product.prodName || "Unknown Product";

  document.getElementById("prodSize").textContent = product.prodSize || "N/A";

  document.getElementById("prodPrice").textContent = product.prodPrice
    ? product.prodPrice.toFixed(2)
    : "0.00";

  document.getElementById("prodDescription").textContent =
    product.prodDescription || "No description available";

  const imgElement = document.getElementById("prodImage");
  const noImageDiv = document.getElementById("noImage");

  if (product.prodImage) {
    imgElement.src = `/assets/images/${product.prodImage}`;
    imgElement.style.display = "block";
    noImageDiv.style.display = "none";

    imgElement.onerror = function () {
      imgElement.style.display = "none";
      noImageDiv.style.display = "flex";
    };
  } else {
    imgElement.style.display = "none";
    noImageDiv.style.display = "flex";
  }
}

function displayError(message) {
  document.getElementById("prodName").textContent = "Not Found";
  document.getElementById("prodSize").textContent = "N/A";
  document.getElementById("prodPrice").textContent = "0.00";
  document.getElementById("prodDescription").textContent = message;

  const imgElement = document.getElementById("prodImage");
  const noImageDiv = document.getElementById("noImage");
  imgElement.style.display = "none";
  noImageDiv.style.display = "flex";
}

function error(err) {
  console.error(err);
}

setTimeout(() => {
  const startButton = document.getElementById(
    "html5-qrcode-button-camera-start"
  );
  const stopButton = document.getElementById("html5-qrcode-button-camera-stop");

  if (startButton) {
    startButton.addEventListener("click", () => {
      document.getElementById("result").innerHTML = "Scanning...";
    });
  }

  if (stopButton) {
    stopButton.addEventListener("click", () => {
      document.getElementById("result").innerHTML = "Waiting to scan...";
    });
  }

  const swapLink = document.querySelector(
    "#reader__dashboard_section_swaplink"
  );
  if (swapLink) {
    const select = swapLink.querySelector("select");
    if (select) {
      swapLink.innerHTML = "";
      swapLink.appendChild(select);
    }
  }
}, 500);

const observer = new MutationObserver((mutations) => {
  const videoElement = document.querySelector("#reader video");
  if (videoElement) {
    document.getElementById("result").innerHTML = "Scanning...";
    observer.disconnect();
  }
});

observer.observe(document.getElementById("reader"), {
  childList: true,
  subtree: true,
});
