i=await Deno.readTextFile("./input.txt")
[r,u]=i.trim().split`\n\n`
r=r.split`\n`.map(l=>[...l.split`|`].map(Number))
u=u.split`\n`.map(l=>l.split`,`.map(Number))
v=u=>r.every(([b,a])=>u.indexOf(b)<u.indexOf(a)||u.indexOf(b)*u.indexOf(a)<0)
m=a=>a[a.length>>1]
console.log([u.filter(v),u.filter(x=>!v(x)).map(u=>[...u].sort((a,b)=>r.some(([c,d])=>a==c&&b==d)?-1:r.some(([c,d])=>a==d&&b==c)?1:0))].map(x=>x.map(m).reduce((a,b)=>a+b)))
