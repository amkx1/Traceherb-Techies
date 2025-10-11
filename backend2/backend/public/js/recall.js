import { createRecall } from './api.js';

document.getElementById("recallForm").addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    productId: document.getElementById("productId").value,
    reason: document.getElementById("reason").value
  };
  const res = await createRecall(data);
  alert(res.success ? "Recall Added!" : res.error);
});
