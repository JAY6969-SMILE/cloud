import { apiFetch, authHeaders, getToken } from './app.js';

const wrap = document.getElementById('myApplicationsWrap');

async function loadApplications() {
  if (!getToken()) {
    wrap.innerHTML = '<p class="muted">Login to view your applications.</p>';
    return;
  }
  try {
    const apps = await apiFetch('/users/applications', {
      method: 'GET',
      headers: { ...authHeaders() }
    });
    if (!apps || apps.length === 0) {
      wrap.innerHTML = '<div class="center-empty">No applications found.</div>';
      return;
    }
    wrap.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Job</th>
              <th>Company</th>
              <th>Status</th>
              <th>Applied At</th>
            </tr>
          </thead>
          <tbody>
            ${apps.map(a => `
              <tr>
                <td>${a.job?.title || '-'}</td>
                <td>${a.job?.company || '-'}</td>
                <td><span class="status-pill">${a.status || '-'}</span></td>
                <td>${a.appliedAt || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    wrap.innerHTML = `<p class="muted">${err.message}</p>`;
  }
}

loadApplications();
