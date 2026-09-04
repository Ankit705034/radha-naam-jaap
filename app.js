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
  {id:'gita',title:'श्रीमद्भगवद्गीता',snippet:'कर्म, ज्ञान और भक्ति का मार्ग',chapters:['अर्जुन विषाद योग','सांख्य योग','कर्म योग','ज्ञान कर्म संन्यास योग','कर्म संन्यास योग','ध्यान योग','ज्ञान विज्ञान योग','अक्षर ब्रह्म योग','राजविद्या राजगुह्य योग','विभूति योग','विश्वरूप दर्शन योग','भक्ति योग','क्षेत्र-क्षेत्रज्ञ विभाग योग','गुणत्रय विभाग योग','पुरुषोत्तम योग','दैवासुर संपद विभाग योग','श्रद्धात्रय विभाग योग','मोक्ष संन्यास योग'].map((title,index)=>({title,summary:`अध्याय ${index+1} में जीवन, कर्तव्य और आत्मज्ञान के विषय पर भगवान श्रीकृष्ण का मार्गदर्शन।`}))},
  {id:'ramcharitmanas',title:'रामचरितमानस',snippet:'मर्यादा, भक्ति और आदर्श जीवन',chapters:['बालकांड','अयोध्याकांड','अरण्यकांड','किष्किंधाकांड','सुंदरकांड','लंकाकांड','उत्तरकांड'].map((title,index)=>({title,summary:`${title} में श्रीराम के चरित्र, धर्म और भक्तिभाव का प्रेरक प्रसंग।`}))},
  {id:'bhagavat',title:'श्रीमद्भागवत महापुराण',snippet:'प्रेमभक्ति और भगवान की कथाएँ',chapters:['प्रथम स्कंध: कथा की भूमिका','द्वितीय स्कंध: विराट स्वरूप','तृतीय स्कंध: सृष्टि और कपिल ज्ञान','चतुर्थ स्कंध: ध्रुव और प्रह्लाद भक्ति','पंचम स्कंध: ऋषभदेव और लोक वर्णन','षष्ठ स्कंध: अजामिल और नामस्मरण','सप्तम स्कंध: प्रह्लाद चरित्र','अष्टम स्कंध: गजेन्द्र और समुद्र मंथन','नवम स्कंध: राजर्षियों की वंशपरंपरा','दशम स्कंध: श्रीकृष्ण लीला','एकादश स्कंध: उद्धव गीता','द्वादश स्कंध: कलियुग और उपसंहार'].map((title,index)=>({title,summary:`स्कंध ${index+1} का सार: भक्ति, सदाचार और ईश्वर-स्मरण से जीवन को पवित्र बनाने का संदेश।`}))},
  {id:'vishnu-purana',title:'विष्णु पुराण',snippet:'धर्म, सृष्टि और विष्णु भक्ति',chapters:['सृष्टि और प्रकृति','पृथ्वी और लोकों का वर्णन','राजवंश और मन्वंतर','धर्म और आश्रम व्यवस्था','श्रीकृष्ण चरित','प्रलय और मुक्ति'].map((title,index)=>({title,summary:`भाग ${index+1} में ${title} से जुड़े धर्म, ज्ञान और भक्ति के प्रसंग।`}))},
  {id:'hanuman-charit',title:'श्री हनुमान चरित',snippet:'सेवा, साहस और रामनाम की शक्ति',chapters:['जन्म और बाललीला','सूर्यदेव से शिक्षा','श्रीराम से प्रथम मिलन','सीता माता की खोज','लंका में भक्ति और पराक्रम','संजीवनी और सेवा','राम विजय में योगदान','अखंड रामभक्ति'].map((title,index)=>({title,summary:`अध्याय ${index+1} में ${title} के माध्यम से निष्ठा, विनम्रता और सेवा का संदेश।`}))}
];
const beads=$('#beads');
const beadRadius=Math.min(window.innerWidth*.31,120);
for(let i=0;i<108;i++){
  const b=document.createElement('i');
  b.className='bead';
  b.style.transform=`translate(-50%,-50%) rotate(${i*360/108}deg) translateY(-${beadRadius}px)`;
  beads.append(b);
}
function ensureMalaView(){
  const view=document.createElement('section');
  view.id='malaView';
  view.className='view-panel mala-view';
  view.hidden=true;
  view.innerHTML='<b>साधना का क्रम</b><h2>माला डैशबोर्ड</h2><div class="mala-summary"><article><strong id="malaTodayValue">0</strong><small>आज पूरी माला</small></article><article><strong id="malaCurrentValue">0/108</strong><small>वर्तमान माला</small></article><article><strong id="malaLifetimeValue">0</strong><small>कुल माला</small></article></div><button class="manual-mala-btn" id="manualMalaBtn">＋ भौतिक माला जोड़ें</button><section class="mala-progress"><span>वर्तमान माला <b id="malaPercent">0%</b></span><i><em id="malaProgressBar"></em></i><small id="malaRemaining">108 जाप बाकी</small></section><div class="mala-history-head"><strong>दैनिक साधना</strong><small>तारीख के अनुसार विवरण</small></div><div id="malaHistory" class="mala-history"></div>';
  $('#granthView').before(view);
  const dialog=document.createElement('dialog');
  dialog.id='manualMalaDialog';
  dialog.innerHTML='<form method="dialog" id="manualMalaForm"><button value="cancel">×</button><b>भौतिक माला जोड़ें</b><h2>आज की पूरी हुई माला</h2><label>माला की संख्या<input id="manualMalaInput" type="number" min="1" step="1" value="1" inputmode="numeric"></label><small>हर माला में 108 जाप जुड़ेंगे।</small><button>जाप में जोड़ें</button></form>';
  document.body.append(dialog);
  $('#manualMalaBtn').onclick=()=>{
    $('#manualMalaInput').value=1;
    dialog.showModal();
  };
  $('#manualMalaForm').onsubmit=(event)=>{
    event.preventDefault();
    const malas=Number($('#manualMalaInput').value);
    if(!Number.isInteger(malas)||malas<1){toast('माला की संख्या डालें');return}
    S.entries[day()]=(S.entries[day()]||0)+(malas*108);
    save();
    render();
    dialog.close();
    toast(`${malas} भौतिक माला दर्ज हुई`);
  };
}

function renderBooks(){
  document.querySelectorAll('#granthView > b, #granthView > h2').forEach((heading)=>heading.remove());
  const list=$('#bookList');
  list.innerHTML=books.map(book=>`<button class="book-card" data-book="${book.id}"><strong>${book.title}</strong><small>${book.chapters.length} अध्याय · ${book.snippet}</small></button>`).join('');
  list.querySelectorAll('.book-card').forEach((btn)=>{
    btn.onclick=()=>{
      const book=books.find(b=>b.id===btn.dataset.book);
      $('#readerTitle').textContent=book.title;
      $('#readerContent').innerHTML=book.chapters.map((chapter,index)=>`<article class="chapter"><h3>${index+1}. ${chapter.title}</h3><p>${chapter.summary}</p><strong>विस्तृत सार</strong><p>${chapter.detail||`${chapter.title} का यह भाग साधना, धर्म और आत्मचिंतन को समझने का अवसर देता है। इसे धीरे-धीरे पढ़कर अपने जीवन में इसके संदेश पर विचार करें।`}</p></article>`).join('');
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
  const completedMalas=Math.floor(n/108);
  const currentJaps=n%108;
  $('#malaCount').textContent=completedMalas;
  $('#malaTodayValue').textContent=completedMalas;
  $('#malaCurrentValue').textContent=`${currentJaps}/108`;
  $('#malaLifetimeValue').textContent=Math.floor(t/108);
  $('#malaPercent').textContent=`${((currentJaps/108)*100).toFixed(0)}%`;
  $('#malaProgressBar').style.width=`${(currentJaps/108)*100}%`;
  $('#malaRemaining').textContent=`${108-currentJaps} जाप बाकी`;
  const history=Object.entries(S.entries).sort(([a],[b])=>b.localeCompare(a));
  $('#malaHistory').innerHTML=history.length?history.map(([date,count])=>{const completed=Math.floor(count/108);const current=count%108;const formatted=new Intl.DateTimeFormat('hi-IN',{day:'numeric',month:'short',year:'numeric'}).format(new Date(`${date}T00:00:00`));return `<article class="mala-day"><div><strong>${formatted}</strong><small>${date===day()?'आज की साधना':'दैनिक jap विवरण'}</small></div><div class="mala-day-count"><b>${count.toLocaleString('hi-IN')}</b><small>जाप</small></div><div class="mala-day-meta"><span>${completed} माला पूरी</span><span>${current}/108 वर्तमान</span></div><i><em style="width:${current?current/108*100:completed?100:0}%"></em></i></article>`}).join(''):'<div class="mala-empty">अभी कोई दैनिक रिकॉर्ड नहीं है। जाप शुरू करें और आपका विवरण यहाँ दिखाई देगा।</div>';
  $('#ringCount').textContent=`${n%108}/108`;
  $('#progressText').textContent=`${p.toFixed(2)}%`;
  $('#progressBar').style.width=`${p}%`;
  $('#targetText').textContent='लक्ष्य '+S.target;
  document.querySelectorAll('.bead').forEach((b,i)=>b.classList.toggle('lit',i<n%108));
}
function setView(name){
  const map={jap:'japView',mala:'malaView',granth:'granthView',prasang:'prasangView'};
  const activeMap={jap:'japBtn',mala:'malaBtn',granth:'granthBtn',prasang:'prasangBtn'};
  const ids=['japView','malaView','granthView','prasangView','readerView'];
  ids.forEach((id)=>{
    const el=document.getElementById(id);
    if(!el) return;
    if(id==='readerView'){
      el.hidden=true;
      return;
    }
    el.hidden=id!==map[name];
    el.style.display=id===map[name]?'':'none';
  });
  document.querySelectorAll('.nav-btn').forEach((btn)=>btn.classList.toggle('active',btn.id===activeMap[name]));
}
$('#radheTap').onclick=()=>{
  S.entries[day()]=(S.entries[day()]||0)+1;
  save();
  render();
  const tapBtn=$('#radheTap');
  const float=tapBtn.querySelector('.radha-word');
  if(float){
    const existing=tapBtn.querySelectorAll('.float-word');
    if(existing.length >= 3){
      existing[0].remove();
    }
    const burst=document.createElement('span');
    burst.className='float-word';
    burst.textContent='राधा';
    tapBtn.appendChild(burst);
    setTimeout(()=>burst.remove(),3000);
    float.style.transform='translateY(-12px) scale(1.05)';
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
ensureMalaView();
renderBooks();
render();
setView('jap');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}

