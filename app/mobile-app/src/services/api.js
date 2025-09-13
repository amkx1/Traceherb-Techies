import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://your-backend-server.com/api';

async function request(endpoint, method = 'GET', body) {
  const token = await AsyncStorage.getItem('jwt');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'API error');
  }
  return method === 'GET' && endpoint.startsWith('/provenance') ? response.text() : response.json();
}

export async function storeToken(token) {
  return AsyncStorage.setItem('jwt', token);
}

export async function getToken() {
  return AsyncStorage.getItem('jwt');
}

export default {
  login: (username, password) => request('/login', 'POST', { username, password }).then(res => res.token),
  registerCollector: collector => request('/collectors', 'POST', collector),
  createCollection: collection => request('/collections', 'POST', collection),
  getProvenance: batchId => request(`/provenance/${batchId}`),
  getRecentRecalls: () => request('/recall'),
  getComplianceReport: batchId => request(`/compliance/${batchId}`),
  storeToken, getToken,
};
