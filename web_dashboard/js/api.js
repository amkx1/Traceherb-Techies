const BASE_URL = 'http://localhost:4000/api';
async function post(endpoint, data) {
    const res = await fetch(BASE_URL + endpoint, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(data) });
    return res.json();
}
async function get(endpoint) {
    const res = await fetch(BASE_URL + endpoint);
    return res.json();
}
