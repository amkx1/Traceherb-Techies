import { createHarvest } from './api.js';

document.getElementById("harvestForm").addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    batchId: document.getElementById("batchId").value,
    quantity: Number(document.getElementById("quantity").value)
  };
  const res = await createHarvest(data);
  alert(res.success ? "Harvest Added!" : res.error);
});
