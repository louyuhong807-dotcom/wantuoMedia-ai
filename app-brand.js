'use strict';

const WECHAT = '2898220367';
const courses = [
  { kicker: '从工具到项目', title: '把制作流程练完整。', body: '练习AI绘图、分镜、动态镜头与剪辑，把画面、声音和故事接起来。', items: ['角色与画面风格统一', '分镜设计与镜头衔接', '配音、剪辑与成片输出'], note: '阶段重点：理解流程，完成项目练习。' },
  { kicker: '从练习到展示', title: '把作品打磨到能展示。', body: '调整分镜、画面与剪辑，整理个人展示短片和作品集。', items: ['项目精修与视觉统一', '展示短片与作品包装', '作品集整理与简历准备'], note: '阶段重点：能展示作品，也能讲清制作过程。' },
  { kicker: '从作品到表达', title: '带着作品，练习面试。', body: '了解岗位考核要求，练习作品陈述和常见问题应答。', items: ['岗位要求与考核要点', '作品陈述与模拟面试', '投递与沟通准备'], note: '阶段重点：把作品里的能力讲清楚。' },
  { kicker: '线上求职支持', title: '围绕投递和面试，继续准备。', body: '根据课程服务安排，提供岗位匹配、投递指导和面试复盘。', items: ['岗位匹配与投递指导', '面试准备与复盘', '根据反馈调整作品集'], note: '具体服务条件与期限以书面约定为准，录用由用人单位考核决定。' }
];
const tabs = [...document.querySelectorAll('[data-course]')];
function activateCourse(index, focus = false) {
  tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
  const course = courses[index];
  [['course-kicker', course.kicker], ['course-detail-title', course.title], ['course-detail-body', course.body], ['course-detail-note', course.note]].forEach(([id, text]) => { document.getElementById(id).textContent = text; });
  document.getElementById('course-detail-list').replaceChildren(...course.items.map(text => { const item = document.createElement('li'); item.textContent = text; return item; }));
  document.getElementById('course-panel').setAttribute('aria-labelledby', `course-tab-${index}`);
  if (focus) tabs[index].focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateCourse(index));
  tab.addEventListener('keydown', event => {
    let next;
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % tabs.length;
    if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); activateCourse(next, true); }
  });
});

const dialog = document.getElementById('contact-dialog');
const copyStatus = document.getElementById('copy-status');
let lastFocus;
document.querySelectorAll('[data-contact]').forEach(button => button.addEventListener('click', () => {
  lastFocus = document.activeElement;
  copyStatus.textContent = '复制后，打开微信搜索添加。';
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { document.body.style.overflow = ''; lastFocus?.focus(); });
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
document.getElementById('copy-wechat').addEventListener('click', async () => {
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(WECHAT);
    else {
      const field = document.createElement('textarea');
      field.value = WECHAT;
      field.style.cssText = 'position:fixed;opacity:0;width:1px;height:1px';
      field.setAttribute('readonly', '');
      dialog.append(field); field.select();
      let copied;
      try { copied = document.execCommand('copy'); } finally { field.remove(); }
      if (!copied) throw new Error('copy unavailable');
    }
    copyStatus.textContent = '微信号已复制，打开微信搜索添加。';
  } catch { copyStatus.textContent = '请长按或选中上方微信号，手动复制。'; }
});

