'use strict';
const WECHAT = '2898220367';
const processes = [
  {title:'先想清楚，镜头要讲什么。',body:'拆解故事情节，设计景别与镜头顺序。练习把一段文字，转换为可以执行的分镜。',example:'末班车进站时，她收到一条没有署名的消息。原本熟悉的站台，忽然变得陌生。',note:'先确定人物、目标和转折',skills:['剧本适配与情节拆解','镜头语言与分镜设计','画面提示词组织']},
  {title:'让同一个人，出现在不同镜头里。',body:'围绕人物设定、服装和场景建立画面。练习角色与风格的一致性，让连续镜头属于同一个故事。',example:'短发、橙色外套、深蓝色站台。即使镜头拉近，她也应当还是故事里的同一个人。',note:'练习角色与风格的一致性',skills:['角色与场景设定','参考图与素材组织','画面修整与风格统一']},
  {title:'让动作，推动故事往前走。',body:'练习把静态画面转成动态镜头，观察人物动作、镜头衔接和常见生成问题，调整不自然的细节。',example:'先拍驶入站台的列车，再切到亮起的手机，最后停在她回头的瞬间。',note:'观察动作、景别和衔接',skills:['图像转动态画面','镜头衔接与节奏','生成问题检查与修整']},
  {title:'画面和声音，一起完成叙事。',body:'把镜头整理成片，加入配音、音效、字幕与调色。练习通过剪辑，让观众看懂情节与情绪。',example:'列车刹车声渐近，手机提示音突然响起。她回头时，背景声停了一拍。',note:'用节奏与声音表达情绪',skills:['剪辑与画面合成','配音、音效与字幕','调色、包装与输出']}
];
const courses = [
  {kicker:'把制作流程练起来',title:'从工具实操，走到完整项目。',body:'学习AI绘图、分镜、配音与剪辑，练习人物和风格一致性，再把各个环节接成完整的制作流程。',items:['AI图像与视频工具操作','角色设定、分镜和镜头衔接','后期合成、调色、声音与包装'],note:'重点：理解完整流程，完成项目练习。'},
  {kicker:'把作品准备得更完整',title:'练习修改，也练习展示。',body:'围绕个人项目打磨分镜、画面与剪辑，整理展示短片和作品集，让作品更清楚地表达你的制作思路。',items:['核心项目精修与视觉统一','作品包装与个人展示短片','作品集整理与简历准备'],note:'重点：能展示作品，也能讲清楚制作过程。'},
  {kicker:'让面试表达更清楚',title:'带着作品，练习介绍自己。',body:'了解相关岗位的考核方向，通过模拟面试练习作品陈述、项目说明与常见问题应答。',items:['岗位要求与考核要点解读','作品陈述与模拟面试','投递和面试沟通准备'],note:'重点：把作品里的能力讲清楚。'},
  {kicker:'继续获得求职支持',title:'围绕投递和面试，持续准备。',body:'根据课程服务安排，提供岗位匹配、投递指导、面试沟通和复盘，结合反馈继续调整作品与表达。',items:['岗位匹配与投递指导','面试准备、沟通与复盘','根据反馈调整作品集'],note:'具体服务条件与期限以书面约定为准，录用由用人单位考核决定。'}
];
const setText = (id,text) => { document.getElementById(id).textContent = text; };
function renderList(id,items){const list=document.getElementById(id);list.replaceChildren(...items.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));}
function setupTabs(attribute,callback){
  const buttons=[...document.querySelectorAll(`[${attribute}]`)];
  function activate(button,focus=false){buttons.forEach(b=>{const active=b===button;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});callback(Number(button.getAttribute(attribute)));if(focus)button.focus();}
  buttons.forEach((button,i)=>{button.addEventListener('click',()=>activate(button));button.addEventListener('keydown',event=>{let next;if(['ArrowRight','ArrowDown'].includes(event.key))next=(i+1)%buttons.length;if(['ArrowLeft','ArrowUp'].includes(event.key))next=(i-1+buttons.length)%buttons.length;if(event.key==='Home')next=0;if(event.key==='End')next=buttons.length-1;if(next!==undefined){event.preventDefault();activate(buttons[next],true);}});});
}
setupTabs('data-process',index=>{const d=processes[index];setText('process-title',d.title);setText('process-body',d.body);setText('process-example',d.example);setText('process-note',d.note);setText('process-count',['第一个环节','第二个环节','第三个环节','第四个环节'][index]);renderList('process-skills',d.skills);document.getElementById('process-panel').setAttribute('aria-labelledby',`process-tab-${index}`);});
setupTabs('data-course',index=>{const d=courses[index];setText('course-kicker',d.kicker);setText('course-detail-title',d.title);setText('course-detail-body',d.body);renderList('course-detail-list',d.items);setText('course-detail-note',d.note);document.getElementById('course-panel').setAttribute('aria-labelledby',`course-tab-${index}`);});
const menuButton=document.querySelector('.menu-toggle');const nav=document.getElementById('main-nav');
function closeMenu(){nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','展开导航');}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'关闭导航':'展开导航');});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
window.addEventListener('resize',()=>{if(window.innerWidth>640)closeMenu();});
const dialog=document.getElementById('contact-dialog');let lastFocus=null;
function openContact(){lastFocus=document.activeElement;setText('copy-status','');dialog.showModal();document.body.style.overflow='hidden';}
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',openContact));
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.body.style.overflow='';lastFocus?.focus();});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
let toastTimeout;
function toast(text){const el=document.getElementById('toast');el.textContent=text;el.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('visible'),3000);}
async function copyText(text,kind){
  try{
    if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);}
    else{const field=document.createElement('textarea');field.value=text;field.setAttribute('readonly','');field.style.cssText='position:fixed;left:0;top:0;opacity:0;width:1px;height:1px;';(dialog.open?dialog:document.body).append(field);field.select();const ok=document.execCommand('copy');field.remove();if(!ok)throw new Error('copy unavailable');}
    const msg=kind==='wechat'?'微信号已复制。请打开微信搜索添加。':'咨询内容已复制，可粘贴到微信。';setText('copy-status',msg);toast(msg);
  }catch{setText('copy-status',kind==='wechat'?'暂时无法自动复制，请长按或选中上方微信号复制。':'暂时无法自动复制，请选中上方咨询内容复制。');if(kind!=='wechat'){document.getElementById('consultation-text').focus();document.getElementById('consultation-text').select();}}
}
document.getElementById('copy-wechat').addEventListener('click',()=>copyText(WECHAT,'wechat'));
document.getElementById('copy-message').addEventListener('click',()=>copyText(document.getElementById('consultation-text').value,'message'));
const form=document.getElementById('readiness-form');
form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const goal=data.get('goal'),experience=data.get('experience'),time=data.get('time');let title,advice;
  if(goal==='interest'){title='先了解制作过程，再决定投入。';advice='你目前以兴趣了解为主，建议先看完整课程说明和实际练习内容，再判断是否需要集中实训。可以先向咨询人员了解体验方式，不急着报名就业导向课程。';}
  else if(time==='discuss'){title='先把学习时间确认下来。';advice='你的目标已经比较清楚。建议优先确认开班日期、到课要求和授课形式，再判断能否安排连续学习。不要只看课程天数就做决定。';}
  else if(experience==='computer'){title='先确认电脑基础与课程节奏。';advice='集中实训会涉及多个工具和文件管理。建议先让老师了解你的电脑基础，确认是否需要提前练习，以及课程节奏能否匹配。';}
  else{title=experience==='experienced'?'带着已有作品，进一步了解课程。':'从学习目标和基础要求聊起。';advice=experience==='experienced'?'你可以带一份剪辑、设计或内容作品咨询，让老师说明现有能力与课程内容如何衔接。继续核对费用、设备、招生条件和服务约定，再决定报名。':'你可以先了解工具操作、每日练习量与设备要求。请机构确认招生条件、授课安排和支持方式，再判断课程是否适合当前基础。';}
  setText('result-title',title);setText('result-copy',advice);const result=document.getElementById('quiz-result');result.hidden=false;result.focus({preventScroll:true});result.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
  const goals={job:'求职或转行',skill:'提升已有制作能力',interest:'兴趣了解'};const experiences={experienced:'有剪辑、设计或内容制作经验',beginner:'熟悉电脑，制作方面是零基础',computer:'电脑操作也需要学习'};
  document.getElementById('consultation-text').value=`你好，我想了解AI漫剧实训。我的目标是${goals[goal]}，目前${experiences[experience]}，学习时间${time==='ready'?'可以安排':'还需要协调'}。请发我当前班次的课程表、授课形式、15,800元费用明细、设备与招生要求，以及就业服务和退款条件。`;
});
document.getElementById('open-personal-contact').addEventListener('click',openContact);
