const i=await Deno.readTextFile(new URL("./input.txt",import.meta.url))
type I=['m',number,number]|'d'|'n'
const p=s=>[...s.matchAll(/mul\((\d{1,3}),(\d{1,3})\)|do\(\)|don't\(\)/g)].map(m=>
  m[0]=='do()'?'d':m[0]=="don't()"?'n':['m',+m[1],+m[2]]
).filter(x=>x=='d'||x=='n'||(x[0]=='m'&&x[1]>=1&&x[1]<=999&&x[2]>=1&&x[2]<=999))
const c=(a,e=0)=>{let s=0,f=1;for(let x of a)x=='d'?f=1:x=='n'?f=0:x[0]=='m'&&(!e||f)&&(s+=x[1]*x[2]);return s}
console.log(c(p(i)),c(p(i),1))