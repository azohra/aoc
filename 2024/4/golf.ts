const i=await Deno.readTextFile(new URL("./input.txt",import.meta.url))
const g=i.trim().split`\n`.map(l=>[...l])
const d=[[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]]
const s=(a,b,c,d)=>['MAS','SAM'].some(p=>[...p].every((x,k)=>(g[a+k*c]?.[b+k*d]??'')==x))
console.log(
  g.flatMap((r,i)=>r.map((_,j)=>d.filter(([x,y])=>[..."XMAS"].every((c,k)=>(g[i+k*x]?.[j+k*y]??'')==c)).length)).reduce((a,b)=>a+b),
  g.slice(1,-1).flatMap((r,i)=>r.slice(1,-1).map((c,j)=>c=='A'&&[[[-1,-1],[1,1],[-1,1],[1,-1]]].some(([l,r,t,b])=>
    s(i+1+l[0],j+1+l[1],(r[0]-l[0])/2,(r[1]-l[1])/2)&&s(i+1+t[0],j+1+t[1],(b[0]-t[0])/2,(b[1]-t[1])/2))?1:0)).reduce((a,b)=>a+b)
)