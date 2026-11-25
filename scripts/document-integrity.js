/* Confirm the published PDF wrappers point to intact, distinct original documents.
 * This is a structural asset check, not a PDF text or typography review. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const docs=[
  {page:'academic-cv.html',pdf:'assets/Kailani_Alarcon_CV.pdf',title:'Academic CV'},
  {page:'resume.html',pdf:'assets/Kailani_Alarcon_Master_Resume.pdf',title:'Résumé'}
];
for(const {page,pdf,title} of docs){
  const html=fs.readFileSync(page,'utf8');
  const bytes=fs.readFileSync(pdf);
  const start=bytes.subarray(0,5).toString('ascii');
  const end=bytes.subarray(Math.max(0,bytes.length-1024)).toString('latin1');
  assert.equal(start,'%PDF-',pdf+': invalid PDF header');
  assert(end.includes('%%EOF'),pdf+': PDF is missing its closing EOF marker');
  assert(bytes.length>5000,pdf+': unexpectedly small PDF');
  assert(html.includes('<h1>'+title+'</h1>'),page+': document title mismatch');
  assert(html.includes('href="'+pdf+'" target="_blank"'),page+': open document link mismatch');
  assert(html.includes('href="'+pdf+'" download'),page+': download link mismatch');
  assert(html.includes('src="'+pdf+'#view=FitH"'),page+': embedded preview mismatch');
  assert(html.includes('https://kailanialarcon.com/'+page),page+': incorrect canonical');
  assert(!html.includes('kalarcon775.github.io'),page+': obsolete domain in wrapper');
  console.log('PASS '+title+' PDF asset: '+bytes.length+' bytes, matching open/download/embed links');
}
assert.notEqual(docs[0].pdf,docs[1].pdf,'CV and résumé must not point to the same PDF');
console.log('PDF link checks passed. This script does not verify PDF content or rendered typography.');
