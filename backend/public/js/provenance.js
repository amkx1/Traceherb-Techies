import { getProvenance } from './api.js';

document.getElementById("provenanceForm").addEventListener("submit", async e => {
  e.preventDefault();
  const batchId = document.getElementById("batchId").value;
  const res = await getProvenance(batchId);
  document.getElementById("provenanceList").innerText = JSON.stringify(res, null, 2);
});
