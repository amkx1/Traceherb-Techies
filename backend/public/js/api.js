// api.js

const BASE_URL = "http://localhost:3000/api";   // For product/batch/harvest/recall
const AUTH_URL = "http://localhost:3000/auth";  // For authentication (OTP)

// Generic request handler
async function handleRequest(url, options) {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    return data;
  } catch (err) {
    alert(err.message);
    return { success: false, error: err.message };
  }
}

// ---------------- Authentication ----------------
export async function requestOtp(phone) {
  return handleRequest(`${AUTH_URL}/otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone })
  });
}

export async function verifyOtp(phone, otp) {
  return handleRequest(`${AUTH_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp })
  });
}

// ---------------- Products ----------------
export async function registerProduct(data) {
  return handleRequest(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function getProductStatus(productId) {
  return handleRequest(`${BASE_URL}/status/${productId}`);
}

// ---------------- Batches ----------------
export async function createBatch(data) {
  return handleRequest(`${BASE_URL}/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function getBatch(id) {
  return handleRequest(`${BASE_URL}/batch/${id}`);
}

// ---------------- Harvests ----------------
export async function createHarvest(data) {
  return handleRequest(`${BASE_URL}/harvest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function getHarvest(id) {
  return handleRequest(`${BASE_URL}/harvest/${id}`);
}

// ---------------- Recalls ----------------
export async function createRecall(data) {
  return handleRequest(`${BASE_URL}/recall`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function getRecall(id) {
  return handleRequest(`${BASE_URL}/recall/${id}`);
}

// ---------------- Lab Reports ----------------
export async function uploadLabTest(file) {
  const formData = new FormData();
  formData.append("reportFile", file);
  return handleRequest(`${BASE_URL}/lab/tests`, { method: "POST", body: formData });
}

// ---------------- Provenance ----------------
export async function getProvenance(batchId) {
  return handleRequest(`${BASE_URL}/provenance/${batchId}`);
}

// ---------------- AI Query ----------------
export async function queryAI(question, batchId) {
    const response = await fetch(`${BASE_URL}/ai/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, batchId }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to query AI');
    }
    return data;
}
