'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {extractUrls,classify,makeMarkdown}=require('./external-links.js');

test('collect navigable public URLs and discard metadata, internal links, fragments',()=>{
  const html='<link href="https://fonts.example/css"><a href="https://kailanialarcon.com/research.html">Internal</a>'+
    '<a class="item" target="_blank" href="https://github.com/EngrKailani/HueMotion#readme">Code</a>'+
    '<a href="https://example.org/paper.pdf?a=1&amp;b=2">Paper</a><a href="#contact">Contact</a>';
  assert.deepEqual(extractUrls(html),[
    'https://github.com/EngrKailani/HueMotion',
    'https://example.org/paper.pdf?a=1&b=2'
  ]);
});
test('HEAD availability is accepted; GET confirms missing resources only',()=>{
  assert.equal(classify(200,null),'ok');
  assert.equal(classify(405,206),'ok');
  assert.equal(classify(404,200),'ok');
  assert.equal(classify(404,404),'broken');
  assert.equal(classify(410,410),'broken');
  assert.equal(classify(403,403),'unverified');
  assert.equal(classify(503,null),'unverified');
  assert.equal(classify(null,null),'unverified');
});
test('report distinguishes inventory and verified status without claiming availability',()=>{
  const link={url:'https://example.org/',pages:['index.html']};
  assert.match(makeMarkdown([{...link,status:'inventory'}],'--inventory'==='--check'?/network/:/Inventory only/);
  assert.match(makeMarkdown([{...link,status:'broken'}],'--check'),/BROKEN/);
});
