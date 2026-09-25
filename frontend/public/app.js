const API_BASE = 'http://localhost:8000/api';

async function fetchRecords() {
  const container = document.getElementById('records-list');
  container.innerHTML = '<p>Loading records...</p>';
  try {
    const res = await fetch(`${API_BASE}/records`);
    const records = await res.json();
    if (!records.length) {
      container.innerHTML = '<p>No records found.</p>';
      return;
    }
    container.innerHTML = records
      .map(
        (r) => `
      <div class="record-item">
        <h3>${escapeHtml(r.title)}</h3>
        <p>${escapeHtml(r.description || 'No description')}</p>
        <small>Created: ${new Date(r.createdAt).toLocaleString()}</small>
      </div>`
      )
      .join('');
  } catch (err) {
    container.innerHTML = `<p class="error">Error loading records: ${err.message}</p>`;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.getElementById('record-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;

  try {
    const res = await fetch(`${API_BASE}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) throw new Error(`Failed to create record: ${res.statusText}`);
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    fetchRecords();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
});

document.getElementById('btn-refresh').addEventListener('click', fetchRecords);
document.addEventListener('DOMContentLoaded', fetchRecords);
