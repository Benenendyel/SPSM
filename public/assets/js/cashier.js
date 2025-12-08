let lastScannedCode = "";
let lastScanTime = 0;
const COOLDOWN = 3000;
const soundEffect = new Audio("../assets/audio/qrcode_sound_effect.mp3");

const cart = [];
let total = 0;

const scanner = new Html5QrcodeScanner(
  "reader",
  {
    fps: 25,
    qrbox: function (viewfinderWidth, viewfinderHeight) {
      return {
        width: Math.min(viewfinderWidth * 1, viewfinderHeight * 1),
        height: Math.min(viewfinderWidth * 1, viewfinderHeight * 1),
      };
    },
    showTorchButtonIfSupported: true,
    showZoomSliderIfSupported: true,
  },
  false
);

function onScanSuccess(decodedText) {
  const code = decodedText.trim();
  const now = Date.now();

  if (code === lastScannedCode && now - lastScanTime < COOLDOWN) return;
  lastScannedCode = code;
  lastScanTime = now;

  soundEffect.currentTime = 0;
  soundEffect.play().catch(() => {});

  updateStatus(`Scanned: ${code}`);
  addProductByBarcode(code);
}

function onScanError() {}

scanner.render(onScanSuccess, onScanError);

document.getElementById("product-search").addEventListener("keypress", (e) => {
  if (e.key !== "Enter") return;
  const query = e.target.value.trim();
  if (!query) return;
  e.target.value = "";
  updateStatus("Searching...");
  addProductByBarcode(query);
});

async function addProductByBarcode(barcode) {
  try {
    const res = await fetch("/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ barcode }),
    });

    if (!res.ok) throw new Error("Not found");

    const product = await res.json();

    if (!product.prodName || product.prodPrice == null)
      throw new Error("Invalid data");

    const item = {
      barcode: product.id,
      prodName: product.prodName,
      price: parseFloat(product.prodPrice),
      size: product.prodSize || "",
    };

    const existing = cart.find((i) => i.barcode === item.barcode);
    if (existing) existing.quantity += 1;
    else cart.push({ ...item, quantity: 1 });

    calculateTotal();
    renderCart();
    updateStatus(`${product.prodName} added!`, "success");
  } catch (err) {
    updateStatus("Product not found", "error");
  } finally {
    setTimeout(() => updateStatus("Ready to scan or search..."), 2000);
  }
}

function calculateTotal() {
  total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function renderCart() {
  const container = document.getElementById("cart-items");
  const countEl = document.getElementById("cart-count");
  const totalEl = document.getElementById("total-amount");

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  countEl.textContent = totalItems;
  totalEl.textContent = `₱${total.toFixed(2)}`;

  if (cart.length === 0) {
    container.innerHTML =
      '<div class="empty-cart">Cart is empty. Scan or search to add items.</div>';
    return;
  }

  container.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <div class="item-info">
        <h3>${item.prodName}</h3>
        ${item.size ? `<small>${item.size}</small><br>` : ""}
        <p>₱${item.price.toFixed(2)} each</p>
      </div>
      <div class="item-quantity">×${item.quantity}</div>
      <div class="item-price">₱${(item.price * item.quantity).toFixed(2)}</div>
      <div class="item-actions">
        <button onclick="decreaseQty('${item.barcode}')">−</button>
        <button onclick="increaseQty('${item.barcode}')">+</button>
        <button onclick="deleteItem('${item.barcode}')">×</button>
      </div>
    </div>
  `
    )
    .join("");
}

function increaseQty(barcode) {
  const item = cart.find((i) => i.barcode === barcode);
  if (item) {
    item.quantity++;
    calculateTotal();
    renderCart();
  }
}
function decreaseQty(barcode) {
  const item = cart.find((i) => i.barcode === barcode);
  if (item) {
    if (item.quantity > 1) item.quantity--;
    else cart.splice(cart.indexOf(item), 1);
    calculateTotal();
    renderCart();
  }
}
function deleteItem(barcode) {
  const idx = cart.findIndex((i) => i.barcode === barcode);
  if (idx > -1) {
    cart.splice(idx, 1);
    calculateTotal();
    renderCart();
  }
}

function openCheckout() {
  if (cart.length === 0) return alert("Cart is empty!");
  document.getElementById("modal-total").textContent = `₱${total.toFixed(2)}`;
  document.getElementById("checkout-modal").classList.add("active");
}
function closeCheckout() {
  document.getElementById("checkout-modal").classList.remove("active");
}
function completeSale() {
  alert(`Sale completed! Total: ₱${total.toFixed(2)}`);
  cart.length = 0;
  total = 0;
  renderCart();
  closeCheckout();
}
function voidTransaction() {
  if (!confirm("Void transaction?")) return;
  cart.length = 0;
  total = 0;
  renderCart();
}

function updateStatus(msg, type = "info") {
  const el = document.getElementById("scan-status");
  el.textContent = msg;
  el.style.color =
    type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#f59e0b";
}

function updateClock() {
  document.getElementById("clock").textContent = new Date().toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  );
}

window.addEventListener("load", () => {
  renderCart();
  updateStatus("Ready to scan or search...");
  updateClock();
  setInterval(updateClock, 1000);
});
