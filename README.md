# 万拓传媒AI漫剧实训

面向潜在学员的培训介绍网站，采用蓝、白、橙配色，分为首页、课程实训、公司简介和常见问题四个页面。所有页面都可通过“咨询课程”打开微信咨询入口。

公开网页：https://louyuhong807-dotcom.github.io/wantuoMedia-ai/

咨询微信：**2898220367**。

## 文件与发布

这是静态网站，无需安装依赖或构建。GitHub Pages 使用 `main` 分支和根目录发布。请保留文件结构，上传全部页面、当前样式、脚本及图片；本地打开 `index.html` 可预览。

- `index.html`：首页。
- `course.html`：45 天线下学习安排、定向就业岗位与薪资参考、费用及报名说明。
- `company.html`：公司简介、五个合作单位 Logo、官网链接与隐藏的照片位置。
- `faq.html`：常见问题。
- `styles-brand.css`：四个页面共用的排版与手机适配。
- `app-brand.js`：课程阶段切换、咨询弹窗及微信复制。
- `hero.png`：AI 概念分镜，非学员作品。
- `logo.jpg`：ONE TOP 品牌标志，兼作网站图标。
- `partner-jiuzhou.jpg`、`partner-zhangzhongyun.png`、`partner-duiba.png`：官网公开 Logo。
- `partner-source.png`：用户提供的合作单位宣传海报原图。
- `.nojekyll`：供 GitHub Pages 直接发布静态文件。

## 合作单位 Logo 与链接来源

| 展示单位 | 当前 Logo 来源 | 点击去向 |
| --- | --- | --- |
| 长江影视科技 | 用户提供的宣传海报原图，通过 SVG 视口显示对应 Logo | https://www.hbfilm.com.cn/ ，页面明确标注“所属集团官网” |
| 九州文化 | 嘉兴九州文化官网首页彩色 Logo | https://www.jxjzwh.cn/ |
| 有品新媒体 | 用户提供的宣传海报原图，通过 SVG 视口显示对应 Logo | 暂不设置链接 |
| 兑吧集团 | [官网公开集团 Logo 原图](https://www.duiba.com.cn/_nuxt/img/logo-duiba-group2.0b5ab2a.png) | https://www.duiba.cn/ |
| 掌中云 | 掌中云官网公开彩色 Logo | https://zhangzhongyun.com/ |

合作单位名单按用户确认内容展示。海报中的 Logo 直接显示原图对应区域，没有重绘；`partner-source.png` 必须与网页一起部署。有品官网确认后再补链接，不使用同名公司的地址。

## 后续更换 Logo 与交流照片

**Logo：**把正式图片放入 `网页根目录`。打开 `company.html`，找到对应的 `partner-mark`。保留链接、无障碍名称与右上角跳转标记，把内部的 `<svg>` 或 `<img>` 换成正式图片，例如：

```html
<img src="partner-new.png" alt="实际企业名称" loading="lazy">
```

如果为有品补充官网，将其外层 `div.partner-mark` 改成 `a.partner-mark`，填写已确认的网址，并使用 `target="_blank" rel="noopener noreferrer"`。不修改其他合作单位的跳转地址。

**合作照片：**`cooperation-gallery` 中保留了 3 个照片位置，目前整个区域带有 `hidden`，不会出现在公开页面。取得真实照片后，将 `photo-placeholder` 换成图片，并填写真实说明：

```html
<figure>
  <img src="cooperation-01.jpg" alt="实际活动地点和交流场景的简短描述" loading="lazy" width="1600" height="900">
  <figcaption>真实活动名称或拍摄时间</figcaption>
</figure>
```

照片建议使用 16:9 横图。图片的 `width`、`height` 填原图实际尺寸，`alt` 和 `figcaption` 填真实内容。准备好后，删除未使用的空 `figure`，再移除 `cooperation-gallery` 上的 `hidden`。上传时同时提交修改后的 HTML 与图片。

## 其他内容维护

更换微信号时，同步修改四个 HTML 中的展示号码与 `app-brand.js` 顶部的 `WECHAT`。价格与六项费用说明在 `course.html`，课程为用户确认的 240 课时、45 天线下实训；课程内容切换的详细文案在 `app-brand.js`。就业岗位、城市、福利及薪资取自用户提供的海报，后续应随企业正式岗位资料更新；不将所有职级工资当作学员入职起薪。证书具体发证机构和授权证明未提供，不把海报中的机构授权宣传当作已经独立核实的事实。

公司简介依据用户提供的资料整理。课程资料所列提供方为武汉万拓传媒有限公司，实际签约、收费和服务主体以报名前确认的信息为准。

网页不收集个人信息，不提供在线付款；访客自行添加微信咨询。
