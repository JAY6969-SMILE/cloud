import { apiFetch, authHeaders } from "./app.js";

const form = document.getElementById("resumeForm");
const input = document.getElementById("resumeFile");
const msg = document.getElementById("resumeMsg");
const output = document.getElementById("resumeOutput");

function renderSkills(skillsText) {
  if (!skillsText) return '<span class="muted">No skills detected</span>';
  return skillsText
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .map((skill) => `<span class="skill-badge">${skill}</span>`)
    .join(" ");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = input.files[0];

  if (!file) {
    msg.textContent = "Please choose a PDF file.";
    return;
  }

  msg.textContent = "Parsing resume...";
  output.classList.add("hidden");

  try {
    const formData = new FormData();
    formData.append("resume", file);

    const data = await apiFetch("/resume/parse", {
      method: "POST",
      headers: { ...authHeaders() },
      body: formData
    });

    output.innerHTML = `
      <h2>Parsed Skills</h2>
      <div>${renderSkills(data.skills)}</div>
      <h2 style="margin-top: 1.5rem;">Extracted Text</h2>
      <pre class="resume-preview">${data.text || ""}</pre>
    `;
    output.classList.remove("hidden");
    msg.textContent = "Resume parsed successfully.";
  } catch (error) {
    console.error("Resume parse failed", error);
    msg.textContent = error.message || "Failed to parse resume.";
  }
});
