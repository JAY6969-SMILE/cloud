import { apiFetch, authHeaders, requireEmployer } from './app.js';

if (requireEmployer()) {
  const form = document.getElementById('postForm');
  const msg = document.getElementById('postMsg');

  function parseSalary(rawValue) {
    const normalized = String(rawValue || '').replace(/[$,\s]/g, '');
    const value = Number(normalized);
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error('Please enter a valid salary amount (for example: 50000).');
    }
    return value;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = 'Posting...';

    try {
      const salary = parseSalary(document.getElementById('salary').value);
      const body = {
        title: document.getElementById('title').value.trim(),
        company: document.getElementById('company').value.trim(),
        location: document.getElementById('location').value.trim(),
        salary,
        description: document.getElementById('description').value.trim()
      };

      const job = await apiFetch('/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(body)
      });

      msg.innerHTML = `Job Posted! <a href="dashboard.html?jobId=${job.id}">Open dashboard</a>`;
      form.reset();
    } catch (err) {
      msg.textContent = err.message;
    }
  });
}
