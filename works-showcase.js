(() => {
  'use strict';
  const wall = document.querySelector('[data-works-wall]');
  const rail = document.querySelector('[data-works-rail]');
  if (!wall && !rail) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pause = wall?.querySelector('[data-works-pause]');
  let userPaused = false;
  pause?.addEventListener('click', () => {
    userPaused = !userPaused;
    wall.classList.toggle('works-wall-paused', userPaused);
    pause.setAttribute('aria-pressed', String(userPaused));
    pause.textContent = userPaused ? '继续滑动' : '暂停滑动';
  });
  // 只接受可公开访问的媒体地址；标题和分类一律作为文本插入。
  const mediaURL = value => {
    if (typeof value !== 'string' || !value.trim()) return '';
    try { const url = new URL(value, document.baseURI); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
  };
  const cleanItem = item => ({
    id: String(item?.id || ''), title: String(item?.title || '未命名作品'),
    poster: mediaURL(item?.poster), video: mediaURL(item?.video), kind: String(item?.kind || '')
  });
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const renderWall = items => {
    if (!wall) return;
    const message = wall.querySelector('[data-works-wall-message]');
    if (!items.length) { message.textContent = '作品陆续上线，敬请期待。'; return; }
    message.textContent = '观看完整作品，了解每一帧的创作。';
    const rows = wall.querySelectorAll('.works-wall-row');
    rows.forEach((row, rowIndex) => {
      const source = items.filter(item => item.poster);
      if (!source.length) return;
      const set = element('div', 'works-wall-set');
      const count = Math.max(10, Math.min(source.length, 18));
      for (let i = 0; i < count; i++) {
        const item = source[(i + rowIndex * 3) % source.length];
        const tile = element('div', 'works-wall-poster');
        const img = element('img'); img.src = item.poster; img.alt = ''; img.loading = 'lazy';
        img.addEventListener('error', () => { img.remove(); tile.classList.add('works-wall-poster--placeholder'); tile.append(element('small', '', '作品展示位置')); }, { once: true });
        tile.append(img); set.append(tile);
      }
      row.replaceChildren(set, set.cloneNode(true));
    });
  };
  const dialog = document.getElementById('works-media-dialog');
  const mediaStage = dialog?.querySelector('[data-works-media-stage]');
  const mediaStatus = dialog?.querySelector('[data-works-media-status]');
  let returnFocus = null;
  let previousOverflow = '';
  const openWork = (item, trigger) => {
    if (!dialog) return;
    returnFocus = trigger;
    previousOverflow = document.body.style.overflow;
    document.getElementById('works-media-title').textContent = item.title;
    mediaStage.replaceChildren(); mediaStatus.hidden = true;
    let media;
    if (item.video) {
      media = element('video'); media.controls = true; media.playsInline = true;
      media.preload = 'metadata'; media.src = item.video;
      if (item.poster) media.poster = item.poster;
      media.setAttribute('aria-label', item.title);
    } else {
      media = element('img'); media.src = item.poster; media.alt = item.title;
    }
    media.addEventListener('error', () => {
      mediaStatus.textContent = '作品暂时无法加载，请关闭后重试。'; mediaStatus.hidden = false;
    }, { once: true });
    mediaStage.append(media);
    dialog.showModal(); document.body.style.overflow = 'hidden';
    if (item.video) media.play().catch(() => { /* 若浏览器阻止自动开始，保留原生播放按钮。 */ });
  };
  if (dialog) {
    dialog.querySelector('[data-works-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      const video = mediaStage.querySelector('video');
      if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
      mediaStage.replaceChildren(); document.body.style.overflow = previousOverflow;
      returnFocus?.focus({ preventScroll: true });
    });
  }
  const controls = document.querySelector('[data-works-controls]');
  const previous = document.querySelector('[data-works-previous]');
  const next = document.querySelector('[data-works-next]');
  const loading = document.querySelector('[data-works-loading]');
  const empty = document.querySelector('[data-works-empty]');
  const error = document.querySelector('[data-works-error]');
  const hint = document.querySelector('[data-works-hint]');
  const updateControls = () => {
    if (!rail || !previous || !next) return;
    const end = Math.max(0, rail.scrollWidth - rail.clientWidth);
    previous.disabled = rail.scrollLeft <= 2;
    next.disabled = rail.scrollLeft >= end - 2;
    controls.hidden = end <= 2;
    if (hint) hint.hidden = end <= 2;
  };
  const scrollWorks = direction => {
    if (!rail) return;
    const amount = rail.querySelector('.works-card')?.getBoundingClientRect().width || rail.clientWidth * .8;
    const gap = parseFloat(getComputedStyle(rail).gap) || 0;
    rail.scrollBy({ left: direction * (amount + gap), behavior: reduceMotion.matches ? 'instant' : 'smooth' });
  };
  previous?.addEventListener('click', () => scrollWorks(-1));
  next?.addEventListener('click', () => scrollWorks(1));
  rail?.addEventListener('scroll', updateControls, { passive: true });
  rail?.addEventListener('keydown', event => {
    if (event.target !== rail || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); scrollWorks(event.key === 'ArrowLeft' ? -1 : 1);
  });
  if (rail && 'ResizeObserver' in window) new ResizeObserver(updateControls).observe(rail);
  else window.addEventListener('resize', updateControls);
  const renderGallery = items => {
    if (!rail) return;
    rail.replaceChildren();
    items.forEach(item => {
      const article = element('article', 'works-card');
      const button = element('button', 'works-card-button'); button.type = 'button';
      button.setAttribute('aria-label', `${item.video ? '播放' : '查看'}作品：${item.title}`);
      const cover = element('span', 'works-card-cover');
      if (item.poster) {
        const image = element('img'); image.src = item.poster; image.alt = ''; image.loading = 'lazy';
        image.addEventListener('error', () => { image.remove(); cover.prepend(element('span', 'works-card-fallback', item.video ? '点击播放作品' : '封面暂时无法加载')); }, { once: true });
        cover.append(image);
      } else cover.append(element('span', 'works-card-fallback', '点击播放作品'));
      if (item.video) { const play = element('span', 'works-card-play', '▶'); play.setAttribute('aria-hidden', 'true'); cover.append(play); }
      button.append(cover, element('span', 'works-card-title', item.title), element('span', 'works-card-meta', item.video ? '视频作品' : '图片作品'));
      button.addEventListener('click', () => openWork(item, button));
      article.append(button); rail.append(article);
    });
    rail.hidden = !items.length; empty.hidden = Boolean(items.length); error.hidden = true;
    rail.scrollLeft = 0; requestAnimationFrame(updateControls);
  };
  let isLoading = false;
  const loadWorks = async () => {
    if (isLoading) return;
    isLoading = true;
    if (loading) loading.hidden = false;
    if (error) error.hidden = true;
    if (empty) empty.hidden = true;
    try {
      if (!window.WantuoWorks?.load) throw new Error('作品数据暂不可用');
      const result = await window.WantuoWorks.load();
      if (result?.error && !result?.items?.length) throw new Error('作品读取失败');
      const items = (Array.isArray(result?.items) ? result.items : []).map(cleanItem).filter(item => item.poster || item.video);
      renderWall(items); renderGallery(items);
    } catch {
      if (wall) wall.querySelector('[data-works-wall-message]').textContent = '作品暂时无法加载，可进入作品页重试。';
      if (error) error.hidden = false;
      if (rail) rail.hidden = true;
      if (controls) controls.hidden = true;
      if (hint) hint.hidden = true;
    } finally { if (loading) loading.hidden = true; isLoading = false; }
  };
  document.querySelector('[data-works-retry]')?.addEventListener('click', loadWorks);
  loadWorks();
})();
