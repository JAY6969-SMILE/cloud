import { apiFetch, authHeaders, requireEmployer } from './app.js';

if (requireEmployer()) {
  const form = document.getElementById('postForm');
  const msg = document.getElementById('postMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = 'Posting...';

    try {
      const body = {
        title: document.getElementById('title').value.trim(),
        company: document.getElementById('company').value.trim(),
        location: document.getElementById('location').value.trim(),
        salary: Number(document.getElementById('salary').value),
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
