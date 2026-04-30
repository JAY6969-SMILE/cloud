import { apiFetch, authHeaders, getRole, getToken } from "./app.js";

const params = new URLSearchParams(location.search);
const jobId = params.get("id");
const detail = document.getElementById("jobDetail");
const applySection = document.getElementById("applySection");
const dropZone = document.getElementById("dropZone");
const input = document.getElementById("resumeInput");
const fileName = document.getElementById("fileName");
const applyBtn = document.getElementById("applyBtn");
const applyMsg = document.getElementById("applyMsg");
const applyResult = document.getElementById("applyResult");

let selectedFile = null;

function formatSalary(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return number.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function skillsBadges(skillsText) {
  if (!skillsText) return '<span class="muted">No parsed skills</span>';
  return skillsText
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `<span class="skill-badge">${s}</span>`)
    .join("");
}

async function loadJob() {
  if (!jobId) {
    detail.innerHTML = '<p class="muted">Job id missing.</p>';
    return;
  }

  try {
    const job = await apiFetch(`/jobs/${jobId}`);
    detail.innerHTML = `
      <h1 class="page-title">${job.title}</h1>
      <p class="muted">${job.company}</p>
      <p>${job.location}</p>
      <p><strong>Salary:</strong> ${formatSalary(job.salary)}</p>
      <p>${job.description || ""}</p>
    `;

    const canApply = getToken() && getRole() === "JOBSEEKER";
    applySection.classList.toggle("hidden", !canApply);
  } catch (err) {
    detail.innerHTML = `<p class="muted">${err.message}</p>`;
  }
}

function bindDropZone() {
  dropZone.addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    selectedFile = input.files[0];
    fileName.textContent = selectedFile ? selectedFile.name : "";
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add("drag");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.remove("drag");
    });
  });

  dropZone.addEventListener("drop", (e) => {
    const files = e.dataTransfer.files;
    if (files.length) {
      selectedFile = files[0];
      fileName.textContent = selectedFile.name;
    }
  });
}

applyBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    applyMsg.textContent = "Please choose a PDF file.";
    return;
  }

  applyMsg.textContent = "Submitting...";
  try {
    const form = new FormData();
    form.append("resume", selectedFile);
    const data = await apiFetch(`/jobs/${jobId}/apply`, {
      method: "POST",
      headers: { ...authHeaders() },
      body: form
    });

    applyMsg.textContent = "Application submitted.";
    applyResult.innerHTML = `
      <p><span class="status-pill">${data.status || "APPLIED"}</span></p>
      <div>${skillsBadges(data.skills)}</div>
    `;
  } catch (err) {
    applyMsg.textContent = err.message;
  }
});

loadJob();
bindDropZone();
