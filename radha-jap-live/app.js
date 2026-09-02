const K='radha-jap-tracker-v3';
localStorage.removeItem('radha-jap-tracker-v2');
const S=JSON.parse(localStorage.getItem(K)||'{"entries":{},"target":20000000}');
const $=x=>document.querySelector(x);
const day=()=>new Date().toISOString().slice(0,10);
const save=()=>localStorage.setItem(K,JSON.stringify(S));
const toast=(msg)=>{
  const t=$('#toast');
  t.textContent=msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer=setTimeout(()=>t.classList.remove('show'),1700);
};
const books=[
  {id:'radha-bhakti',title:'राधा भक्ति',snippet:'श्री राधा के चरणों में मन को अर्पित करना',content:['राधा का स्मरण ही मन को शांति देता है।','हर नाम के साथ प्रेम का विस्तार होता है।','साधना में निरंतरता वही है जो आत्मा को उजला बनाती है।']},
  {id:'naam-sadhana',title:'नाम साधना',snippet:'अभ्यास से प्रगति, प्रगति से आनंद',content:['नाम जाप एक सरल, परंतु शक्तिशाली साधना है।','सारी थकान, चिंता और भ्रम नाम में विलीन हो जाते हैं।','नियमितता से मन की शुद्धि और एकाग्रता बढ़ती है।']},
  {id:'prem-prakash',title:'प्रेम प्रकाश',snippet:'भक्ति का सच्चा स्वरूप प्रेम है',content:['प्रेम बिना आचरण का अर्थ नहीं होता।','हर अभ्यासी को अपने अंदर शुद्धता और विनम्रता रखनी चाहिए।','जप का अर्थ केवल संख्या नहीं, भाव है।']}
];
const beads=$('#beads');
for(let i=0;i<108;i++){
  const b=document.createElement('i');
  b.className='bead';
  b.style.transform=`translate(-50%,-50%) rotate(${i*360/108}deg) translateY(-160px)`;
  beads.append(b);
}
function renderBooks(){
  const list=$('#bookList');
  list.innerHTML=books.map(book=>`<button class="book-card" data-book="${book.id}"><strong>${book.title}</strong><small>${book.snippet}</small></button>`).join('');
  list.querySelectorAll('.book-card').forEach((btn)=>{
    btn.onclick=()=>{
      const book=books.find(b=>b.id===btn.dataset.book);
      $('#readerTitle').textContent=book.title;
      $('#readerContent').innerHTML=`<p>${book.content.join('</p><p>')}</p>`;
      $('#granthView').hidden=true;
      $('#readerView').hidden=false;
    };
  });
}
function render(){
  const n=S.entries[day()]||0;
  const t=Object.values(S.entries).reduce((a,b)=>a+b,0);
  const p=Math.min(100,(t/S.target)*100||0);
  $('#todayTotal').textContent=n;
  $('#lifetimeTotal').textContent=t;
  $('#malaCount').textContent=Math.floor(n/108);
  $('#ringCount').textContent=`${n%108}/108`;
  $('#progressText').textContent=`${p.toFixed(2)}%`;
  $('#progressBar').style.width=`${p}%`;
  $('#targetText').textContent='लक्ष्य '+S.target;
  document.querySelectorAll('.bead').forEach((b,i)=>b.classList.toggle('lit',i<n%108));
}
function setView(name){
  const map={jap:'japView',mala:'japView',granth:'granthView',prasang:'prasangView'};
  const activeMap={jap:'japBtn',mala:'malaBtn',granth:'granthBtn',prasang:'prasangBtn'};
  const ids=['japView','granthView','prasangView','readerView'];
  ids.forEach((id)=>{
    const el=document.getElementById(id);
    if(!el) return;
    if(id==='readerView'){
      el.hidden=true;
      return;
    }
    el.hidden = id !== map[name];
  });
  document.querySelectorAll('.nav-btn').forEach((btn)=>btn.classList.toggle('active',btn.id===activeMap[name]));
}
$('#radheTap').onclick=()=>{
  S.entries[day()]=(S.entries[day()]||0)+1;
  save();
  render();
  const float=$('#radheTap').querySelector('.radha-word');
  if(float){
    const burst=document.createElement('span');
    burst.className='float-word';
    burst.textContent='राधा';
    $('#radheTap').appendChild(burst);
    setTimeout(()=>burst.remove(),3000);
    float.style.transform='translateY(-12px) scale(1.08)';
    setTimeout(()=>float.style.transform='',180);
  }
  if('vibrate' in navigator) navigator.vibrate(20);
  toast('जप दर्ज हुआ');
};
function set(){
  $('#targetInput').value=S.target;
  $('#settingsDialog').showModal();
}
$('#settingsBtn').onclick=set;
$('#navSettings').onclick=set;
$('#settingsForm').onsubmit=(e)=>{
  e.preventDefault();
  S.target=Number($('#targetInput').value)||S.target;
  save();
  render();
  $('#settingsDialog').close();
  toast('लक्ष्य सुरक्षित');
};
$('#malaBtn').onclick=()=>setView('mala');
$('#granthBtn').onclick=()=>{
  if((S.entries[day()]||0)<108){toast('पहले 108 जाप पूरा करें');return}
  setView('granth');
};
$('#japBtn').onclick=()=>setView('jap');
$('#prasangBtn').onclick=()=>setView('prasang');
$('#backToBooks').onclick=()=>{
  $('#readerView').hidden=true;
  $('#granthView').hidden=false;
  $('#granthBtn').classList.add('active');
  $('#japBtn').classList.remove('active');
};
$('#exportBtn').onclick=()=>{
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(S)]));
  a.download='radha-jap-backup.json';
  a.click();
  toast('Backup तैयार');
};
$('#importBtn').onclick=()=>$('#importInput').click();
$('#importInput').onchange=async (e)=>{
  const file=e.target.files[0];
  if(!file) return;
  Object.assign(S,JSON.parse(await file.text()));
  save();
  render();
  toast('Data restored');
};
renderBooks();
render();
setView('jap');

