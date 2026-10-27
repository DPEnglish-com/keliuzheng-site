// 课蒸馏官网：主题、阅读进度、流程演示。无依赖、无外部请求。
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 主题 ---------- */
  var themeBtn = document.getElementById('theme-toggle');

  function syncTheme() {
    var dark = root.getAttribute('data-theme') === 'dark';
    if (themeBtn) {
      themeBtn.textContent = dark ? '日读' : '夜读';
      themeBtn.setAttribute('aria-label', dark ? '切换为日读主题' : '切换为夜读主题');
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0C0C0C' : '#F4F1EA');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('keliuzheng-theme', next); } catch (e) {}
      syncTheme();
    });
  }
  syncTheme();

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- 滚动：进度、顶栏、导航 ---------- */
  var fill = document.getElementById('read-progress-fill');
  var head = document.getElementById('site-head');
  var flow = document.getElementById('flow');
  var download = document.getElementById('download');
  var navLinks = [].slice.call(document.querySelectorAll('[data-nav]'));
  var ticking = false;

  function topOf(el) {
    return el ? el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) : 0;
  }

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (fill) fill.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    if (head) head.classList.toggle('is-scrolled', y > 6);

    var marker = y + 220;
    var active = null;
    if (download && marker >= topOf(download)) active = 'download';
    else if (flow && marker >= topOf(flow)) active = 'flow';
    navLinks.forEach(function (a) {
      var on = a.getAttribute('data-nav') === active;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });

  }

  function requestScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { onScroll(); ticking = false; });
  }
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll, { passive: true });
  onScroll();

  /* ---------- 流程演示 ---------- */
  var demo = document.getElementById('demo');
  if (!demo) return;

  var panels = [].slice.call(demo.querySelectorAll('.panel'));
  var stepLabels = [].slice.call(demo.querySelectorAll('[data-step-label]'));
  var form = document.getElementById('link-form');
  var input = document.getElementById('course-url');
  var field = document.getElementById('url-field');
  var prefix = field ? field.querySelector('.field-prefix') : null;
  var prefixLabel = prefix ? prefix.textContent : '';
  var hint = document.getElementById('url-hint');
  var parseBtn = document.getElementById('parse-btn');
  var boxes = [].slice.call(demo.querySelectorAll('.episode input'));
  var toggleAll = document.getElementById('toggle-all');
  var startBtn = document.getElementById('start-btn');
  var selCount = document.getElementById('sel-count');
  var back1 = document.getElementById('back-1');
  var jobs = document.getElementById('jobs');
  var progress = document.getElementById('distill-progress');
  var progressFill = document.getElementById('distill-fill');
  var percent = document.getElementById('distill-percent');
  var skipBtn = document.getElementById('skip-btn');
  var readBtn = document.getElementById('read-btn');
  var live = document.getElementById('distill-live');
  var restart = document.getElementById('restart');
  var tabs = [].slice.call(demo.querySelectorAll('[role="tab"]'));
  var panes = [].slice.call(demo.querySelectorAll('[role="tabpanel"]'));
  var stamps = [].slice.call(demo.querySelectorAll('.stamp'));
  var readerPick = document.getElementById('reader-pick');
  var readerSelect = document.getElementById('reader-episode');
  var readerMeta = document.getElementById('reader-meta');
  var readerTitle = document.getElementById('panel-4-title');
  var hintDefault = hint ? hint.textContent : '';
  var initialUrl = input ? input.value : '';
  var timers = [];
  var parseTimer = null;
  var parseToken = 0;
  var current = [];
  var readingIds = [];
  var readerIndex = 0;
  var run = 0;

  /* 示例讲次与六栏内容；原文均为示例文本。 */
  var lessons = {
    '1': {
      no: '1',
      title: '向量与线性空间',
      duration: '18:42',
      notes: [
        {
          text: '向量空间是带有加法和数乘的集合；零向量、负向量都由公理保证。',
          time: '01:08',
          quote: '先确认加法和数乘是否封闭，再谈基与维数。'
        },
        {
          text: '一组向量张成空间的维数，不超过这组向量的个数。',
          formula: 'dim span(v₁,…,vₖ) ≤ k，等号当且仅当它们线性无关。',
          time: '04:26',
          quote: '个数是上限；能不能取满，要看有没有多余的向量。'
        },
        {
          text: '判断线性相关，设 c₁v₁+…+cₖvₖ=0，化成齐次方程组看有没有非零解。',
          time: '08:10',
          quote: '把能不能配出零写成一个方程组，问题就落地了。'
        },
        {
          text: '在 R³ 中，v₁=(1,0,0)，v₂=(0,1,0)，v₃=(1,1,0)。因为 v₃=v₁+v₂，这组向量的秩是 2。',
          time: '11:32',
          quote: '先找关系式，再把多余的那个划掉。'
        },
        {
          text: '张成空间的维数小于向量个数，只说明这组向量线性相关；不能反过来说向量越多维数越高。',
          time: '14:05',
          quote: '维数看的是张成空间，不是向量清单有多长。'
        },
        {
          text: '先判线性相关，再取极大无关组；基和维数一起写，步骤才完整。',
          time: '16:20',
          quote: '相关、极大无关组、基，这三步别跳。'
        }
      ]
    },
    '2': {
      no: '2',
      title: '矩阵与线性变换',
      duration: '24:16',
      notes: [
        {
          text: '矩阵是线性变换在选定基下的表示；换一组基，矩阵会变。',
          time: '01:24',
          quote: '先看变换把基送到哪里，矩阵只是结果的记录。'
        },
        {
          text: '矩阵乘法对应变换的复合，读顺序从右往左。',
          formula: '(AB)x = A(Bx)',
          time: '05:02',
          quote: '复合的顺序从右往左读，别把 AB 当成 BA。'
        },
        {
          text: '逐个把基向量作用后的像写成基坐标，再按列排成矩阵。',
          time: '09:18',
          quote: '每一个基向量都要落到坐标，少一个列就写错了。'
        },
        {
          text: '把平面逆时针旋转 90° 的矩阵是 [[0,−1],[1,0]]，它把 (1,0) 送到 (0,1)。',
          time: '13:40',
          quote: '旋转九十度，横轴会转到纵轴，矩阵就跟着出来。'
        },
        {
          text: '矩阵乘法一般不满足交换律；AB 和 BA 代表不同顺序的复合。',
          time: '18:06',
          quote: '能交换是特例；大多数矩阵乘起来顺序一换就变。'
        },
        {
          text: '先确认基和坐标，再写变换矩阵；题目没给基时，通常默认 Rⁿ 的标准基。',
          time: '21:35',
          quote: '题目没给基，就按标准基来；给了基，先把坐标写清。'
        }
      ]
    },
    '3': {
      no: '3',
      title: '秩与解的结构',
      duration: '21:08',
      notes: [
        {
          text: '秩是行空间的维数，也等于列空间的维数；它衡量矩阵独立信息的多少。',
          time: '00:42',
          quote: '行秩和列秩相等，这是结论；先抓住行空间，秩就有定义了。'
        },
        {
          text: 'A 有 n 列时，r(A) + dim N(A) = n。列满秩只保证“有解时唯一”，不是无条件有唯一解。',
          formula: 'r(A) + dim N(A) = n',
          time: '04:18',
          quote: '先看列数，再看秩。解的自由度，就是列数减秩。'
        },
        {
          text: '初等行变换不改变行空间；化成行阶梯形后，非零行的数量就是秩。',
          time: '07:05',
          quote: '行变换只是在换一组基，空间本身没动，所以秩不会变。'
        },
        {
          text: 'A 是 3×5 矩阵且 r(A)=3 时，dim N(A)=5−3=2。减的是列数，不是行数。',
          time: '12:04',
          quote: '我不急着解方程，先把秩数出来，后面就只剩写参数。'
        },
        {
          text: 'r(A+B) ≤ r(A)+r(B)，等号只是特例；r(AB) ≤ min{r(A), r(B)}。',
          time: '16:37',
          quote: 'rank(A+B) 最多是两者之和，等号成立是特例，不是规律。'
        },
        {
          text: '非齐次方程 Ax=b 有解，当且仅当 r(A)=r([A|b])；有解时自由度是 n−r(A)。',
          time: '18:32',
          quote: '参数题不是难题，它只是把秩的讨论拆成了几种情况。'
        }
      ]
    },
    '4': {
      no: '4',
      title: '特征值与特征向量',
      duration: '27:35',
      notes: [
        {
          text: '若 Ax=λx 且 x≠0，λ 是 A 的特征值，x 是对应的特征向量。',
          time: '01:16',
          quote: '先看方向有没有变，长度可以变，方向不能乱。'
        },
        {
          text: '特征值是特征方程 det(λI−A)=0 的根。',
          formula: 'det(λI − A) = 0',
          time: '06:04',
          quote: '把特征值当成未知数，行列式等于零就是入口。'
        },
        {
          text: '把 Ax=λx 移项成 (λI−A)x=0；要有非零解，λI−A 必须不可逆。',
          time: '10:22',
          quote: '要非零解，矩阵就得不可逆，这一步和秩是通的。'
        },
        {
          text: '对角矩阵 [[2,0],[0,3]] 的特征值是 2 和 3，标准基向量就是对应的特征向量。',
          time: '15:48',
          quote: '对角矩阵最省事，特征值直接写在主对角线上。'
        },
        {
          text: '零向量不能作特征向量；同一特征值可以有多个线性无关的特征向量。',
          time: '20:10',
          quote: '零向量永远不算；重根还要再数一次特征向量。'
        },
        {
          text: '先解特征方程，再把特征值代回求特征向量；重根时还要看特征空间的维数。',
          time: '24:26',
          quote: '先求值，再求向量，最后看能不能对角化。'
        }
      ]
    }
  };

  function setStep(n, scroll) {
    demo.setAttribute('data-step', String(n));
    panels.forEach(function (p) {
      p.hidden = Number(p.getAttribute('data-panel')) !== n;
    });
    stepLabels.forEach(function (li, i) {
      var idx = i + 1;
      li.classList.toggle('is-current', idx === n);
      li.classList.toggle('is-done', idx < n);
      if (idx === n) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    var panel = panels[n - 1];
    if (panel) {
      var title = panel.querySelector('h3');
      if (title) title.focus({ preventScroll: true });
    }
    if (scroll) {
      window.requestAnimationFrame(function () {
        var r = demo.getBoundingClientRect();
        if (r.top < 70 || r.bottom > window.innerHeight) {
          demo.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
      });
    }
  }

  function clearTimers() {
    timers.forEach(function (t) { window.clearTimeout(t); });
    timers = [];
  }

  function clearNode(el) {
    while (el && el.firstChild) el.removeChild(el.firstChild);
  }

  function clearParseTimer() {
    if (parseTimer) {
      window.clearTimeout(parseTimer);
      parseTimer = null;
    }
    parseToken += 1;
  }

  function setError(message) {
    if (field) field.classList.add('has-error');
    if (hint) {
      hint.classList.add('is-error');
      hint.textContent = message;
    }
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.focus();
    }
  }

  function clearError() {
    if (field) field.classList.remove('has-error');
    if (hint) {
      hint.classList.remove('is-error');
      hint.textContent = hintDefault;
    }
    if (input) input.removeAttribute('aria-invalid');
  }

  function syncPrefix() {
    if (!prefix || !input) return;
    prefix.textContent = /^[a-z][a-z0-9+.-]*:/i.test(input.value.trim()) ? '' : prefixLabel;
  }

  function validateCourseUrl(raw) {
    var value = raw.trim();
    if (!value) return { ok: false, message: '先贴一条课程链接。' };
    if (/\s/.test(value)) return { ok: false, message: '链接里不要带空格。' };
    var scheme = value.match(/^([a-z][a-z0-9+.-]*):/i);
    if (scheme && !/^https?$/i.test(scheme[1])) {
      return { ok: false, message: '只支持 http:// 或 https:// 链接。' };
    }
    if (scheme && !/^https?:\/\//i.test(value)) {
      return { ok: false, message: '链接格式不对，检查一下。' };
    }
    var candidate = scheme ? value : 'https://' + value;
    var parsed;
    try {
      parsed = new URL(candidate);
    } catch (e) {
      return { ok: false, message: '链接格式不对，检查一下。' };
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { ok: false, message: '只支持 http:// 或 https:// 链接。' };
    }
    var host = parsed.hostname;
    if (!host || host.indexOf('.') === -1 || host.charAt(0) === '.' || host.charAt(host.length - 1) === '.') {
      return { ok: false, message: '链接里缺少完整的域名。' };
    }
    return { ok: true };
  }

  input.addEventListener('input', function () {
    clearError();
    syncPrefix();
  });
  syncPrefix();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (parseBtn.disabled) return;
    var result = validateCourseUrl(input.value);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    clearError();
    syncPrefix();
    parseBtn.disabled = true;
    parseBtn.textContent = '准备示例…';
    clearParseTimer();
    var token = parseToken;
    parseTimer = window.setTimeout(function () {
      if (token !== parseToken) return;
      parseTimer = null;
      parseBtn.disabled = false;
      parseBtn.textContent = '走一遍示例';
      syncSelection();
      setStep(2, true);
    }, 520);
  });

  function syncSelection() {
    var n = boxes.filter(function (b) { return b.checked; }).length;
    selCount.textContent = n ? '已选 ' + n + ' 讲' : '至少选一讲';
    startBtn.disabled = n === 0;
    toggleAll.textContent = n === boxes.length ? '取消全选' : '全选';
  }

  boxes.forEach(function (b) { b.addEventListener('change', syncSelection); });
  syncSelection();

  toggleAll.addEventListener('click', function () {
    var all = boxes.every(function (b) { return b.checked; });
    boxes.forEach(function (b) { b.checked = !all; });
    syncSelection();
  });

  back1.addEventListener('click', function () { setStep(1, true); });

  function setProgress(p) {
    p = Math.max(0, Math.min(100, p));
    progressFill.style.transform = 'scaleX(' + (p / 100) + ')';
    percent.textContent = Math.round(p) + '%';
    progress.setAttribute('aria-valuenow', String(Math.round(p)));
  }

  function jobRow(name) {
    var li = document.createElement('li');
    var nameEl = document.createElement('span');
    nameEl.className = 'job-name';
    nameEl.textContent = name;
    var status = document.createElement('span');
    status.className = 'job-status mono';
    status.textContent = '排队中';
    li.appendChild(nameEl);
    li.appendChild(status);
    jobs.appendChild(li);
    return li;
  }

  function setJob(i, text, state) {
    var li = jobs.children[i];
    if (!li) return;
    li.classList.remove('is-running', 'is-done');
    if (state) li.classList.add(state);
    li.querySelector('.job-status').textContent = text;
  }

  function finish(n) {
    clearTimers();
    setProgress(100);
    for (var i = 0; i < jobs.children.length; i++) setJob(i, '已就绪', 'is-done');
    skipBtn.hidden = true;
    readBtn.hidden = false;
    live.textContent = n + ' 讲已就绪。';
  }

  function distill(ids) {
    clearTimers();
    run += 1;
    var token = run;
    current = ids.slice();
    clearNode(jobs);
    ids.forEach(function (id) { jobRow(lessons[id].title); });
    skipBtn.hidden = false;
    readBtn.hidden = true;
    setProgress(0);
    live.textContent = '正在蒸馏 ' + ids.length + ' 讲。演示已加速。';

    ids.forEach(function (id, i) {
      var start = i * 700;
      timers.push(window.setTimeout(function () {
        if (token !== run) return;
        setJob(i, '转写中', 'is-running');
        setProgress((i / ids.length) * 100);
      }, start));
      timers.push(window.setTimeout(function () {
        if (token !== run) return;
        setJob(i, '整理六栏', 'is-running');
        setProgress(((i + 0.5) / ids.length) * 100);
      }, start + 320));
      timers.push(window.setTimeout(function () {
        if (token !== run) return;
        setJob(i, '已就绪', 'is-done');
        setProgress(((i + 1) / ids.length) * 100);
        if (i === ids.length - 1) finish(ids.length);
      }, start + 640));
    });
  }

  startBtn.addEventListener('click', function () {
    if (startBtn.disabled) return;
    var ids = boxes.filter(function (b) { return b.checked; }).map(function (b) {
      return b.value;
    }).filter(function (id) { return !!lessons[id]; });
    if (!ids.length) return;
    readingIds = ids;
    readerIndex = 0;
    setStep(3, true);
    distill(ids);
  });

  skipBtn.addEventListener('click', function () {
    if (demo.getAttribute('data-step') !== '3') return;
    run += 1;
    clearTimers();
    finish(current.length);
    live.textContent = '已跳过演示，' + current.length + ' 讲已就绪。';
    openReader();
  });

  readBtn.addEventListener('click', function () {
    if (demo.getAttribute('data-step') !== '3') return;
    openReader();
  });

  /* 六栏切换 */
  function activateTab(index, focusTab) {
    if (index < 0 || index >= tabs.length) index = 0;
    tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      tab.classList.toggle('is-active', on);
    });
    panes.forEach(function (pane, i) { pane.hidden = i !== index; });
    if (focusTab && tabs[index]) tabs[index].focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { activateTab(i, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next !== null) {
        e.preventDefault();
        activateTab(next, true);
      }
    });
  });

  /* 时间码示例原文 */
  function closeQuotes() {
    stamps.forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
      var quote = document.getElementById(btn.getAttribute('aria-controls'));
      if (quote) quote.hidden = true;
    });
  }

  stamps.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wasOpen = btn.getAttribute('aria-expanded') === 'true';
      closeQuotes();
      if (wasOpen) return;
      btn.setAttribute('aria-expanded', 'true');
      var quote = document.getElementById(btn.getAttribute('aria-controls'));
      if (quote) quote.hidden = false;
    });
  });

  function renderReader(id) {
    var lesson = lessons[id];
    if (!lesson) return;
    closeQuotes();
    if (readerTitle) readerTitle.textContent = lesson.title;
    if (readerMeta) readerMeta.textContent = '第 ' + lesson.no + ' 讲 · ' + lesson.duration;
    lesson.notes.forEach(function (note, i) {
      var pane = panes[i];
      if (!pane) return;
      var stamp = pane.querySelector('.stamp');
      var quote = pane.querySelector('.quote');
      clearNode(pane);
      var body = document.createElement('p');
      body.textContent = note.text;
      pane.appendChild(body);
      if (note.formula) {
        var formula = document.createElement('p');
        formula.className = 'formula mono';
        formula.textContent = note.formula;
        pane.appendChild(formula);
      }
      if (stamp) {
        stamp.textContent = note.time + ' · 示例原文';
        stamp.setAttribute('aria-expanded', 'false');
        pane.appendChild(stamp);
      }
      if (quote) {
        quote.textContent = '“' + note.quote + '”';
        quote.hidden = true;
        pane.appendChild(quote);
      }
    });
  }

  function syncReaderPick() {
    if (!readerPick || !readerMeta) return;
    if (readingIds.length > 1) {
      readerPick.hidden = false;
      readerMeta.hidden = true;
    } else {
      readerPick.hidden = true;
      readerMeta.hidden = false;
    }
  }

  function openReader() {
    if (!readingIds.length) return;
    readerIndex = 0;
    if (readerSelect) {
      clearNode(readerSelect);
      readingIds.forEach(function (id) {
        var lesson = lessons[id];
        var option = document.createElement('option');
        option.value = id;
        option.textContent = '第 ' + lesson.no + ' 讲 · ' + lesson.title;
        readerSelect.appendChild(option);
      });
      readerSelect.value = readingIds[0];
    }
    syncReaderPick();
    activateTab(0, false);
    renderReader(readingIds[0]);
    setStep(4, true);
  }

  if (readerSelect) {
    readerSelect.addEventListener('change', function () {
      if (!readingIds.length) return;
      var next = readingIds.indexOf(readerSelect.value);
      if (next === -1) {
        next = 0;
        readerSelect.value = readingIds[0];
      }
      readerIndex = next;
      renderReader(readingIds[readerIndex]);
    });
  }

  /* 重来 */
  restart.addEventListener('click', function () {
    run += 1;
    clearTimers();
    clearParseTimer();
    current = [];
    readingIds = [];
    readerIndex = 0;
    input.value = initialUrl;
    syncPrefix();
    clearError();
    boxes.forEach(function (b) { b.checked = true; });
    syncSelection();
    clearNode(jobs);
    setProgress(0);
    skipBtn.hidden = false;
    readBtn.hidden = true;
    parseBtn.disabled = false;
    parseBtn.textContent = '走一遍示例';
    live.textContent = '演示已加速。';
    if (readerSelect) clearNode(readerSelect);
    if (readerPick) readerPick.hidden = true;
    if (readerMeta) readerMeta.hidden = false;
    renderReader('3');
    activateTab(0, false);
    closeQuotes();
    setStep(1, true);
  });

  /* ---------- 复制校验值 ---------- */
  var copyBtn = document.getElementById('copy-sha');
  var sha = document.getElementById('sha');
  var toastEl = document.getElementById('toast');
  var toastTimer = null;

  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-on');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200);
  }

  function legacyCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  if (copyBtn && sha) {
    copyBtn.addEventListener('click', function () {
      var text = sha.textContent.trim();
      function fail() { toast('复制失败，请手动选择校验值'); }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () {
          toast('SHA-256 已复制');
        }, function () {
          if (legacyCopy(text)) toast('SHA-256 已复制');
          else fail();
        });
      } else if (legacyCopy(text)) {
        toast('SHA-256 已复制');
      } else {
        fail();
      }
    });
  }
})();
