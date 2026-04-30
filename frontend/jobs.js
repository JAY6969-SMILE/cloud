import { apiFetch, getToken, clearSession } from "./app.js";

const jobsGrid = document.getElementById("jobsGrid");
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
  clearSession();
  location.href = "auth.html";
});

function formatSalary(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return number.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function cardHtml(job) {
  const loginHint = getToken() ? "" : '<p class="muted">Login to Apply</p>';
  return `
    <article class="card job-card" data-id="${job.id}">
      <h3>${job.title}</h3>
      <p class="muted">${job.company}</p>
      <p>${job.location}</p>
      <p><strong>${formatSalary(job.salary)}</strong></p>
      ${loginHint}
    </article>
  `;
}

async function loadJobs() {
  try {
    const jobs = await apiFetch("/jobs");
    jobsGrid.innerHTML = "";
    if (!Array.isArray(jobs) || jobs.length === 0) {
      jobsGrid.innerHTML = '<p class="muted">No jobs found.</p>';
      return;
    }

    jobsGrid.innerHTML = jobs.map(cardHtml).join("");
    jobsGrid.querySelectorAll(".job-card").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-id");
        location.href = `job-detail.html?id=${id}`;
      });
    });
  } catch (err) {
    jobsGrid.innerHTML = `<p class="muted">${err.message}</p>`;
  }
}

loadJobs();
