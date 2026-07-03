// Reading modal for the blogs page. Read More opens the full article in an
// iframe overlay so the blogs page itself never unloads — its scroll position
// is preserved for free. Back button / Esc / backdrop all close it.
(function () {
    var reader = document.getElementById("reader");
    if (!reader) return;
    var frame = document.getElementById("reader-frame");
    var titleEl = document.getElementById("reader-title");
    var scrollY = 0;

    function open(url, title) {
        scrollY = window.scrollY;
        frame.src = url;
        titleEl.textContent = title || "";
        reader.classList.add("open");
        document.body.style.overflow = "hidden";
        if (location.hash !== "#read") history.pushState({ reader: true }, "", "#read");
    }

    function close(fromPop) {
        if (!reader.classList.contains("open")) return;
        reader.classList.remove("open");
        frame.src = "about:blank";
        document.body.style.overflow = "";
        if (!fromPop && location.hash === "#read") history.back();
    }

    document.querySelectorAll("[data-post]").forEach(function (el) {
        el.addEventListener("click", function (e) {
            e.preventDefault();
            open(el.getAttribute("data-post"), el.getAttribute("data-title"));
        });
    });

    document.getElementById("reader-close").addEventListener("click", function () { close(false); });
    reader.querySelector(".reader-backdrop").addEventListener("click", function () { close(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(false); });
    window.addEventListener("popstate", function () { close(true); });

    // Deep link: /posts.html#read does nothing without a target, so ignore.
})();
