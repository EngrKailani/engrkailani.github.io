/* Check text inside cards, not just document scrollWidth. Runs in CI Chromium. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
module.exports = async function mobileLayout(browser, origin, note, out) {
  const reports = [];
  const pages = fs.readdirSync(path.join(__dirname, '..', 'projects'))
    .filter(file => file.endsWith('.html')).map(file => '/projects/' + file);
  const cases = [
    ...[320, 375, 430, 768].map(width => ({url:'/', width, height:900})),
    {url:'/', width:844, height:390},
    ...[320,390,768].map(width => ({url:'/workbench.html', width, height:740})),
    ...['/resume.html', ...pages].map(url => ({url, width:320, height:740}))
  ];
  for (const test of cases) {
    const context = await browser.newContext({viewport:{width:test.width,height:test.height}, reducedMotion:'reduce'});
    const page = await context.newPage();
    const id = test.url + ' ' + test.width + 'x' + test.height;
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    async function inspect(state) {
      const failures = await page.evaluate(() => {
        const shapes = '.featured-project-card,.project-card,.repo-card,.detail-card,.detail-panel,' +
          '.detail-results,.resume-note,.education-panel,.shelf-preview,.book-page,' +
          '.project-evidence-first__item,.project-visual-gallery__item,.nasa-workstreams__grid>section,' +
          '.case-explorer__insight,.case-explorer__limit,.case-explorer__stats>div,' +
          '.case-explorer__flow button,.case-explorer__tabs button,.case-explorer__actions button,' +
          '.btn,.repo-featured,.repo-featured__link,.robot-control-sliders>div,' +
          '.robot-control-presets button,.robot-view-picker button,.nav-links a,' +
          '.wb-nav-links,.wb-tab,.wb-panel,.wb-controls,.wb-readouts>div,' +
          '.wb-channel-readouts>div,.wb-project-link,.wb-method,.wb-disclaimer';
        const found = [];
        const viewport = document.documentElement.clientWidth;
        if (Math.max(document.body.scrollWidth,document.documentElement.scrollWidth) > viewport+3)
          found.push('Document wider than viewport: '+[...document.querySelectorAll('body *')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.right>viewport+3&&r.left<viewport;}).slice(0,8).map(el=>el.tagName+'.'+el.className).join(', '));
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let node; (node=walker.nextNode());) {
          if (!node.textContent.trim()) continue;
          const el = node.parentElement;
          if (el.closest('svg,script,style,[aria-hidden="true"]')) continue;
          if (!el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})) continue;
          const shape = el.closest(shapes);
          if (!shape) continue;
          const box = shape.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const rect of range.getClientRects()) {
            if (rect.width < 1 || rect.height < 1) continue;
            if (rect.left < box.left-2 || rect.right > box.right+2 ||
                rect.top < box.top-2 || rect.bottom > box.bottom+2) {
              found.push(shape.className + ': ' + node.textContent.trim().slice(0,80));
              break;
            }
          }
        }
        return [...new Set(found)];
      });
      for (const failure of failures) note(id+' ['+state+']: '+failure);
      reports.push({id,state,failures});
    }
    try {
      await page.goto(origin+test.url,{waitUntil:'load'});
      await page.evaluate(() => document.fonts.ready);
      await inspect('initial layout');
      if(test.url==='/workbench.html') {
        for (const instrument of ['scope','robot','lights','thermal']) {
          await page.locator('#wb-tab-'+instrument).click();
          if(!await page.locator('#wb-panel-'+instrument).isVisible())
            note(id+': workbench module not visible: '+instrument);
          await inspect('workbench '+instrument);
        }
      }
      if(test.url==='/') {
         const archive=page.locator('#explore');
         if(await archive.evaluate(el=>el.open))
           note(id+': optional gallery must start collapsed');
         if(await page.locator('#bookshelf').isVisible())
           note(id+': bookshelf should not add to the initial scrolling homepage');
         await archive.locator('summary').click();
         await page.waitForTimeout(200);
         if(!await archive.evaluate(el=>el.open))
           note(id+': archive did not expand');
         if(!await page.locator('#bookshelf').isVisible())
           note(id+': bookshelf must appear when gallery is expanded');
         if(!await page.locator('#repo-planetarium').isVisible())
           note(id+': repository planets must appear when gallery is expanded');
         await inspect('expanded optional gallery');
       }
      // Trigger below-the-fold content and feature loading before inspecting it.
      await page.evaluate(async () => {
        for (let y=0;y<document.body.scrollHeight;y+=650) {
          scrollTo(0,y);
          await new Promise(resolve=>requestAnimationFrame(resolve));
        }
      });
      await page.waitForTimeout(400);
      await inspect('page');
      if (test.url==='/') {
        for (const tab of await page.locator('[data-case-select]').all()) {
          await tab.click();
          for (const step of await page.locator('[data-case-step]').all()) {
            await step.click();
            await inspect('case study '+await tab.getAttribute('data-case-select')+' step '+await step.getAttribute('data-case-step'));
          }
        }
        await page.locator('#menu-toggle').click();
        await inspect('open navigation');
        const menu = await page.locator('#nav-links').evaluate(el=>({bottom:el.getBoundingClientRect().bottom,height:innerHeight,scrollable:getComputedStyle(el).overflowY==='auto'}));
        if (menu.bottom>menu.height+2) note(id+': menu extends below screen');
        await page.locator('#menu-toggle').click();
        const books = page.locator('[data-open-book]');
        if (await books.count()) {
          await books.first().click();
          try { await page.locator('#project-book-dialog[open]').waitFor({state:'visible',timeout:5000}); }
          catch {note(id+': clicking a book did not open the reader modal');}
          await inspect('open book');
          const switcher=page.locator('#book-switch-select');
          if(await switcher.count()){
            if(await switcher.locator('option').count()!==15)
              note(id+': missing direct chooser options for all fifteen books');
            await switcher.selectOption('iverify');
            if((await page.locator('#book-modal-title').textContent()||'').trim()!=='IVerify')
              note(id+': mobile book selector did not open IVerify');
          } else note(id+': direct book switcher missing on mobile');
          const turn = page.locator('.book-mobile-turn:visible').first();
          if (await turn.count()) { await turn.click(); await page.waitForTimeout(100); await inspect('book second page'); }
          await page.keyboard.press('Escape');
        }
        if (test.width===320) {
          await page.evaluate(()=>scrollTo(0,0));

await page.screenshot({path:path.join(out,'screenshots','mobile-containment-320.png'),fullPage:true});
          await page.goto(origin+'/#bookshelf',{waitUntil:'load'});
          await page.locator('#bookshelf').waitFor({state:'visible'});
          if(!await page.locator('#bookshelf').isVisible()) note(id+': bookshelf deep link is not visible');
          await inspect('legacy bookshelf deep link');
        }
      }
      for (const error of errors) note(id+': JavaScript error: '+error);
    } catch(error) { note(id+': mobile interaction check failed: '+error.message); }
    finally { await context.close(); }
  }
  fs.writeFileSync(path.join(out,'mobile-layout.json'),JSON.stringify(reports,null,2));
  console.log('Mobile containment: '+reports.length+' page and interaction states checked.');
};
