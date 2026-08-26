const sb=(window.supabase&&window.SUPABASE_URL.includes("supabase.co")&&!window.SUPABASE_URL.includes("YOUR-"))
?window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY):null;
const loginSection=document.getElementById("loginSection"),adminPanel=document.getElementById("adminPanel");
const loginForm=document.getElementById("loginForm"),loginMsg=document.getElementById("loginMsg");
const form=document.getElementById("profileForm"),msg=document.getElementById("adminMsg");
const photoFile=document.getElementById("photoFile");

async function refreshAuth(){
 if(!sb){loginSection.classList.add("hidden");adminPanel.classList.remove("hidden");return}
 const {data}=await sb.auth.getSession();
 if(data.session){loginSection.classList.add("hidden");adminPanel.classList.remove("hidden")}
 else{loginSection.classList.remove("hidden");adminPanel.classList.add("hidden")}
}
loginForm.addEventListener("submit",async e=>{
 e.preventDefault();
 if(!sb){loginMsg.textContent="Supabase config বসালে Login চালু হবে";return}
 const {error}=await sb.auth.signInWithPassword({email:document.getElementById("email").value,password:document.getElementById("password").value});
 loginMsg.textContent=error?"❌ "+error.message:"✅ Login সফল";
 if(!error) refreshAuth();
});
document.getElementById("logoutBtn").onclick=async()=>{if(sb)await sb.auth.signOut();refreshAuth()};

async function uploadPhoto(file){
 if(!file)return null;
 if(file.size>5*1024*1024)throw new Error("ছবির সাইজ ৫ MB-এর মধ্যে রাখুন");
 const ext=(file.name.split(".").pop()||"jpg").toLowerCase(),path=`profiles/${crypto.randomUUID()}.${ext}`;
 const {error}=await sb.storage.from("profile-photos").upload(path,file,{upsert:false,contentType:file.type});
 if(error)throw error;
 return sb.storage.from("profile-photos").getPublicUrl(path).data.publicUrl;
}
form.addEventListener("submit",async e=>{
 e.preventDefault();msg.textContent="সংরক্ষণ করা হচ্ছে...";
 try{
  const x=Object.fromEntries(new FormData(form).entries());delete x.photoFile;x.created_at=new Date().toISOString();
  if(sb){x.photo_url=await uploadPhoto(photoFile.files[0]);const {error}=await sb.from("profiles").insert(x);if(error)throw error}
  else{let a=JSON.parse(localStorage.getItem("demoProfiles")||"null")||[];x.id=Date.now();x.photo_url=null;a.push(x);localStorage.setItem("demoProfiles",JSON.stringify(a))}
  form.reset();msg.textContent="✅ Profile সফলভাবে যোগ হয়েছে";
 }catch(err){msg.textContent="❌ "+err.message}
});
refreshAuth();
async function loadProfiles(q=""){
 if(!sb){renderAdminProfiles(JSON.parse(localStorage.getItem("demoProfiles")||"null")||[]);return}
 let query=sb.from("profiles").select("*").order("created_at",{ascending:false});
 if(q) query=query.ilike("name",`%${q}%`);
 const {data,error}=await query;
 if(error){document.getElementById("adminProfiles").innerHTML=`<p>❌ ${error.message}</p>`;return}
 renderAdminProfiles(data||[]);
}
function renderAdminProfiles(rows){
 document.getElementById("adminProfiles").innerHTML=rows.length?rows.map(p=>`
 <div class="profile-item">
   <strong>${escapeAdmin(p.name)}</strong>
   <small>${escapeAdmin(p.village||"")} · ${escapeAdmin(p.age||"")} বছর</small>
   <div style="display:flex;gap:8px;margin-top:10px">
    <button class="primary" onclick="editProfile(${p.id})">✏️ Edit</button>
    <button class="primary" style="background:#d7263d" onclick="deleteProfile(${p.id})">🗑️ Delete</button>
   </div>
 </div>`).join(""):"<p>কোনো Profile পাওয়া যায়নি।</p>";
}
function escapeAdmin(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
async function editProfile(id){
 let p;
 if(sb){const r=await sb.from("profiles").select("*").eq("id",id).single();if(r.error){alert(r.error.message);return}p=r.data}
 else p=(JSON.parse(localStorage.getItem("demoProfiles")||"null")||[]).find(x=>x.id===id);
 if(!p)return;
 const name=prompt("নাম:",p.name||""); if(name===null)return;
 const father=prompt("পিতা/স্বামীর নাম:",p.father||""); if(father===null)return;
 const village=prompt("গ্রাম:",p.village||""); if(village===null)return;
 const age=prompt("বয়স:",p.age||""); if(age===null)return;
 const death_reason=prompt("মৃত্যুর কারণ:",p.death_reason||""); if(death_reason===null)return;
 const date=prompt("তারিখ:",p.date||""); if(date===null)return;
 const updates={name,father,village,age:age?Number(age):null,death_reason,date};
 if(sb){const r=await sb.from("profiles").update(updates).eq("id",id);if(r.error){alert(r.error.message);return}}
 else{let a=JSON.parse(localStorage.getItem("demoProfiles")||"null")||[];a=a.map(x=>x.id===id?{...x,...updates}:x);localStorage.setItem("demoProfiles",JSON.stringify(a))}
 loadProfiles(document.getElementById("adminSearch").value.trim());
}
async function deleteProfile(id){
 if(!confirm("এই Profile-টি স্থায়ীভাবে Delete করবেন?"))return;
 if(sb){const r=await sb.from("profiles").delete().eq("id",id);if(r.error){alert(r.error.message);return}}
 else{let a=JSON.parse(localStorage.getItem("demoProfiles")||"null")||[];a=a.filter(x=>x.id!==id);localStorage.setItem("demoProfiles",JSON.stringify(a))}
 loadProfiles(document.getElementById("adminSearch").value.trim());
}
document.getElementById("adminSearchBtn").onclick=()=>loadProfiles(document.getElementById("adminSearch").value.trim());
document.getElementById("adminSearch").addEventListener("keydown",e=>{if(e.key==="Enter")loadProfiles(e.target.value.trim())});
const oldRefresh=refreshAuth;
refreshAuth=async function(){await oldRefresh();if(!adminPanel.classList.contains("hidden"))loadProfiles()};

async function updateDashboardStats(){
 let rows=[];
 if(sb){const r=await sb.from("profiles").select("created_at");if(!r.error)rows=r.data||[]}
 else rows=JSON.parse(localStorage.getItem("demoProfiles")||"null")||[];
 const now=new Date();
 const month=rows.filter(x=>{const d=new Date(x.created_at);return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()}).length;
 const t=document.getElementById("dashTotal"),m=document.getElementById("dashMonthly");
 if(t)t.textContent=rows.length;if(m)m.textContent=month;
}
const originalLoadProfiles=loadProfiles;
loadProfiles=async function(q=""){await originalLoadProfiles(q);updateDashboardStats()};
const originalRefreshAuth=refreshAuth;
refreshAuth=async function(){await originalRefreshAuth();if(!adminPanel.classList.contains("hidden")){loadProfiles();updateDashboardStats()}};
