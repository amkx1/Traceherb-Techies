// dashboard.js
import { getHarvest, getBatch, getRecall } from './api.js';

async function loadStats() {
  try {
    // Example placeholders (replace with real API calls if backend supports)
    const harvests = (await getHarvest("all")) || { monthly: [120, 150, 180, 140, 200] };
    const batches = (await getBatch("all")) || 530;
    const recalls = (await getRecall("all")) || "3 Active";

    document.getElementById("totalHarvests").innerText = harvests?.monthly?.reduce((a,b)=>a+b,0) || 1245;
    document.getElementById("totalBatches").innerText = batches || 530;
    document.getElementById("totalRecalls").innerText = recalls || "3 Active";

    const ctx = document.getElementById("harvestChart");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [{
          label: "Harvest Quantity",
          data: harvests?.monthly || [120,150,180,140,200],
          borderColor: "#00ACC1",
          backgroundColor: "rgba(0,172,193,0.2)",
          fill: true,
          tension: 0.3
        }]
      }
    });
  } catch (err) {
    console.error("Error loading dashboard stats:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadStats();
});
