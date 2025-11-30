const scanner = new Html5QrcodeScanner("reader", {
  fps: 20,
  qrbox: function (viewfinderWidth, viewfinderHeight) {
    const minDimension = Math.min(viewfinderWidth, viewfinderHeight);
    const boxSize = Math.floor(minDimension * 0.7); // Reduced from 1 to 0.7
    return {
      width: boxSize,
      height: boxSize,
    };
  },
});

function success(result) {
  document.getElementById("result").innerHTML = `
    <p>${result}</p>
  `;
  setTimeout(() => {
    document.getElementById("result").innerHTML = "Waiting to scan...";
  }, 5000);
}

function error(err) {
  console.error(err);
}

scanner.render(success, error);

// Increased timeout and added error checking
setTimeout(() => {
  const dashboard = document.getElementById("reader__dashboard_section");
  const controlsContainer = document.getElementById("controls");
  if (dashboard && controlsContainer) {
    controlsContainer.appendChild(dashboard);
  } else {
    console.warn("Dashboard or controls container not found");
  }
}, 500); // Increased from 100ms to 500ms
