const $=id=>document.getElementById(id);
let S={age:32,ret:60,income:1200000,dep:2,kids:1,edu:1500000,goals:500000,liab:2500000,assets:800000,cover:0,share:70,budget:6,smoker:"no",risk:"moderate"};
let step=1,prodId=null,custom={cover:null,tenure:null},scen={drop:false,kid:false},chart=null,booking=null;
const A={infl:6,ret:8}; // assumptions: inflation 6%, investment return 8%
const fmt=n=>n>=1e7?"₹"+(n/1e7).toFixed(2)+" Cr":n>=1e5?"₹"+(n/1e5).toFixed(1)+" L":"₹"+Math.round(n).toLocaleString("en-IN");
// ---------- engine ----------
function calc(s){const r=(1+A.ret/100)/(1+A.infl/100)-1,n=Math.max(s.ret-s.age,0);
 const pv=x=>r===0?x*n:x*(1-Math.pow(1+r,-n))/r;
 const replacement=s.dep>0?pv(s.income*s.share/100):0, goals=s.kids*s.edu+s.goals, hlv=pv(s.income*0.7);
 const needs=replacement+s.liab+goals, resources=s.assets+s.cover, net=Math.max(0,needs-resources);
 return {replacement,liab:s.liab,goals,resources,needs,net,hlv,rec:Math.ceil(net/500000)*500000,n,mult:s.income?net/s.income:0}}
function eff(){const s={...S};if(scen.drop)s.income*=0.8;if(scen.kid){s.kids+=1;s.dep+=1}return s}
const PRODS=[
 {id:"term",name:"Term Life",tag:"Pure protection, lowest cost"},
 {id:"whole",name:"Whole Life",tag:"Lifelong cover, higher premium"},
 {id:"endow",name:"Endowment",tag:"Cover + guaranteed-style savings"},
 {id:"ulip",name:"ULIP",tag:"Cover + market-linked investment"}];
function prem(id,cover,t,s){const f=Math.pow(1.07,s.age-30)*(s.smoker==="yes"?1.6:1),c=cover/1e7;
 return id==="term"?c*9000*f*(1+0.01*(t-25)):id==="whole"?c*55000*Math.pow(f,.6)*Math.sqrt(25/t):id==="endow"?c*450000*(1+0.005*(s.age-30)):cover/10}
function maturity(id,p,t){return id==="endow"?p*(Math.pow(1.045,t)-1)/.045:id==="ulip"?p*.9*(Math.pow(1.08,t)-1)/.08:0}
function match(s,c){const t=Math.min(Math.max(s.ret-s.age,5),30),bud=s.income*s.budget/100,wantSave=c.goals>0;
 return PRODS.map(p=>{const pr=prem(p.id,c.rec,t,s),ok=pr<=bud;let sc,why;
  if(p.id==="term"){sc=70+(ok?20:-10)+(wantSave?0:10);why="Cheapest way to cover the full gap"+(ok?", and it fits your budget.":", but check your budget.")}
  if(p.id==="whole"){sc=40+(ok?10:-20)+(s.risk==="low"?10:0)+(s.age<45?5:0);why="Lifelong cover for legacy planning; costs far more per ₹ of cover."}
  if(p.id==="endow"){sc=30+(ok?10:-30)+(s.risk==="low"?25:0)+(wantSave?15:0);why="Suits low-risk savers with fixed goals; cover per premium is small."}
  if(p.id==="ulip"){sc=25+(ok?10:-40)+(s.risk==="high"?30:s.risk==="moderate"?10:-10)+(wantSave?10:0);why="Market-linked growth for higher-risk investors; returns are not guaranteed."}
  return {...p,score:sc,prem:pr,ok,why,t}}).sort((a,b)=>b.score-a.score)}
// ---------- UI ----------
const FIELDS=[["age","Your age","number"],["ret","Planned retirement age","number"],["income","Annual income (₹)","number"],["dep","People who depend on you","number"],["kids","Children (education goal)","number"],["edu","Education cost per child (today's ₹)","number"],["goals","Other goals: marriage, home… (₹)","number"],["liab","Outstanding loans (₹)","number"],["assets","Savings & investments (₹)","number"],["cover","Existing life cover (₹)","number"],["share","Share of income family depends on (%)","number"],["budget","Premium budget (% of income)","number"]];
function steps(){$("steps").innerHTML=["1 Profile","2 Your cover","3 Choose plan","4 Advisor"].map((t,i)=>`<div class="${i+1===step?"on":i+1<step?"done":""}">${t}</div>`).join("")}
function go(n){step=n;render();window.scrollTo({top:0,behavior:"smooth"})}
function render(){steps();[null,s1,s2,s3,s4][step]()}
function s1(){$("view").innerHTML=`<div class="card"><h2>Tell us about you</h2><div class="grid">${FIELDS.map(f=>`<label>${f[1]}<input type="number" min="0" data-k="${f[0]}" value="${S[f[0]]}"></label>`).join("")}
<label>Do you smoke?<select data-k="smoker"><option value="no">No</option><option value="yes">Yes</option></select></label>
<label>Risk appetite<select data-k="risk"><option value="low">Low – safety first</option><option value="moderate">Moderate</option><option value="high">High – growth</option></select></label></div>
<p id="err" class="mu" role="alert"></p><div class="row"><span class="mu">Nothing leaves your device.</span><button id="next">Calculate my cover →</button></div></div>`;
 document.querySelectorAll("[data-k]").forEach(e=>{if(e.tagName==="SELECT")e.value=S[e.dataset.k]});
 $("next").onclick=()=>{let bad="";document.querySelectorAll("[data-k]").forEach(e=>{const k=e.dataset.k;S[k]=e.tagName==="SELECT"?e.value:Number(e.value);if(e.type==="number"&&(isNaN(S[k])||S[k]<0))bad="Please enter valid, non-negative numbers."});
  if(S.age<18||S.age>65)bad="Age must be between 18 and 65.";else if(S.ret<=S.age)bad="Retirement age must be above your current age.";else if(S.share>100||S.budget>100)bad="Percentages must be 100 or less.";else if(S.income<=0)bad="Income must be above zero.";
  if(bad){$("err").textContent=bad;$("err").style.color="var(--red)";return}go(2)}}
function s2(){const s=eff(),c=calc(s),base=calc(S);
 $("view").innerHTML=`<div class="card"><p class="mu">Recommended life cover</p><div class="big">${fmt(c.rec)}</div>
 <p>That is about <b>${c.mult.toFixed(1)}×</b> your annual income. ${c.rec===0?"Your assets and existing cover already meet your estimated needs.":""}</p>
 <p class="mu">Cross-check: Human Life Value (future income you'd earn until ${S.ret}, after 30% personal spending) = <b>${fmt(c.hlv)}</b>.</p>
 <div style="position:relative;height:280px"><canvas id="ch" aria-label="Breakdown of cover needs"></canvas></div>
 <div class="tw"><table><tbody><tr><td>Income replacement for ${c.n} years</td><td>${fmt(c.replacement)}</td></tr><tr><td>Loans to clear</td><td>${fmt(c.liab)}</td></tr><tr><td>Future goals</td><td>${fmt(c.goals)}</td></tr><tr><td>Less: savings + existing cover</td><td>− ${fmt(c.resources)}</td></tr><tr><td><b>Coverage gap (Net Needs)</b></td><td><b>${fmt(c.net)}</b></td></tr></tbody></table></div>
 <div class="note">Method: Net Needs = replacement + loans + goals − resources. Income is replaced over the years to retirement at ${A.ret}% return vs ${A.infl}% inflation (real rate ${(((1+A.ret/100)/(1+A.infl/100)-1)*100).toFixed(2)}%). Goals are in today's money.</div>
 <h3>What if…?</h3><label style="display:inline"><input type="checkbox" id="sd" style="width:auto" ${scen.drop?"checked":""}> income drops 20%</label> &nbsp; <label style="display:inline"><input type="checkbox" id="sk" style="width:auto" ${scen.kid?"checked":""}> we have another child</label>
 <p class="mu">${scen.drop||scen.kid?`Change vs your base case: ${c.rec>=base.rec?"+":"−"}${fmt(Math.abs(c.rec-base.rec))}`:"Tick a scenario to see how the cover changes."}</p>
 <div class="row"><button class="sec" onclick="go(1)">← Edit profile</button><button onclick="go(3)">See matching plans →</button></div></div>`;
 $("sd").onchange=e=>{scen.drop=e.target.checked;render()};$("sk").onchange=e=>{scen.kid=e.target.checked;render()};
 if(chart)chart.destroy();chart=new Chart($("ch"),{type:"bar",data:{labels:["Income replacement","Loans","Goals","Savings + cover","Gap to insure"],datasets:[{data:[c.replacement,c.liab,c.goals,-c.resources,c.net],backgroundColor:["#0d9488","#f59e0b","#6366f1","#94a3b8","#dc2626"]}]},options:{maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:x=>fmt(Math.abs(x.raw))}}},scales:{y:{ticks:{callback:v=>fmt(Math.abs(v))}}}}})}
function s3(){const s=eff(),c=calc(s),list=match(s,c);if(!prodId)prodId=list[0].id;
 const cur=list.find(p=>p.id===prodId),cover=custom.cover??c.rec,t=custom.tenure??cur.t,pr=prem(prodId,cover,t,s),bud=s.income*s.budget/100,mat=maturity(prodId,pr,t);
 $("view").innerHTML=`<div class="card"><h2>Plans matched to you</h2>${list.map((p,i)=>`<div class="prod ${p.id===prodId?"sel":""}" tabindex="0" role="button" data-p="${p.id}"><b>${p.name}</b>${i===0?'<span class="badge">Best fit</span>':""} <span class="mu">${p.tag}</span><br><span class="mu">${p.why}</span><br>From ${fmt(p.prem)}/yr for ${fmt(c.rec)} cover ${p.ok?"✅ in budget":"⚠️ above budget"}</div>`).join("")}</div>
 <div class="card"><h3>Tweak: ${cur.name}</h3><label>Cover: <b>${fmt(cover)}</b><input type="range" id="cv" min="500000" max="${Math.max(c.rec*2,2e7)}" step="500000" value="${cover}"></label>
 <label>Policy term: <b>${t} years</b><input type="range" id="tn" min="5" max="40" value="${t}"></label>
 <p class="big">${fmt(pr)}<span class="mu"> / year (${fmt(pr/12)} / month)</span></p>
 <div class="meter" aria-hidden="true"><i style="width:${Math.min(100,pr/bud*100)}%;background:${pr<=bud?"var(--grn)":"var(--red)"}"></i></div>
 <p class="mu">${(pr/s.income*100).toFixed(1)}% of income · budget ${fmt(bud)}/yr · ${pr<=bud?"within budget":"over budget: lower the cover or choose Term"}</p>
 ${mat?`<p>Illustrative maturity value after ${t} years: <b>${fmt(mat)}</b> <span class="mu">(assumed ${prodId==="endow"?"4.5":"8"}% growth, not guaranteed)</span></p>`:""}
 <div class="row"><button class="sec" onclick="go(2)">← Back</button><button onclick="go(4)">Talk to an advisor →</button></div></div>`;
 document.querySelectorAll("[data-p]").forEach(e=>{e.onclick=()=>{prodId=e.dataset.p;custom={cover:null,tenure:null};render()};e.onkeydown=k=>{if(k.key==="Enter")e.click()}});
 $("cv").oninput=e=>{custom.cover=+e.target.value;render();$("cv").focus()};$("tn").oninput=e=>{custom.tenure=+e.target.value;render();$("tn").focus()}}
function s4(){const s=eff(),c=calc(s),p=PRODS.find(x=>x.id===prodId)||PRODS[0],cover=custom.cover??c.rec;
 const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()+i+1);return d.toISOString().slice(0,10)});
 if(booking){$("view").innerHTML=`<div class="card"><h2>✅ Consultation booked (simulated)</h2><p>Reference <b>${booking.ref}</b></p><p>${booking.name}, your ${booking.mode} session with <b>${booking.adv}</b> is on ${booking.date} at ${booking.slot}.</p><p class="mu">Bring: ${p.name}, cover ${fmt(cover)}. This is a demo — no real booking was made.</p><div class="row"><button class="sec" onclick="booking=null;go(1)">Start over</button><button onclick="window.print()">Print summary</button></div></div>`;return}
 $("view").innerHTML=`<div class="card"><h2>Book an advisor</h2><p class="mu">Your plan: ${p.name} · cover ${fmt(cover)} · gap ${fmt(c.net)}</p><div class="grid">
 <label>Advisor<select id="ad"><option>Ananya Rao – Protection planning</option><option>Vikram Shah – Savings &amp; ULIPs</option><option>Meera Iyer – Family &amp; legacy</option></select></label>
 <label>Mode<select id="md"><option>video</option><option>chat</option></select></label>
 <label>Date<select id="dt">${days.map(d=>`<option>${d}</option>`).join("")}</select></label>
 <label>Time<select id="sl"><option>10:00 AM</option><option>12:00 PM</option><option>3:00 PM</option><option>6:00 PM</option></select></label>
 <label>Your name<input id="nm"></label><label>Mobile number<input id="ph" inputmode="numeric" maxlength="10"></label></div>
 <p id="er" class="mu" role="alert"></p><div class="row"><button class="sec" onclick="go(3)">← Back</button><button id="bk">Confirm booking</button></div></div>`;
 $("bk").onclick=()=>{const nm=$("nm").value.trim(),ph=$("ph").value.trim();if(nm.length<2||!/^[6-9]\d{9}$/.test(ph)){$("er").textContent="Enter your name and a valid 10-digit Indian mobile number.";$("er").style.color="var(--red)";return}
  booking={name:nm,adv:$("ad").value.split(" – ")[0],mode:$("md").value,date:$("dt").value,slot:$("sl").value,ref:"SN"+Math.random().toString(36).slice(2,8).toUpperCase()};
  try{localStorage.setItem("securenest_booking",JSON.stringify({...booking,ph:"******"+ph.slice(-4)}))}catch(e){}render()}}
render();
