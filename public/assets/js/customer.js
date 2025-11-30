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

setTimeout(() => {
  const dashboard = document.getElementById("reader__dashboard_section");
  const controlsContainer = document.getElementById("controls");

  if (dashboard && controlsContainer) {
    controlsContainer.appendChild(dashboard);
  }
}, 100);

// this is to pirint the result it had decoded from the image you showed
function success(result) {
  document.getElementById("result").innerHTML = `
    <p><a>${result}</a></p>
  `;

  // to hide the output after 5 seconds
  setTimeout(() => {
    document.getElementById("result").innerHTML = "Waiting to scan...";
  }, 3000);
}

// this is just to show errors or maybe for debugging (formality)
function error(err) {
  console.error(err);
}
