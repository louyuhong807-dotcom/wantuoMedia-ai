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

  function plainText(value, maxLength) {
    if (typeof value !== 'string' && !(typeof value === 'number' && Number.isFinite(value))) return '';
    return String(value)
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
      .replace(/\r\n?/g, '\n')
      .trim()
      .slice(0, maxLength);
  }

  function mergeDetails(result, metadata) {
    if (!metadata || metadata.version !== 1 || !Array.isArray(metadata.works)) return result;
    const detailsByKey = new Map();
    for (const record of metadata.works) {
      if (!record || typeof record.key !== 'string') continue;
      const key = record.key.normalize('NFC').toLowerCase();
      if (detailsByKey.has(key)) continue;
      const details = {
        title: plainText(record.title, 160),
        category: plainText(record.category, 100),
        summary: plainText(record.summary, 4000),
        facts: Array.isArray(record.facts) ? record.facts.slice(0, 20).map(fact => ({
          label: plainText(fact && fact.label, 80),
          value: plainText(fact && fact.value, 500)
        })).filter(fact => fact.label && fact.value) : [],
        sections: Array.isArray(record.sections) ? record.sections.slice(0, 20).map(section => ({
          title: plainText(section && section.title, 160),
          text: plainText(section && section.text, 10000)
        })).filter(section => section.title || section.text) : [],
        sourceNote: plainText(record.sourceNote, 800)
      };
      if (details.title || details.category || details.summary || details.facts.length ||
          details.sections.length || details.sourceNote) detailsByKey.set(key, details);
    }
    return {
      ...result,
      items: result.items.map(item => detailsByKey.has(item.id)
        ? { ...item, details: detailsByKey.get(item.id) }
        : item)
    };
  }

  async function requestJSON(name, timeoutMs) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await window.fetch(new URL(name, baseURL).href, {
        cache: 'no-cache',
        credentials: 'same-origin',
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Works feed unavailable');
      return await response.json();
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function requestFeed(name) {
    return parseFeed(await requestJSON(name, 8000));
  }

  async function addOptionalDetails(result) {
    if (!result.items.length) return result;
    try {
      return mergeDetails(result, await requestJSON('works-details.json', 4000));
    } catch (_) {
      // Optional descriptions never block the published images or videos.
      return result;
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
      activeLoad = readPublishedWorks().then(addOptionalDetails).finally(() => { activeLoad = null; });
    }
    return activeLoad;
  }

  window.WantuoWorks = { load, _parseFeed: parseFeed, _mergeDetails: mergeDetails };
})();
