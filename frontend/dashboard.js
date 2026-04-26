import { apiFetch, authHeaders, requireEmployer } from './app.js';

if (requireEmployer()) {
  const wrap = document.getElementById('dashboardWrap');
  const params = new URLSearchParams(location.search);
  const jobId = params.get('jobId');

  function renderSkills(skills) {
    if (!skills) return '<span class="muted">-</span>';
    return skills.split(',').map(s => s.trim()).filter(Boolean)
      .map(s => `<span class="skill-badge">${s}</span>`).join('');
  }

  async function loadDashboard() {
    if (!jobId) {
      wrap.innerHTML = '<p class="muted">Missing jobId in URL.</p>';
      return;
    }

    try {
      const apps = await apiFetch(`/jobs/${jobId}/applications`, {
        method: 'GET',
        headers: { ...authHeaders() }
      });

      if (!apps || apps.length === 0) {
        wrap.innerHTML = '<div class="center-empty">No applications yet.</div>';
        return;
      }

      wrap.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Email</th>
                <th>Parsed Skills</th>
                <th>Status</th>
                <th>Applied At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${apps.map(a => `
                <tr data-app-id="${a.id}">
                  <td>${a.applicant?.name || '-'}</td>
                  <td>${a.applicant?.email || '-'}</td>
                  <td>${renderSkills(a.skills)}</td>
                  <td><span class="status-pill">${a.status || '-'}</span></td>
                  <td>${a.appliedAt || '-'}</td>
                  <td>
                    ${a.status === 'APPLIED' ? `
                      <button class="btn tiny accept-btn">Accept</button>
                      <button class="btn tiny reject-btn">Reject</button>
                    ` : '<span class="muted">-</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      // Add event listeners for Accept/Reject buttons
      wrap.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const tr = e.target.closest('tr');
          const appId = tr.getAttribute('data-app-id');
          btn.disabled = true;
          try {
            await apiFetch(`/jobs/applications/${appId}/accept`, {
              method: 'PUT',
              headers: { ...authHeaders() }
            });
            loadDashboard();
          } catch (err) {
            alert('Failed to accept: ' + err.message);
            btn.disabled = false;
          }
        });
      });
      wrap.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const tr = e.target.closest('tr');
          const appId = tr.getAttribute('data-app-id');
          btn.disabled = true;
          try {
            await apiFetch(`/jobs/applications/${appId}/reject`, {
              method: 'PUT',
              headers: { ...authHeaders() }
            });
            loadDashboard();
          } catch (err) {
            alert('Failed to reject: ' + err.message);
            btn.disabled = false;
          }
        });
      });
    } catch (err) {
      wrap.innerHTML = `<p class="muted">${err.message}</p>`;
    }
  }

  loadDashboard();
}
