(() => {
  const apps = Array.isArray(window.SHILUVIP_APPS) ? window.SHILUVIP_APPS : [];
  const grid = document.getElementById("grid");
  const search = document.getElementById("search");
  const countText = document.getElementById("countText");
  const empty = document.getElementById("empty");
  const sort = document.getElementById("sort");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const pageInfo = document.getElementById("pageInfo");
  const chips = [...document.querySelectorAll(".chip")];

  let filter = "all", page = 1;
  const perPage = 24;

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));

  const formatSize = bytes => {
    const n = Number(bytes) || 0;
    if (!n) return "—";
    const units = ["B","KB","MB","GB"];
    let i = 0, v = n;
    while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
    return `${v.toFixed(i ? 1 : 0)} ${units[i]}`;
  };

  const isWarning = a => /❌|⚠️|❓/.test(a.description || "");

  function filtered() {
    const q = search.value.trim().toLowerCase();
    let arr = apps.filter(a => {
      const hay = `${a.name} ${a.developerName} ${a.bundleIdentifier}`.toLowerCase();
      const matchesQ = !q || hay.includes(q);
      const matchesF = filter === "all" || (filter === "warning" ? isWarning(a) : !isWarning(a));
      return matchesQ && matchesF;
    });

    if (sort.value === "date") arr.sort((a,b) => String(b.versionDate).localeCompare(String(a.versionDate)));
    else if (sort.value === "size") arr.sort((a,b) => (Number(b.size)||0) - (Number(a.size)||0));
    else arr.sort((a,b) => String(a.name).localeCompare(String(b.name), "en"));

    return arr;
  }

  function render() {
    const arr = filtered();
    const pages = Math.max(1, Math.ceil(arr.length / perPage));
    page = Math.min(page, pages);
    const start = (page - 1) * perPage;
    const items = arr.slice(start, start + perPage);

    countText.textContent = `${arr.length.toLocaleString("ar-IQ")} تطبيق`;
    pageInfo.textContent = `${page} / ${pages}`;
    prev.disabled = page <= 1;
    next.disabled = page >= pages;

    empty.hidden = arr.length !== 0;
    grid.innerHTML = items.map((a, i) => {
      const warning = isWarning(a);
      const desc = (a.description || "لا توجد معلومات إضافية.").replace(/\n/g, " ");
      const download = a.downloadURL || "#";
      const icon = a.iconURL || "";
      return `<article class="card">
        <div class="app-top">
          <img class="icon" src="${esc(icon)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
          <div class="app-title">
            <h3 title="${esc(a.name)}">${esc(a.name)}</h3>
            <p>${esc(a.developerName || "Unknown developer")}</p>
          </div>
        </div>
        <div class="meta">
          <span>v${esc(a.version || "—")}</span>
          <span>${esc(formatSize(a.size))}</span>
          ${warning ? '<span>⚠️ تحقق</span>' : '<span>✓ متاح</span>'}
        </div>
        <div class="desc">${esc(desc)}</div>
        <div class="card-actions">
          ${download !== "#" ? `<a class="download" href="${esc(download)}" target="_blank" rel="noopener">تنزيل IPA</a>` : '<span class="download">غير متاح</span>'}
          ${download !== "#" ? `<a class="source" href="${esc(download)}" target="_blank" rel="noopener">المصدر</a>` : ''}
        </div>
      </article>`;
    }).join("");
  }

  search.addEventListener("input", () => { page = 1; render(); });
  sort.addEventListener("change", () => { page = 1; render(); });
  chips.forEach(c => c.addEventListener("click", () => {
    chips.forEach(x => x.classList.remove("active"));
    c.classList.add("active");
    filter = c.dataset.filter;
    page = 1; render();
  }));
  prev.addEventListener("click", () => { if(page > 1){page--;render();window.scrollTo({top:420,behavior:"smooth"});} });
  next.addEventListener("click", () => { page++;render();window.scrollTo({top:420,behavior:"smooth"}); });

  render();
})();