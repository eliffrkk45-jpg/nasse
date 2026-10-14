import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  firebaseReady, auth, googleProvider, signInWithPopup,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, loadProgress, saveProgress
} from "./firebase.js";
import "./style.css";

const topics = {
  "9": [
    { title:"Hücreyi tanı", desc:"Hücre zarı, sitoplazma, çekirdek ve temel organellerin görevlerini keşfet.", type:"bilgi", points:30 },
    { title:"Zarın seçiciliği", desc:"Hücre zarının madde alışverişindeki rolünü doğru örneklerle eşleştir.", type:"quiz", points:40 },
    { title:"Yapı ve görev", desc:"Nöronun hücresel bölümleriyle genel görevleri arasında bağ kur.", type:"quiz", points:40 }
  ],
  "10": [
    { title:"ATP istasyonu", desc:"Nöronun hangi faaliyetlerinde enerji gerektiğini belirle.", type:"quiz", points:40 },
    { title:"Enerji üretim merkezi", desc:"Hücresel solunumun ATP üretimiyle ilişkisini incele.", type:"quiz", points:40 },
    { title:"Enerji ve zar dengesi", desc:"İyon dağılımının korunmasında enerji kullanımını yorumla.", type:"quiz", points:50 }
  ],
  "11": [
    { title:"Reseptör avı", desc:"Uyaranları kemoreseptör, mekanoreseptör, termoreseptör, ağrı ve fotoreseptörlerle eşleştir.", type:"quiz", points:50 },
    { title:"Nöron mimarı", desc:"Miyelinli/miyelinsiz, duyu, ara ve motor nöronları ayırt et.", type:"quiz", points:50 },
    { title:"Kimyasal haberciler", desc:"Serotonin, dopamin, epinefrin ve norepinefrinle ilgili işlevleri incele.", type:"quiz", points:50 },
    { title:"Zar potansiyeli", desc:"Polarizasyon, depolarizasyon ve repolarizasyon sırasını öğren.", type:"quiz", points:60 },
    { title:"İmpuls yolu", desc:"Nöronda ve sinapsta impuls iletimini adım adım izle.", type:"quiz", points:60 },
    { title:"Glia destek ekibi", desc:"Mikroglia, oligodendrosit ve Schwann hücrelerinin görevlerini eşleştir.", type:"quiz", points:50 }
  ],
  final: [
    { title:"Final: Bir refleksin öyküsü", desc:"Bir yüzeyin sıcaklığını algılamadan elin geri çekilmesine kadar reseptör, duyu nöronu, omurilik, motor nöron, ATP ve sinaps bilgisini birlikte kullan.", type:"final", points:100 }
  ]
};

const questions = {
  "9": [
    { q:"Hücre zarının temel görevlerinden biri hangisidir?", a:["Hücreye giren ve çıkan maddeleri düzenlemek","ATP'nin tümünü tek başına üretmek","Genetik bilgiyi her zaman dışarı taşımak"], correct:0, why:"Hücre zarı seçici geçirgenliğiyle madde alışverişini düzenler." },
    { q:"Nöronun enerji ihtiyacı ve hücresel yapı ilişkisini en iyi hangisi açıklar?", a:["Hücre canlıdır; zar dengesini ve taşımayı sürdürmek için enerji kullanır","Nöron enerjiye ihtiyaç duymaz","Bütün enerji yalnızca çekirdekte üretilir"], correct:0, why:"Nöron da diğer hücreler gibi canlılığını sürdürmek için enerji kullanır." }
  ],
  "10": [
    { q:"ATP, nöronda hangi iş için önemlidir?", a:["İyon dağılımının korunmasına katkı sağlayan aktif taşıma","Işığı doğrudan sese dönüştürmek","DNA'yı hücre dışına taşımak"], correct:0, why:"İyon gradyanlarını sürdüren pompalar ATP kullanır." },
    { q:"Oksijenli hücresel solunumun temel sonuçlarından biri hangisidir?", a:["ATP üretimi","Nöronun miyelinsizleşmesi","Sinapsların ortadan kalkması"], correct:0, why:"Hücresel solunum, hücrenin kullanabildiği ATP'nin üretimine katkı sağlar." }
  ],
  "11": [
    { q:"Bir kokunun algılanmasında hangi reseptör tipi temel rol oynar?", a:["Kemoreseptör","Fotoreseptör","Mekanoreseptör"], correct:0, why:"Koku molekülleri kimyasal uyaranlardır." },
    { q:"Miyelin kılıfın önemli etkisi hangisidir?", a:["İmpuls iletimini hızlandırmaya yardımcı olmak","Nörotransmitterleri DNA'ya çevirmek","Hücre çekirdeğini yok etmek"], correct:0, why:"Miyelin, akson boyunca iletimin daha hızlı gerçekleşmesine yardımcı olur." },
    { q:"Dinlenim durumundaki zar potansiyelinden yükselişe geçiş hangi aşamadır?", a:["Depolarizasyon","Repolarizasyon","Sindirim"], correct:0, why:"Depolarizasyonda zar potansiyeli daha az negatif hale gelir." },
    { q:"Merkezi sinir sisteminde miyelin oluşturan hücre hangisidir?", a:["Oligodendrosit","Schwann hücresi","Mikroglia"], correct:0, why:"Oligodendrositler merkezi sinir sisteminde, Schwann hücreleri çevresel sinir sisteminde miyelin oluşturur." },
    { q:"Sinapsta kimyasal iletimde hangi yapı salınır?", a:["Nörotransmitter","Miyelin kılıf","Hücre duvarı"], correct:0, why:"Kimyasal sinapsta nörotransmitterler sinaptik aralığa salınır." }
  ],
  final: [
    { q:"Sıcak bir yüzeye dokunulduğunda elin hızla çekilmesini açıklayan en uygun sıra hangisidir?", a:["Isı/ağrı algısı → duyu nöronu → omurilikte ara nöron bağlantısı → motor nöron → kas yanıtı","Motor nöron → fotoreseptör → hücre çekirdeği → kas","ATP → kemoreseptör → Schwann hücresi → beyin olmadan her durumda bilinçli karar"], correct:0, why:"Refleks yayı, uyaranın algılanması ve omurilikte işlenmesiyle hızlı motor yanıt oluşmasını sağlar. Hücrelerin iyon dengesi ve iletimi sürdürmesi için ATP gerekir." },
    { q:"Bu olay sırasında ATP neden gereklidir?", a:["İyon gradyanlarının ve hücresel faaliyetlerin sürdürülmesine katkı sağlamak için","İmpulsun kimyasal enerji olmadan sonsuza kadar sürmesi için","Reseptörleri kemik hücresine dönüştürmek için"], correct:0, why:"Sinir hücreleri iyon dağılımını ve diğer yaşamsal faaliyetlerini sürdürmek için enerji kullanır." }
  ]
};

const state = {
  user:null, demo:false, progress:{ completed:[], points:0, level:"9" },
  currentLevel:"9", currentPage:"home", model:"neuron", quizIndex:0, quizSet:[],
  quizAnswered:false, selectedAnswer:null
};
const $ = (s) => document.querySelector(s);
const app = $("#app");

function safeText(value="") {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
function completedCount(){ return state.progress.completed?.length || 0; }
function isDone(id){ return (state.progress.completed || []).includes(id); }
function notify(message, bad=false){
  const el=$("#toast"); if(!el) return;
  el.textContent=message; el.className=`toast show ${bad?"bad":""}`;
  clearTimeout(notify.timer); notify.timer=setTimeout(()=>el.className="toast",3200);
}
function renderLogin(){
  app.innerHTML = `
  <main class="login-shell">
    <div class="login-glow glow-a"></div><div class="login-glow glow-b"></div>
    <section class="login-brand">
      <div class="brand-mark">N<span>+</span></div>
      <p class="eyebrow">LOS GALACTICOS SUNAR</p>
      <h1>Nasse <em>Biology</em></h1>
      <p class="login-lead">Bilimi yalnızca okuma.<br><strong>İçine gir, keşfet, deneyimle.</strong></p>
      <div class="login-visual"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="orbit-core">✦</div><span class="float-tag tag-one">HÜCRE</span><span class="float-tag tag-two">NÖRON</span><span class="float-tag tag-three">3B LAB</span></div>
      <p class="credit">Barış Köseoğlu</p>
    </section>
    <section class="auth-card">
      <div class="mobile-logo">NASSE <span>BIOLOGY</span></div>
      <p class="eyebrow">KEŞİF YOLCULUĞUNA KATIL</p>
      <h2>Laboratuvar seni bekliyor.</h2>
      <p class="muted">İlerlemeni kaydetmek için giriş yap.</p>
      ${firebaseReady ? `
        <button class="google-btn" id="google-login"><span class="google-g">G</span> Google ile devam et</button>
        <div class="or"><span></span>veya e-posta ile<span></span></div>
        <form id="auth-form">
          <label for="email">E-posta adresi</label><input id="email" type="email" placeholder="ornek@posta.com" required autocomplete="email"/>
          <label for="password">Şifre</label><input id="password" type="password" placeholder="En az 6 karakter" minlength="6" required autocomplete="current-password"/>
          <button class="primary-btn full" id="email-submit" type="submit">Giriş yap</button>
          <button class="text-btn" id="toggle-auth" type="button">Hesabın yok mu? Hesap oluştur</button>
        </form>` : `
        <div class="setup-note"><strong>Kurulum gerekiyor</strong><p>Google ve e-posta girişi için Firebase bilgilerini <code>.env</code> dosyasına ekle. Önce tasarımı denemek için aşağıdaki keşif modunu kullanabilirsin.</p></div>
        <button class="primary-btn full" id="demo-login">Keşif modunda aç</button>`}
      <p class="tiny-note">Eğitim amaçlıdır. Kişisel bilgilerini paylaşma.</p>
    </section>
  </main><div id="toast" class="toast"></div>`;
  if(firebaseReady){
    let createMode=false;
    $("#google-login").onclick=async()=>{try{await signInWithPopup(auth,googleProvider)}catch(e){notify(authError(e),true)}};
    $("#toggle-auth").onclick=()=>{createMode=!createMode;$("#email-submit").textContent=createMode?"Hesap oluştur":"Giriş yap";$("#toggle-auth").textContent=createMode?"Zaten hesabın var mı? Giriş yap":"Hesabın yok mu? Hesap oluştur";};
    $("#auth-form").onsubmit=async e=>{
      e.preventDefault(); const email=$("#email").value.trim(), password=$("#password").value;
      try { if(createMode) await createUserWithEmailAndPassword(auth,email,password); else await signInWithEmailAndPassword(auth,email,password); }
      catch(err){notify(authError(err),true)}
    };
  } else $("#demo-login").onclick=()=>{state.demo=true;state.user={uid:"demo",displayName:"Misafir kaşif",email:""};enterApp()};
}
function authError(e){
  const map={
    "auth/invalid-credential":"E-posta veya şifre doğru görünmüyor.",
    "auth/email-already-in-use":"Bu e-posta ile bir hesap zaten var.",
    "auth/weak-password":"Daha güçlü bir şifre seç (en az 6 karakter).",
    "auth/popup-closed-by-user":"Giriş penceresi kapatıldı.",
    "auth/unauthorized-domain":"Firebase Authentication ayarlarında bu site alan adına izin ver.",
    "auth/network-request-failed":"Bağlantını kontrol edip tekrar dene."
  };
  return map[e.code] || "Giriş sırasında bir sorun oluştu. Firebase ayarlarını kontrol et.";
}
function enterApp(){
  renderApp();
  if(state.user && !state.demo) loadProgress(state.user.uid).then(p=>{state.progress={completed:[],points:0,level:"9",...p};renderApp()}).catch(()=>notify("İlerleme bilgisi yüklenemedi.",true));
}
function renderApp(){
  const name=state.user?.displayName || state.user?.email?.split("@")[0] || "Kaşif";
  app.innerHTML=`
  <div class="app-shell">
    <aside class="sidebar" id="sidebar">
      <a class="side-brand" href="#" data-page="home"><span class="brand-mark small">N<span>+</span></span><span><b>Nasse</b><small>Biology</small></span></a>
      <div class="side-label">KEŞİF MENÜSÜ</div>
      <button class="nav-item ${state.currentPage==="home"?"active":""}" data-page="home"><span>⌂</span> Ana üs</button>
      <button class="nav-item ${state.currentPage==="lab"?"active":""}" data-page="lab"><span>◉</span> 3B laboratuvar <i class="nav-new">3B</i></button>
      <button class="nav-item ${state.currentPage==="missions"?"active":""}" data-page="missions"><span>✧</span> Görev merkezi</button>
      <button class="nav-item ${state.currentPage==="final"?"active":""}" data-page="final"><span>♜</span> Bağlam finali</button>
      <div class="side-bottom"><div class="side-user"><div class="avatar">${safeText(name.slice(0,1).toUpperCase())}</div><div class="user-meta"><b>${safeText(name)}</b><small>${state.demo?"Keşif modu":"Öğrenci hesabı"}</small></div><button id="logout" title="Çıkış yap">↗</button></div><p>Los Galacticos · Barış Köseoğlu</p></div>
    </aside>
    <main class="main-area">
      <header class="topbar"><button class="mobile-menu" id="mobile-menu">☰</button><div><p class="eyebrow">BİLİMİ KEŞFETMEYE DEVAM ET</p><h2>${pageHeading()}</h2></div><div class="top-stats"><span class="stat-pill">✦ ${state.progress.points||0} puan</span><span class="stat-pill">✓ ${completedCount()} görev</span></div></header>
      <div class="page-content">${pageContent()}</div>
    </main>
  </div><div id="toast" class="toast"></div>`;
  document.querySelectorAll("[data-page]").forEach(el=>el.onclick=e=>{e.preventDefault();state.currentPage=el.dataset.page;renderApp()});
  $("#logout").onclick=async()=>{if(!state.demo && auth) await signOut(auth);state.user=null;state.demo=false;renderLogin()};
  $("#mobile-menu").onclick=()=>$("#sidebar").classList.toggle("open");
  if(state.currentPage==="lab") setupLab();
  if(state.currentPage==="missions") wireMissions();
  if(state.currentPage==="final") wireFinal();
}
function pageHeading(){return ({home:"Keşif üssüne hoş geldin",lab:"3B keşif laboratuvarı",missions:"Görev merkezi",final:"Bağlam temelli final"})[state.currentPage]||"Nasse Biology"}
function pageContent(){
  if(state.currentPage==="lab") return labPage();
  if(state.currentPage==="missions") return missionsPage();
  if(state.currentPage==="final") return finalPage();
  return homePage();
}
function homePage(){
  const pct=Math.min(100,Math.round(completedCount()/13*100));
  return `<section class="welcome-banner"><div class="banner-copy"><span class="mini-chip">✦ KEŞİF BAŞLADI</span><h1>Sinir sisteminin<br><em>derinliklerine</em> yolculuk.</h1><p>Modeli incele, görevleri tamamla ve biyolojiyi bağlantılarıyla öğren.</p><button class="primary-btn" data-page="lab">3B laboratuvarı aç <span>↗</span></button></div><div class="banner-art"><div class="banner-ring ring-a"></div><div class="banner-ring ring-b"></div><div class="neuron-art"><span></span><i></i><b></b></div><div class="art-label label-a">NÖRON</div><div class="art-label label-b">SİNYAL AKTARIMI</div></div></section>
  <section class="stats-grid"><article class="metric-card"><span class="metric-icon mint">✧</span><p>Toplam puan</p><strong>${state.progress.points||0}</strong><small>Öğrendikçe yükselir</small></article><article class="metric-card"><span class="metric-icon blue">✓</span><p>Tamamlanan görev</p><strong>${completedCount()}</strong><small>Keşif yolculuğun</small></article><article class="metric-card"><span class="metric-icon violet">◉</span><p>İlerleme</p><strong>${pct}%</strong><div class="progress-track"><span style="width:${pct}%"></span></div></article></section>
  <section class="section-heading"><div><p class="eyebrow">ÖĞRENME YOLCULUĞU</p><h2>Sınıfını seç, keşfe başla</h2></div><span class="muted">9 → 10 → 11 → Final</span></section>
  <section class="level-grid">${levelCard("9","Hücreyi keşfet","Hücre yapısı, zar ve yapı-görev ilişkisi","leaf","level-blue")}${levelCard("10","Enerjiyi çöz","ATP, hücresel solunum ve enerji ihtiyacı","zap","level-green")}${levelCard("11","Sinir sistemini yönet","Reseptörler, nöronlar, impuls ve glia","brain","level-violet")}</section>
  <section class="section-heading"><div><p class="eyebrow">HIZLI ERİŞİM</p><h2>Bugün ne keşfedelim?</h2></div></section><section class="quick-grid"><button class="quick-card" data-page="lab"><span>◉</span><b>3B modeller</b><small>Dokun, döndür, incele</small><i>↗</i></button><button class="quick-card" data-page="missions"><span>✧</span><b>Görevleri çöz</b><small>Bilgini mini oyunlarla dene</small><i>↗</i></button><button class="quick-card" data-page="final"><span>♜</span><b>Bağlam finali</b><small>Konuları bir araya getir</small><i>↗</i></button></section>`;
}
function levelCard(level,title,desc,icon,cls){return `<button class="level-card ${cls}" data-level="${level}"><div class="level-top"><span class="level-icon">${icon==="leaf"?"❋":icon==="zap"?"ϟ":"✺"}</span><span class="level-number">${level}. SINIF</span></div><h3>${title}</h3><p>${desc}</p><div class="level-foot"><span>${(topics[level]||[]).length} görev</span><b>Keşfet →</b></div></button>`}
function labPage(){
  return `<section class="lab-intro"><div><span class="mini-chip">ETKİLEŞİMLİ 3B MODEL</span><h2>Bilimsel yapıyı her açıdan incele.</h2><p class="muted">Fareyle sürükle veya dokun. Tekerlekle ya da iki parmakla yakınlaştır. Model üzerindeki parçalara tıkla.</p></div><div class="model-select">${[["neuron","Nöron"],["cell","Hücre"],["brain","Beyin"],["spinal","Omurilik"]].map(([id,n])=>`<button class="${state.model===id?"selected":""}" data-model="${id}">${n}</button>`).join("")}</div></section>
  <section class="lab-layout"><div class="canvas-wrap"><div class="canvas-top"><span class="live-dot"></span> CANLI MODEL <span class="canvas-hint">360° inceleme</span></div><div id="three-canvas"></div><div class="canvas-controls"><button id="zoom-in" aria-label="Yakınlaştır">＋</button><button id="zoom-out" aria-label="Uzaklaştır">−</button><button id="reset-view">Görünümü sıfırla</button></div><div class="canvas-legend"><span><i class="legend-dot cyan"></i> Seçilebilir yapı</span><span><i class="legend-dot green"></i> Etkileşim noktası</span></div></div><aside class="model-info"><div class="info-kicker">MODEL REHBERİ</div><h3 id="part-title">Nöronun yapısı</h3><p id="part-desc">Bilgi almak için model üzerindeki bir yapıya dokun.</p><div class="info-divider"></div><div class="info-block"><span>İNCELEME İPUCU</span><p id="part-tip">Modeli sürükleyerek döndür. Bir bölüme tıklayarak görevini öğren.</p></div><div class="info-block"><span>MODELİN PARÇALARI</span><div id="part-list" class="part-list"></div></div><div class="model-note">Bu model, öğrenmeyi desteklemek amacıyla kodla oluşturulmuş 3B temsildir; ayrıntılı anatomi için model dosyaları ayrıca eklenebilir.</div></aside></section>`;
}
function missionsPage(){
  return `<section class="mission-banner"><div><span class="mini-chip">GÖREV GÜNLÜĞÜ</span><h2>Her doğru cevap yeni bir keşif.</h2><p>Seviyeni seç, bilgini dene ve puan kazan.</p></div><div class="mission-emblem">✧</div></section><div class="level-tabs">${["9","10","11"].map(l=>`<button class="${state.currentLevel===l?"active":""}" data-level-tab="${l}">${l}. sınıf</button>`).join("")}</div><section class="mission-list">${(topics[state.currentLevel]||[]).map((t,i)=>missionCard(state.currentLevel,t,i)).join("")}</section>`;
}
function missionCard(level,t,i){
  const id=`${level}-${i}`, done=isDone(id);
  return `<article class="mission-card"><div class="mission-symbol ${level==="9"?"sym-blue":level==="10"?"sym-green":"sym-violet"}">${level==="9"?"❋":level==="10"?"ϟ":"✺"}</div><div class="mission-copy"><div class="mission-meta"><span>${level}. SINIF</span><span>+${t.points} PUAN</span></div><h3>${t.title}</h3><p>${t.desc}</p></div><button class="${done?"done-btn":"outline-btn"}" data-mission="${id}" ${done?"disabled":""}>${done?"✓ Tamamlandı":"Göreve başla →"}</button></article>`;
}
function finalPage(){
  const done=isDone("final-0");
  return `<section class="final-hero"><div class="final-art"><div class="final-orb">✦</div><span class="final-orbit one"></span><span class="final-orbit two"></span></div><div><span class="mini-chip">SON AŞAMA · BAĞLAM TEMELLİ</span><h1>Bilgileri birleştir,<br><em>olayı çözümle.</em></h1><p>Bir uyaranın algılanmasından hızlı kas yanıtına uzanan senaryoda hücre, enerji ve sinir sistemi bilgilerini birlikte kullan.</p><div class="final-tags"><span>Reseptör</span><span>İmpuls</span><span>ATP</span><span>Omurilik</span></div></div></section><section class="final-mission"><div><span class="eyebrow">SON GÖREV</span><h2>Bir refleksin öyküsü</h2><p>Bir yüzeyin sıcaklığı algılanıyor. Sinirsel bilgi hangi yoldan ilerler ve hücreler enerjiye neden ihtiyaç duyar?</p></div><button class="${done?"done-btn":"primary-btn"}" id="start-final" ${done?"disabled":""}>${done?"✓ Tamamlandı":"Finali başlat →"}</button></section><div id="quiz-area"></div>`;
}
function wireMissions(){
  document.querySelectorAll("[data-level-tab]").forEach(b=>b.onclick=()=>{state.currentLevel=b.dataset.levelTab;renderApp()});
  document.querySelectorAll("[data-mission]").forEach(b=>b.onclick=()=>startQuiz(state.currentLevel,b.dataset.mission));
}
function wireFinal(){ $("#start-final").onclick=()=>startQuiz("final","final-0"); }
function startQuiz(level,id){
  state.quizSet=(questions[level]||[]).map((q,i)=>({...q,id:`${level}-q${i}`}));state.quizIndex=0;state.quizAnswered=false;state.selectedAnswer=null;state.quizLevel=level;state.quizMission=id;
  showQuiz();
}
function showQuiz(){
  const area=$("#quiz-area") || $(".page-content");
  if(!area)return;
  const q=state.quizSet[state.quizIndex];
  if(!q){finishQuiz();return}
  area.innerHTML=`<section class="quiz-card"><div class="quiz-head"><span class="mini-chip">BİLGİ GÖREVİ</span><span class="muted">${state.quizIndex+1} / ${state.quizSet.length}</span></div><div class="quiz-progress"><span style="width:${(state.quizIndex+1)/state.quizSet.length*100}%"></span></div><h2>${safeText(q.q)}</h2><div class="answer-list">${q.a.map((a,i)=>`<button class="answer-option" data-answer="${i}"><span>${String.fromCharCode(65+i)}</span>${safeText(a)}</button>`).join("")}</div><div id="answer-feedback"></div><button id="quiz-next" class="primary-btn" disabled>${state.quizIndex===state.quizSet.length-1?"Görevi tamamla":"Sonraki soru"} →</button></section>`;
  document.querySelectorAll("[data-answer]").forEach(b=>b.onclick=()=>{
    if(state.quizAnswered)return;state.quizAnswered=true;state.selectedAnswer=Number(b.dataset.answer);
    const correct=state.selectedAnswer===q.correct;
    b.classList.add(correct?"correct":"incorrect");
    if(!correct) document.querySelector(`[data-answer="${q.correct}"]`)?.classList.add("correct");
    $("#answer-feedback").innerHTML=`<div class="feedback ${correct?"good":"try-again"}"><b>${correct?"Harika, doğru cevap!":"Bir kez daha düşün."}</b><p>${safeText(q.why)}</p></div>`;
    $("#quiz-next").disabled=false;
  });
  $("#quiz-next").onclick=()=>{if(!state.quizAnswered)return;state.quizIndex++;state.quizAnswered=false;showQuiz()};
  area.scrollIntoView({behavior:"smooth",block:"start"});
}
async function finishQuiz(){
  const area=$("#quiz-area") || $(".page-content"); if(!area)return;
  const id=state.quizMission;let points=0;
  state.quizSet.forEach(q=>{if(q.correct===q._answer)points+=10});
  // Award a fixed completion reward for completing the learning task.
  const reward=state.quizLevel==="final"?100:40;
  if(!isDone(id)){state.progress.completed=[...(state.progress.completed||[]),id];state.progress.points=(state.progress.points||0)+reward;}
  area.innerHTML=`<section class="quiz-card result-card"><div class="result-icon">✦</div><span class="mini-chip">GÖREV TAMAMLANDI</span><h2>Güzel keşif, kaşif!</h2><p>Bu görev tamamlandı. Öğrendiğin bilgileri başka bir senaryoda tekrar kullanmayı dene.</p><div class="result-points">+${reward} <small>puan</small></div><button class="primary-btn" id="back-missions">Görev merkezine dön →</button></section>`;
  await persistProgress();$("#back-missions").onclick=()=>{state.currentPage=state.quizLevel==="final"?"final":"missions";renderApp()};
}
async function persistProgress(){
  if(state.demo || !state.user || !firebaseReady)return;
  try{await saveProgress(state.user.uid,state.progress)}catch(e){notify("İlerleme bu kez kaydedilemedi. Bağlantını kontrol et.",true)}
}
function wireMissionsAfterRender(){}
function setupLab(){
  const mount=$("#three-canvas");if(!mount)return;
  const scene=new THREE.Scene();scene.background=new THREE.Color("#07152e");
  scene.fog=new THREE.Fog("#07152e",12,28);
  const camera=new THREE.PerspectiveCamera(42,mount.clientWidth/mount.clientHeight,0.1,100);
  camera.position.set(0,1.5,8);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setSize(mount.clientWidth,mount.clientHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  mount.appendChild(renderer.domElement);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.06;controls.minDistance=3;controls.maxDistance=13;controls.target.set(0,0,0);
  scene.add(new THREE.AmbientLight(0x9bcfff,1.4));
  const key=new THREE.DirectionalLight(0x8cf6dc,3.2);key.position.set(4,6,5);scene.add(key);
  const rim=new THREE.PointLight(0x1c7cff,18,18);rim.position.set(-4,1,-3);scene.add(rim);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(5,64),new THREE.MeshBasicMaterial({color:0x0a2442,transparent:true,opacity:.52}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.1;scene.add(floor);
  const grid=new THREE.GridHelper(12,24,0x174b68,0x12314e);grid.position.y=-2.08;scene.add(grid);
  let modelGroup=new THREE.Group();scene.add(modelGroup);
  const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();let clickable=[];
  const mat=(color,roughness=.35,metalness=.08,emissive=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness,emissive,emissiveIntensity:.35});
  function addMesh(geometry,material,name,desc,tip,pos,scale,rot){
    const m=new THREE.Mesh(geometry,material);m.position.set(...pos);if(scale)m.scale.set(...scale);if(rot)m.rotation.set(...rot);
    m.userData={name,desc,tip};modelGroup.add(m);clickable.push(m);return m;
  }
  function tube(points,radius,material,name,desc,tip){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    return addMesh(new THREE.TubeGeometry(curve,Math.max(24,points.length*8),radius,8,false),material,name,desc,tip,[0,0,0]);
  }
  function clearModel(){while(modelGroup.children.length){const c=modelGroup.children.pop();c.geometry?.dispose();if(Array.isArray(c.material))c.material.forEach(m=>m.dispose());else c.material?.dispose()}clickable=[]}
  function buildNeuron(){
    const cyan=mat(0x38c8f4,.28,.15,0x063d70),green=mat(0x51efb0,.25,.12,0x075b42),gold=mat(0xf5c76b,.3,.1),purple=mat(0x7e8dff,.32,.12);
    addMesh(new THREE.IcosahedronGeometry(.72,3),mat(0x1686bd,.25,.15,0x073b72),"Hücre gövdesi","Nöronun çekirdeğini ve temel organellerini barındıran bölgedir.","Hücre gövdesini döndürerek çevresindeki uzantıları incele.",[0,0,0],[1,.86,.9]);
    addMesh(new THREE.SphereGeometry(.29,32,24),mat(0x75f2ce,.25,.1,0x0a7355),"Çekirdek","Hücrenin kalıtsal bilgisini barındırır ve hücresel faaliyetlerin düzenlenmesinde rol alır.","Çekirdek, hücre gövdesinin içinde bulunur.",[.05,.08,.12]);
    const branches=[[[ -.45,.35,0],[-1.15,.8,.05],[-1.65,1.15,.1],[-2.1,1.12,.1]], [[-.45,.15,.25],[-1.1,.05,.5],[-1.65,-.22,.65],[-2.05,-.05,.7]], [[-.45,-.25,-.2],[-1.05,-.7,-.25],[-1.5,-1.1,-.1],[-1.9,-1.2,-.1]], [[-.25,.55,-.1],[-.55,1.15,-.25],[-.95,1.55,-.2]]];
    branches.forEach((p,i)=>tube(p,.085,cyan,"Dendrit","Dendritler diğer hücrelerden gelen sinyalleri almaya yardımcı olan uzantılardır.","Dendritler genellikle hücre gövdesine doğru sinyal alımında rol oynar."));
    tube([[.45,-.05,0],[1.15,-.15,0],[1.8,-.1,.05],[2.35,.08,.05],[2.8,.18,.1]],.105,green,"Akson","Akson, sinirsel sinyalin hücre gövdesinden uzak bölgelere iletilmesini sağlar.","Akson boyunca ilerleyen sinyal, uç bölgelerde başka hücrelerle iletişim kurabilir.");
    for(let i=0;i<4;i++)addMesh(new THREE.CapsuleGeometry(.17,.42,6,12),gold,"Miyelin kılıfı","Miyelin kılıfı aksonun bazı bölümlerini sararak iletim hızını artırmaya yardımcı olur.","Miyelin parçaları arasında Ranvier boğumları bulunur.",[1.0+i*.48,-.14+i*.04,.01],[1,.95,1],[0,0,-.08]);
    tube([[2.7,.18,.1],[3.05,.55,.1],[3.32,.72,.05]],.055,purple,"Sinaptik uç","Sinaptik uç, başka bir hücreye sinyal aktarımının gerçekleştiği uç bölgedir.","Kimyasal sinapsta nörotransmitterler sinaptik aralığa salınır.");
  }
  function buildCell(){
    const membrane=mat(0x3dd5e8,.2,.2,0x063c5a),cyto=mat(0x116f9a,.35,.08,0x052f4e),nucleus=mat(0x62e6b1,.24,.12,0x075d48);
    addMesh(new THREE.SphereGeometry(1.55,48,36),membrane,"Hücre zarı","Hücreyi çevreleyen seçici geçirgen sınırdır; madde alışverişini düzenler.","Zarın farklı bölgelerini tıklayarak hücre sınırını incele.",[0,0,0],[1.2,1,.82]);
    addMesh(new THREE.SphereGeometry(1.36,40,32),cyto,"Sitoplazma","Organellerin bulunduğu, birçok hücresel tepkimenin gerçekleştiği iç ortamdır.","Hücre zarının içindeki yapıları keşfet.",[0,0,0],[1.1,.9,.72]);
    addMesh(new THREE.SphereGeometry(.52,32,24),nucleus,"Çekirdek","DNA'nın büyük bölümünü barındırır ve hücre faaliyetlerinin düzenlenmesinde rol alır.","Çekirdek, hücrenin yönetiminde önemli rol oynar.",[-.25,.25,.2]);
    const orange=mat(0xf4ba62,.3,.1),purple=mat(0xa4a0ff,.3,.1),pink=mat(0xff8cb9,.3,.1);
    [[.7,.45,.15],[.6,-.45,-.15],[-.6,-.55,.1]].forEach((p,i)=>addMesh(new THREE.TorusGeometry(.28,.1,12,24),orange,"Mitokondri","Mitokondriler hücresel solunumla ATP üretimine katkı sağlar.","Enerji ihtiyacı yüksek hücrelerde mitokondriler önemli rol oynar.",p,[1.2,.7,.8],[.3,.4,.2]));
    addMesh(new THREE.TorusGeometry(.5,.09,10,24),purple,"Endoplazmik retikulum","Hücre içinde madde üretimi ve taşınmasıyla ilişkili zar sistemidir.","Organellerin görevlerini birlikte düşün.",[.35,.3,-.4],[1.3,.6,.7],[.4,.2,.8]);
    addMesh(new THREE.SphereGeometry(.22,24,18),pink,"Vezikül","Bazı maddelerin hücre içinde taşınmasına yardımcı olan keseciktir.","Sinir uçlarında veziküller nörotransmitter taşınmasında rol alabilir.",[.65,.85,.15]);
  }
  function buildBrain(){
    const brainMat=mat(0x7fa9dc,.48,.04,0x122e62),highlight=mat(0x55e6b0,.28,.1,0x07553e);
    const left=addMesh(new THREE.SphereGeometry(1,32,28),brainMat,"Beyin yarımküresi","Beyin; algı, hareket, bellek ve birçok karmaşık işlevin yürütülmesinde rol oynar.","Beynin farklı bölgelerinin farklı görevleri bulunur.",[-.52,.35,0],[.8,1.1,.78]);
    const right=addMesh(new THREE.SphereGeometry(1,32,28),brainMat,"Beyin yarımküresi","İki beyin yarımküresi birçok işlevde birlikte çalışır.","Modeli döndürerek beyin biçimini incele.",[.52,.35,0],[.8,1.1,.78]);
    for(let side of [-1,1])for(let i=0;i<5;i++){
      const x=side*.52+(i%2)*.16-.08,y=.85-i*.28,z=.57*Math.sin(i*1.2);
      tube([[x-.35,y,z],[x-.15,y+.12,z+.12],[x+.06,y-.02,z+.1],[x+.24,y+.08,z]],.035,highlight,"Beyin kıvrımları","Beyin yüzeyindeki kıvrımların biçimi ve bölgelerin yerleşimi anatomik açıdan önemlidir.","Bu model öğretim amaçlı şematik bir temsildir.");
    }
    addMesh(new THREE.CapsuleGeometry(.24,.7,8,16),highlight,"Beyin sapı","Beyin sapı beyin ile omurilik arasındaki bağlantıda ve yaşamsal işlevlerde rol oynar.","Alt bölüm omuriliğe doğru devam eder.",[0,-.8,.05],[1,1,1],[0,0,.08]);
  }
  function buildSpinal(){
    const cord=mat(0xf1b77b,.3,.08,0x70421d),nerve=mat(0x55dcb3,.25,.1,0x075c45),bone=mat(0x6e95c7,.45,.1);
    addMesh(new THREE.CapsuleGeometry(.38,2.6,12,24),cord,"Omurilik","Omurilik, beyin ile vücudun çeşitli bölümleri arasında sinirsel bilgi taşır ve reflekslerde rol oynar.","Uzun ekseni boyunca omurilik yapısını incele.",[0,0,0]);
    for(let i=-2;i<=2;i++){
      const y=i*.62;
      tube([[-.25,y,.05],[-.8,y+.2,.05],[-1.2,y+.32,.1]],.075,nerve,"Sinir kökü","Sinir kökleri omurilik ile çevresel sinirler arasındaki bağlantılara katılır.","Duyu ve motor lifler farklı yönlerde bilgi taşır.");
      tube([[.25,y,.05],[.8,y-.18,.05],[1.2,y-.28,.1]],.075,nerve,"Sinir kökü","Sinir kökleri omurilik ile çevresel sinirler arasındaki bağlantılara katılır.","Duyu ve motor lifler farklı yönlerde bilgi taşır.");
      addMesh(new THREE.TorusGeometry(.58,.12,10,32),bone,"Omurga halkası","Omurlar omuriliği çevreleyerek korumaya yardımcı olur.","Omurilik omurga kanalında yer alır.",[0,y,0],[1,.8,.75],[Math.PI/2,0,0]);
    }
  }
  function build(){
    clearModel();
    if(state.model==="neuron")buildNeuron();else if(state.model==="cell")buildCell();else if(state.model==="brain")buildBrain();else buildSpinal();
    const names=[...new Set(clickable.map(m=>m.userData.name))];
    $("#part-list").innerHTML=names.map(n=>`<button data-part="${safeText(n)}">${safeText(n)} <span>↗</span></button>`).join("");
    document.querySelectorAll("[data-part]").forEach(b=>b.onclick=()=>showPart(b.dataset.part));
    const titles={neuron:"Nöronun yapısı",cell:"Hücrenin yapısı",brain:"Beyin",spinal:"Omurilik"};
    $("#part-title").textContent=titles[state.model];$("#part-desc").textContent="Bir yapıya dokunarak görevini öğren.";
    $("#part-tip").textContent="Modeli sürükleyerek döndür; iki parmakla veya yakınlaştırma düğmeleriyle ölçeği değiştir.";
  }
  function showPart(name){
    const item=clickable.find(m=>m.userData.name===name);if(!item)return;
    $("#part-title").textContent=item.userData.name;$("#part-desc").textContent=item.userData.desc;$("#part-tip").textContent=item.userData.tip;
    clickable.forEach(m=>{if(m.material?.emissive)m.material.emissive.set(m===item?0x145a55:0x000000)});
  }
  build();
  document.querySelectorAll("[data-model]").forEach(b=>b.onclick=()=>{state.model=b.dataset.model;document.querySelectorAll("[data-model]").forEach(x=>x.classList.toggle("selected",x===b));build()});
  $("#zoom-in").onclick=()=>{camera.position.multiplyScalar(.84);controls.update()};
  $("#zoom-out").onclick=()=>{camera.position.multiplyScalar(1.18);controls.update()};
  $("#reset-view").onclick=()=>{camera.position.set(0,1.5,8);controls.target.set(0,0,0);controls.update()};
  renderer.domElement.addEventListener("pointerdown",e=>{const rect=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(clickable,false);if(hits.length)showPart(hits[0].object.userData.name)});
  let frame=0;const animate=()=>{frame=requestAnimationFrame(animate);controls.update();modelGroup.rotation.y+=.0015;renderer.render(scene,camera)};animate();
  const resize=()=>{if(!mount.isConnected){cancelAnimationFrame(frame);renderer.dispose();return}const w=mount.clientWidth,h=mount.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)};
  const observer=new ResizeObserver(resize);observer.observe(mount);
}
document.addEventListener("click",e=>{
  const page=e.target.closest("[data-page]");if(page && state.currentPage==="home"){state.currentPage=page.dataset.page;renderApp()}
  const level=e.target.closest("[data-level]");if(level){state.currentLevel=level.dataset.level;state.currentPage="missions";renderApp()}
});
if(firebaseReady){
  onAuthStateChanged(auth,user=>{if(user){state.user=user;state.demo=false;enterApp()}else{state.user=null;renderLogin()}});
}else renderLogin();
