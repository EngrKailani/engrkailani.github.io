/* Parse every authored CSS file, plus the published bundle. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const csstree=require('css-tree');
const root=path.resolve(__dirname,'..');
const excludes=new Set(['.git','node_modules','quality-artifacts']);
const files=[];
function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.isDirectory()){
      if(!excludes.has(entry.name))walk(path.join(dir,entry.name));
    }else if(entry.isFile() && entry.name.endsWith('.css')){
      files.push(path.join(dir,entry.name));
    }
  }
}
walk(root);
const errors=[];
for(const file of files){
  const source=fs.readFileSync(file,'utf8');
  const relative=path.relative(root,file);
  if(!source.trim())errors.push(relative+': empty stylesheet');
  try{
    csstree.parse(source,{
      positions:true,
      onParseError(error){
        const loc=error.loc&&error.loc.start;
        errors.push(relative+':'+(loc?loc.line+':'+loc.column:'?')+': '+error.message);
      }
    });
  }catch(error){errors.push(relative+': '+error.message)}
}
for(const error of errors)console.error('::error::'+error);
console.log('Parsed '+files.length+' CSS files; '+errors.length+' syntax issue(s).');
if(errors.length)process.exitCode=1;
