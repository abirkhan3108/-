const sb = (window.supabase && window.SUPABASE_URL.includes("supabase.co") && !window.SUPABASE_URL.includes("YOUR-"))
  ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;

const $=id=>document.getElementById(id);
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)}
function demoProfiles(){
  return [
    {id:1,name:"লেবু মণ্ডল",father:"—",mother:"—",spouse:"—",dob:"—",village:"—",post:"—",police:"—",district:"—",mobile:"—",address:"—",created_at:new Date().toISOString()},
    {id:2,name:"রিয়াজউদ্দিন",father:"—",mother:"—",spouse:"—",dob:"—",village:"—",post:"—",police:"—",district:"—",mobile:"—",address:"—",created_at:new Date().toISOString()}
  ];
}
async function getStats(){
  let data=[];
  if(sb){const r=await sb.from("profiles").select("id,created_at"); if(!r.error)data=r.data||[];}
  else data=JSON.parse(localStorage.getItem("demoProfiles")||"null")||demoProfiles();
  $("totalProfiles").textContent=data.length;
  const now=new Date(), y=now.getFullYear(), m=now.getMonth();
  $("monthlyProfiles").textContent=data.filter(x=>{const d=new Date(x.created_at);return d.getFullYear()===y&&d.getMonth()===m}).length;
}
async function search(){
  const q=$("searchInput").value.trim();
  if(!q){toast("একটি নাম লিখুন");return}
  let rows=[];
  if(sb){
    const r=await sb.from("profiles").select("*").ilike("name",`%${q}%`).order("name");
    if(r.error){toast("Database সংযোগ পরীক্ষা করুন");return} rows=r.data||[];
  }else rows=(JSON.parse(localStorage.getItem("demoProfiles")||"null")||demoProfiles()).filter(x=>x.name.includes(q));
  localStorage.setItem("lastSearch",JSON.stringify({name:rows[0]?.name||q,time:new Date().toISOString()}));
  renderResults(rows,q); renderLast();
}
function renderResults(rows,q){
  const el=$("results"); el.classList.remove("hidden");
  if(!rows.length){el.innerHTML=`<h3>সার্চ ফলাফল</h3><p>“${escapeHtml(q)}” নামে কোনো প্রোফাইল পাওয়া যায়নি।</p>`;return}
  el.innerHTML=`<h3>সার্চ ফলাফল (${rows.length})</h3><div class="profile-list">${rows.map((p,i)=>`<div class="profile-item" onclick="showProfile(${i})"><strong>${escapeHtml(p.name||"নাম নেই")}</strong><small>${escapeHtml(p.address||p.village||"ঠিকানা দেওয়া নেই")}</small></div>`).join("")}</div>`;
  window._rows=rows;
}
function showProfile(i){
  const p=window._rows[i], el=$("results");
  const fields=[["পিতা/স্বামীর নাম",p.father||p.spouse],["গ্রাম",p.village],["বয়স",p.age],["মৃত্যুর কারণ",p.death_reason],["তারিখ",p.date||p.death_date]];
  const photo=p.photo_url||"";
  el.innerHTML=`<button onclick="search()" class="primary" style="height:42px;margin-bottom:15px">← ফলাফলে ফিরুন</button>
  <div class="profile-header">
    <div class="profile-info"><h3>👤 ${escapeHtml(p.name||"")}</h3>
      <div class="detail">${fields.map(([a,b])=>`<div><b>${a}</b>${escapeHtml(b||"—")}</div>`).join("")}</div>
    </div>
    <div class="profile-photo">${photo?`<img src="${escapeHtml(photo)}" alt="Profile Photo">`:"<span>📷<br>ফটো</span>"}</div>
  </div>`;
}
function renderLast(){const x=JSON.parse(localStorage.getItem("lastSearch")||"null");if(!x)return;$("lastSearch").textContent=x.name;$("lastSearchTime").textContent=new Date(x.time).toLocaleString("bn-BD");}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
$("searchBtn").onclick=search;$("searchInput").addEventListener("keydown",e=>{if(e.key==="Enter")search()});
$("adminBtn").onclick=()=>location.href="admin.html";
$("historyBtn").onclick=()=>toast("সার্চ হিস্টরি শিগগিরই যুক্ত হবে");
$("infoBtn").onclick=()=>toast("Profile Search App");
renderLast();getStats();