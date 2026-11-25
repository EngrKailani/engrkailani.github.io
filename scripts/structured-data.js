/* Reproducible, conservative schema.org metadata for public portfolio pages.
   This describes webpages, not independently published research or NASA products.
   Usage: node scripts/structured-data.js --write | --check */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const site='https://kailanialarcon.com';
const slugs=['alu','controls','dmx','fingerprint','hall','huemotion','iverify','leg',
  'motor','nasa','powershell','prodriver','thermal','ur3e','vhdl','vna'];
const pages=['research.html','projects/index.html',...slugs.map(slug=>'projects/'+slug+'.html')];
const marker='data-portfolio-structured';
function decode(s){
  return String(s).replace(/<[^>]+>/g,'').replace(/&(?:amp|lt|gt|quot|apos|nbsp|ndash|mdash);/g,m=>({
    '&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' ',
    '&ndash;':'–','&mdash;':'—'
  }[m]||m)).replace(/\s+/g,' ').trim();
}
function field(html,re,label){
  const value=html.match(re)?.[1];
  if(!value)throw Error('Missing '+label);
  return decode(value);
}
function bread(items){
  return {'@type':'BreadcrumbList',itemListElement:items.map(([name,url],index)=>({
    '@type':'ListItem',position:index+1,name,item:url
  }))};
}
function collectionEntries(html){
  const cards=[...html.matchAll(/<a class="featured-project-card"[^>]*href="([^"]+)"[^>]*>[\s\S]*?<strong>([\s\S]*?)<\/strong>[\s\S]*?<\/a>/g)]
    .map(m=>({name:decode(m[2]),url:new URL(m[1],site+'/projects/').href}));
  const briefs=[...html.matchAll(/<article class="directory-brief-card"[\s\S]*?<\/article>/g)]
    .map(m=>{
      const name=field(m[0],/<h3>([\s\S]*?)<\/h3>/,'brief name');
      const href=field(m[0],/<a href="([^"]+)"/,'brief href');
      return {name,url:new URL(href,site+'/projects/').href};
    });
  if(cards.length!==16||briefs.length!==4)throw Error('Expected 16 case-study cards and four briefs');
  return [...cards,...briefs];
}
function schemaFor(file,html){
  const canonical=field(html,/<link rel="canonical" href="([^"]+)"/,'canonical');
  const name=field(html,/<title>([\s\S]*?)<\/title>/,'title');
  const description=field(html,/<meta name="description" content="([^"]+)"/,'description');
  const isArchive=file==='projects/index.html';
  const isResearch=file==='research.html';
  const breadcrumbs=[['Portfolio',site+'/']];
  if(!isResearch)breadcrumbs.push(['Engineering projects',site+'/projects/']);
  if(!isArchive)breadcrumbs.push([field(html,/<h1\b[^>]*>([\s\S]*?)<\/h1>/,'page heading'),canonical]);
  const result={
    '@context':'https://schema.org',
    '@type':isArchive?'CollectionPage':'WebPage',
    '@id':canonical+'#webpage',
    url:canonical,name,description,
    isPartOf:{'@type':'WebSite',name:'Kailani Alarcon engineering portfolio',url:site+'/'},
    breadcrumb:bread(breadcrumbs)
  };
  if(isArchive){
    result.mainEntity={
      '@type':'ItemList',numberOfItems:20,
      itemListElement:collectionEntries(html).map((entry,index)=>({
        '@type':'ListItem',position:index+1,name:entry.name,item:entry.url
      }))
    };
  }
  return result;
}
function render(file,html){
  const json=JSON.stringify(schemaFor(file,html),null,2).replace(/</g,'\\u003c');
  const block='<script type="application/ld+json" '+marker+'>\n'+json+'\n</script>';
  const pattern=/<script type="application\/ld\+json" data-portfolio-structured>[\s\S]*?<\/script>/;
  if(pattern.test(html))return html.replace(pattern,block);
  if(!html.includes('</head>'))throw Error(file+': missing HTML head');
  return html.replace('</head>',block+'\n</head>');
}
function check(){
  const errors=[];
  for(const file of pages){
    const html=fs.readFileSync(path.join(root,file),'utf8');
    const actual=html.match(/<script type="application\/ld\+json" data-portfolio-structured>([\s\S]*?)<\/script>/)?.[1];
    if(!actual){errors.push(file+': missing structured data');continue}
    try{
      const data=JSON.parse(actual);
      const expected=schemaFor(file,html);
      if(JSON.stringify(data)!==JSON.stringify(expected))errors.push(file+': structured data is stale');
      if(render(file,html)!==html)errors.push(file+': output not normalized');
    }catch(e){errors.push(file+': '+e.message)}
  }
  for(const message of errors)console.error('FAIL '+message);
  console.log('Structured data: '+(pages.length-errors.length)+'/'+pages.length+' pages verified');
  return errors.length===0;
}
if(require.main===module){
  const mode=process.argv[2]||'--check';
  if(mode==='--write'){
    for(const file of pages){
      const current=fs.readFileSync(path.join(root,file),'utf8');
      fs.writeFileSync(path.join(root,file),render(file,current));
    }
    console.log('Updated '+pages.length+' structured-data blocks');
  } else if(mode==='--check') {
    if(!check())process.exitCode=1;
  } else {console.error('Use --write or --check');process.exitCode=2}
}
module.exports={pages,schemaFor,render,check,collectionEntries};
