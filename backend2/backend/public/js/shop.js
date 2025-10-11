// shop.js
import { registerProduct, getProductStatus } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("shopForm");
  const statusDiv = document.getElementById("productStatus");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const farmerPhone = form.farmerPhone.value;
    const productType = form.productType.value;
    const quantity = form.quantity.value;
    const quality = form.quality.value;

    const response = await registerProduct({ farmerPhone, productType, quantity, quality });

    if (response.success) {
      alert("Product registered successfully!");
      form.reset();
    } else {
      alert(`Error: ${response.error}`);
    }
  });

  // Optional: check product status
  document.getElementById("checkStatusBtn")?.addEventListener("click", async () => {
    const productId = document.getElementById("productId").value;
    if (!productId) return alert("Enter a Product ID");

    const result = await getProductStatus(productId);
    if (result.success) {
      statusDiv.innerText = `Status: ${JSON.stringify(result.status)}`;
    } else {
      statusDiv.innerText = `Error: ${result.error}`;
    }
  });
});
