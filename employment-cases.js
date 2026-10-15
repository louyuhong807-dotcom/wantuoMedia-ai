(() => {
  'use strict';
  const form = document.getElementById('case-filters');
  const records = Array.from(document.querySelectorAll('.case-record'));
  const city = document.getElementById('case-city');
  const role = document.getElementById('case-role');
  const count = document.getElementById('case-count');
  const pageStatus = document.getElementById('case-page');
  const previous = document.getElementById('case-prev');
  const next = document.getElementById('case-next');
  const empty = document.getElementById('case-empty');
  const pagination = document.getElementById('case-pagination');
  if (!form || !records.length) return;
  const pageSize = 12;
  let page = 1;
  let filtered = records;
  for (const value of [...new Set(records.map(record => record.dataset.city))]) city.add(new Option(value, value));
  for (const value of [...new Set(records.map(record => record.dataset.category))]) role.add(new Option(value, value));
  function render() {
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    page = Math.max(1, Math.min(page, pageCount));
    const visible = new Set(filtered.slice((page - 1) * pageSize, page * pageSize));
    records.forEach(record => { record.hidden = !visible.has(record); });
    count.textContent = `共 ${filtered.length} 条案例`;
    pageStatus.textContent = `${page} / ${pageCount}`;
    previous.disabled = page === 1;
    next.disabled = page === pageCount;
    empty.hidden = filtered.length !== 0;
    pagination.hidden = filtered.length <= pageSize;
  }
  function filter() {
    page = 1;
    filtered = records.filter(record => (!city.value || record.dataset.city === city.value) && (!role.value || record.dataset.category === role.value));
    render();
  }
  function turn(delta) {
    page += delta;
    render();
    const heading = document.getElementById('case-list-title');
    heading.focus({preventScroll: true});
    heading.scrollIntoView({block: 'start', behavior: 'instant'});
  }
  form.addEventListener('submit', event => event.preventDefault());
  city.addEventListener('change', filter);
  role.addEventListener('change', filter);
  document.getElementById('case-reset').addEventListener('click', () => { form.reset(); filter(); });
  previous.addEventListener('click', () => turn(-1));
  next.addEventListener('click', () => turn(1));
  form.hidden = false;
  render();
})();
