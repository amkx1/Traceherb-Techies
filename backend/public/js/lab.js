import { uploadLabTest } from './api.js';

document.getElementById("labForm").addEventListener("submit", async e => {
  e.preventDefault();
  const file = document.getElementById("reportFile").files[0];
  const res = await uploadLabTest(file);
  alert(res.success ? "Lab Report Uploaded!" : res.error);
});
