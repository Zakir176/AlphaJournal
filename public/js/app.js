// Auto-date setup
const dateInput = document.getElementById("tradeDate");
if (dateInput) dateInput.valueAsDate = new Date();

// Theme toggle
const toggle = document.getElementById("themeToggle");
const userPref = localStorage.getItem("theme");

if (userPref) document.documentElement.setAttribute("data-theme", userPref);
else if (window.matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.setAttribute("data-theme", "dark");

if (toggle) {
  toggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
}

// Journal entries
const form = document.getElementById("entryForm");
const entries = document.getElementById("entries");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const date = dateInput.value;
    const pnl = parseFloat(document.getElementById("pnl").value);
    const notes = document.getElementById("notes").value;
    const imgFile = document.getElementById("imageUpload").files[0];

    const entry = document.createElement("div");
    entry.className = "entry";
    entry.style.borderColor = pnl >= 0 ? "var(--profit)" : "var(--loss)";
    entry.innerHTML = `
      <strong>${date}</strong> — <span style="color:${pnl >= 0 ? 'var(--profit)' : 'var(--loss)'}">${pnl >= 0 ? '+' : ''}${pnl}</span>
      <p>${notes}</p>
    `;

    if (imgFile) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(imgFile);
      entry.appendChild(img);
    }

    entries.prepend(entry);
    form.reset();
    dateInput.valueAsDate = new Date();
  });
}
