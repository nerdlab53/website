// Light / dark theme toggle, shared across pages. The pre-paint apply lives
// inline in each page's <head>; this only wires the button + persistence.
(function () {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    function cur() { return document.documentElement.getAttribute("data-theme") || "dark"; }
    function set(t) {
        document.documentElement.setAttribute("data-theme", t);
        try { localStorage.setItem("site-theme", t); } catch (e) {}
        btn.textContent = t === "light" ? "☀️" : "🌙";
        btn.setAttribute("aria-pressed", String(t === "light"));
    }
    set(cur());
    btn.addEventListener("click", function () { set(cur() === "light" ? "dark" : "light"); });
})();
