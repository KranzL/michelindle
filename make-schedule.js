const fs=require('fs');
const src=fs.readFileSync(__dirname+'/restaurants.js','utf8');
eval(src.replace('const RESTAURANTS','var RESTAURANTS'));

function hashStr(s){
  let h=1779033703^s.length;
  for(let i=0;i<s.length;i++){
    h=Math.imul(h^s.charCodeAt(i),3432918353);
    h=(h<<13)|(h>>>19);
  }
  return function(){
    h=Math.imul(h^(h>>>16),2246822507);
    h=Math.imul(h^(h>>>13),3266489909);
    return (h^=h>>>16)>>>0;
  };
}

function mulberry32(a){
  return function(){
    a|=0;a=(a+1831565813)|0;
    let t=Math.imul(a^(a>>>15),1|a);
    t=(t+Math.imul(t^(t>>>7),61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}

function seededRng(str){
  return mulberry32(hashStr(str)());
}

const START='2026-08-13';
const DAYS=400;

const tiers=[1,2,3].map(f=>RESTAURANTS.filter(r=>r.fame===f).map(r=>r.id));
tiers.forEach((ids,i)=>{
  if(!ids.length) throw new Error('empty fame tier '+(i+1));
});

const seqs=tiers.map((ids,t)=>{
  const out=[];
  let pass=0;
  while(out.length<DAYS){
    const rng=seededRng('michelindle|tier'+(t+1)+'|pass'+pass);
    const a=[...ids];
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(rng()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    if(out.length&&a[0]===out[out.length-1]) a.push(a.shift());
    out.push(...a);
    pass++;
  }
  return out.slice(0,DAYS);
});

let s='const SCHEDULE={\n';
const d=new Date(START+'T12:00:00Z');
for(let i=0;i<DAYS;i++){
  const key=d.toISOString().slice(0,10);
  s+='  "'+key+'": ['+seqs[0][i]+', '+seqs[1][i]+', '+seqs[2][i]+']'+(i<DAYS-1?',':'')+'\n';
  d.setUTCDate(d.getUTCDate()+1);
}
s+='};\n';
fs.writeFileSync(__dirname+'/schedule.js',s);
console.log('wrote schedule.js with '+DAYS+' days starting '+START);
console.log('tier sizes: '+tiers.map(t=>t.length).join(', '));
