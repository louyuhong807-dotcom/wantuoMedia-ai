(() => {
  'use strict';

  const script = document.currentScript;
  const baseURL = new URL('.', script && script.src ? script.src : window.location.href);
  const localHost = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(window.location.hostname);
  const imageTypes = ['webp', 'jpg', 'jpeg', 'png'];
  const videoTypes = ['mp4', 'webm'];
  const allowedTypes = [...imageTypes, ...videoTypes];
  const collator = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' });
  let activeLoad = null;

  const compareText = (a, b) => collator.compare(a, b) || (a < b ? -1 : a > b ? 1 : 0);

  function readFile(record) {
    if (!record || typeof record.path !== 'string') return null;
    const path = record.path;
    if (!path.startsWith('works/') || /[\\?#\u0000-\u001f\u007f]/.test(path)) return null;
    const parts = path.split('/');
    if (parts.some(part => !part || part === '.' || part === '..')) return null;
    const name = parts[parts.length - 1];
    const match = name.match(/^(.+)\.([a-z0-9]+)$/i);
    if (!match) return null;
    const extension = match[2].toLowerCase();
    if (!allowedTypes.includes(extension)) return null;
    const basename = match[1];
    const directory = parts.slice(0, -1).join('/');
    const key = `${directory}/${basename}`.normalize('NFC').toLowerCase();
    const url = new URL(parts.map(encodeURIComponent).join('/'), baseURL).href;
    return { path, basename, key, extension, url };
  }

  function titleAndOrder(basename) {
    const prefix = basename.match(/^(\d+)[\s._-]+(.*)$/);
    if (!prefix) return { title: basename.trim() || '未命名作品', order: null };
    const order = prefix[1].replace(/^0+(?=\d)/, '');
    return { title: prefix[2].trim() || `作品 ${order}`, order };
  }

  function preferred(files, types) {
    return files.filter(file => types.includes(file.extension)).sort((a, b) =>
      types.indexOf(a.extension) - types.indexOf(b.extension) || compareText(a.path, b.path)
    )[0];
  }

  function parseFeed(feed) {
    if (!feed || !Array.isArray(feed.files)) throw new Error('Invalid works feed');
    const groups = new Map();
    let error = false;
    for (const record of feed.files) {
      const file = readFile(record);
      if (!file) {
        error = true;
        continue;
      }
      if (!groups.has(file.key)) groups.set(file.key, []);
      groups.get(file.key).push(file);
    }
    const items = [...groups.entries()].map(([id, files]) => {
      const image = preferred(files, imageTypes);
      const video = preferred(files, videoTypes);
      const source = video || image;
      return {
        id,
        ...titleAndOrder(source.basename),
        poster: image ? image.url : '',
        video: video ? video.url : '',
        kind: video ? 'video' : 'image'
      };
    }).sort((a, b) => {
      if (a.order !== null && b.order === null) return -1;
      if (a.order === null && b.order !== null) return 1;
      if (a.order !== null && b.order !== null) {
        const numberOrder = a.order.length - b.order.length || compareText(a.order, b.order);
        if (numberOrder) return numberOrder;
      }
      return compareText(a.title, b.title) || compareText(a.id, b.id);
    }).map(({ order, ...item }) => item);
    return { items, error };
  }

  async function requestFeed(name) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    try {
      const response = await window.fetch(new URL(name, baseURL).href, {
        cache: 'no-cache',
        credentials: 'same-origin',
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Works feed unavailable');
      return parseFeed(await response.json());
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function readPublishedWorks() {
    try {
      return await requestFeed('works-feed.json');
    } catch (_) {
      if (localHost) {
        try {
          return await requestFeed('works-local.json');
        } catch (_) {
          // Local preview also reports loading failures instead of claiming an empty gallery.
        }
      }
      return { items: [], error: true };
    }
  }

  function load() {
    if (!activeLoad) {
      activeLoad = readPublishedWorks().finally(() => { activeLoad = null; });
    }
    return activeLoad;
  }

  window.WantuoWorks = { load, _parseFeed: parseFeed };
})();
