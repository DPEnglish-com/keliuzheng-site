/* =========================================================================
   课蒸馏 官网 · 交互
   与外在 / WorkoutLoop / 问辩几站同一套写法：每次动效都要能一句话说明理由，
   全部一次性、不循环。无滚动劫持、无循环动画、无视差。零依赖。

   与那几站刻意少的两样，因为 INK 卷不允许：
   · 没有位移式入场——INK 明写「页面切换不做位移」，这里只做淡入；
   · 没有工序「当前步」跟随——那是 App 里的状态，宣传页上滚动到哪一步
     不构成信息，只会多烧一处朱砂。
   ========================================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 阅读进度：墨线延伸（焦墨 2px，从左侧生长） ---- */
  function makeReadProgress() {
    if (reduceMotion) return null;

    var bar = document.createElement("div");
    bar.className = "read-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    return function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var ratio = max > 0 ? Math.min(doc.scrollTop / max, 1) : 0;
      bar.style.transform = "scaleX(" + ratio + ")";
    };
  }

  /* ---- 页头：滚起来之后加一条结构线 ---- */
  function makeHeaderState() {
    var header = document.getElementById("site-header");
    if (!header) return null;
    return function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
  }

  /* ---- 导航：当前在哪个区块（当前＝朱砂，INK 铁律 1 的第二个角色） ---- */
  function makeNavSpy() {
    var nav = document.getElementById("site-nav");
    if (!nav) return null;

    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var pairs = links.map(function (a) {
      var section = document.getElementById(a.getAttribute("href").slice(1));
      return section ? { link: a, section: section } : null;
    }).filter(Boolean);
    if (!pairs.length) return null;

    var current = null;

    return function () {
      var line = window.scrollY + window.innerHeight * 0.34;
      var active = null;
      for (var i = 0; i < pairs.length; i++) {
        if (pairs[i].section.offsetTop <= line) active = pairs[i];
      }
      if (active === current) return;
      if (current) {
        current.link.classList.remove("is-active");
        current.link.removeAttribute("aria-current");
      }
      current = active;
      if (current) {
        current.link.classList.add("is-active");
        current.link.setAttribute("aria-current", "true");
      }
    };
  }

  /* ---- 入场揭示：淡入，每个元素只揭示一次 ---- */
  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.filter(function (e) { return e.isIntersecting; })
        .forEach(function (entry) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    Array.prototype.forEach.call(items, function (el) { observer.observe(el); });

    /* 安全网：观察器在某些环境可能始终不报告可见，元素就会一直停在
       opacity:0。只放行「此刻已经在视口内、却仍没被揭示」的元素，
       不无差别放行，否则滚动揭示等于没有。 */
    window.setTimeout(function () {
      var vh = window.innerHeight || 0;
      var degenerate = vh < 200;
      Array.prototype.forEach.call(items, function (el) {
        if (el.classList.contains("is-visible")) return;
        var r = el.getBoundingClientRect();
        if (degenerate || (r.top < vh && r.bottom > 0)) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      });
    }, 1200);
  }

  /* ---- 截图解码失败兜底：宁可留白，也不要一个碎图框 ---- */
  function initShotFallback() {
    Array.prototype.forEach.call(document.querySelectorAll(".shot img"), function (img) {
      img.addEventListener("error", function () {
        var fig = img.closest(".shot");
        if (fig) fig.classList.add("is-broken");
      });
    });
  }

  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function init() {
    var updaters = [makeReadProgress(), makeHeaderState(), makeNavSpy()].filter(Boolean);

    if (updaters.length) {
      var ticking = false;
      function run() {
        updaters.forEach(function (fn) { fn(); });
        ticking = false;
      }
      function onScroll() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(run);
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      run();
    }

    initReveal();
    initShotFallback();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
