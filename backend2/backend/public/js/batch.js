import { createBatch } from './api.js';

document.getElementById("batchForm").addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    batchName: document.getElementById("batchName").value,
    productId: document.getElementById("productId").value
  };
  const res = await createBatch(data);
  alert(res.success ? "Batch Created!" : res.error);
});
