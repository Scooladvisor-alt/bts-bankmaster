import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Business English</title>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root {
  --green:#58cc02; --green-dk:#46a302; --green-lt:#d7ffb8;
  --blue:#1cb0f6;  --blue-dk:#0d8fc4;  --blue-lt:#ddf4ff;
  --red:#ff4b4b;   --red-dk:#cc0000;   --red-lt:#ffdfe0;
  --yellow:#ffc800; --purple:#ce82ff;  --purple-lt:#f0d9ff;
  --bg:#f7f7f7; --white:#fff; --border:#e5e5e5; --border-b:#ccc;
  --text:#3c3c3c; --muted:#888;
  --r:16px; --rsm:12px;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:'Nunito',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
nav{background:var(--white);border-bottom:2px solid var(--border);padding:0 1.2rem;display:flex;align-items:center;justify-content:space-between;height:56px;position:sticky;top:0;z-index:200;gap:1rem}
.logo{display:flex;align-items:center;flex-shrink:0}
.logo-icon{width:32px;height:32px;background:var(--green);border-radius:10px;display:flex;align-items:center;justify-content:center}
.nav-pills{display:flex;gap:.4rem;align-items:center;flex-shrink:0}
.nav-pill{display:flex;align-items:center;gap:.3rem;border-radius:999px;padding:.28rem .75rem;font-weight:800;font-size:.8rem;border:2px solid;white-space:nowrap}
.np-green{background:var(--green-lt);border-color:var(--green);color:var(--green-dk)}
.np-blue{background:var(--blue-lt);border-color:var(--blue);color:var(--blue-dk)}
.tabs{background:var(--white);border-bottom:2px solid var(--border);display:flex;overflow-x:auto;scrollbar-width:none;padding:0}
.tabs::-webkit-scrollbar{display:none}
.tab-btn{background:none;border:none;border-bottom:3px solid transparent;padding:.75rem .9rem;font-family:'Nunito',sans-serif;font-weight:800;font-size:.8rem;color:var(--muted);cursor:pointer;white-space:nowrap;transition:color .15s,border-color .15s;display:flex;align-items:center;gap:.3rem;flex:1;justify-content:center}
.tab-btn.active{color:var(--blue);border-bottom-color:var(--blue)}
.tab-btn:hover:not(.active){color:var(--text)}
.view{display:none;padding:1.2rem;max-width:680px;margin:0 auto}
.view.active{display:block}
.xp-wrap{display:flex;align-items:center;gap:.7rem;margin-bottom:1rem}
.xp-track{flex:1;height:12px;background:var(--border);border-radius:999px;overflow:hidden}
.xp-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,var(--green),#89e219);transition:width .5s cubic-bezier(.34,1.56,.64,1)}
.xp-lbl{font-weight:800;font-size:.78rem;color:var(--muted);min-width:55px;text-align:right}
.sec-title{font-size:1.3rem;font-weight:900;margin-bottom:.2rem}
.sec-sub{font-size:.82rem;color:var(--muted);font-weight:600;margin-bottom:1rem}
.hearts{display:flex;gap:.3rem;justify-content:flex-end;margin-bottom:.9rem}
.heart{display:flex;align-items:center;justify-content:center;transition:transform .2s,opacity .2s}
.heart.lost{opacity:.25;transform:scale(.8)}
.btn{padding:.72rem 1.6rem;border-radius:var(--rsm);font-family:'Nunito',sans-serif;font-weight:800;font-size:.88rem;cursor:pointer;border:2px solid;transition:transform .1s,box-shadow .1s;display:inline-flex;align-items:center;gap:.4rem;justify-content:center;line-height:1}
.btn:active{transform:translateY(2px)}
.btn-green{background:var(--green);color:#fff;border-color:var(--green-dk);box-shadow:0 4px 0 var(--green-dk)}.btn-green:hover{background:#63e002}.btn-green:active{box-shadow:0 2px 0 var(--green-dk)}
.btn-blue{background:var(--blue);color:#fff;border-color:var(--blue-dk);box-shadow:0 4px 0 var(--blue-dk)}.btn-blue:hover{background:#30bcff}.btn-blue:active{box-shadow:0 2px 0 var(--blue-dk)}
.btn-red{background:var(--red);color:#fff;border-color:var(--red-dk);box-shadow:0 4px 0 var(--red-dk)}.btn-red:active{box-shadow:0 2px 0 var(--red-dk)}
.btn-ghost{background:var(--white);color:var(--muted);border-color:var(--border);box-shadow:0 4px 0 var(--border-b)}.btn-ghost:hover{color:var(--text);border-color:var(--border-b)}.btn-ghost:active{box-shadow:0 2px 0 var(--border-b)}
.btn-outline-blue{background:var(--white);color:var(--blue);border-color:var(--blue);box-shadow:0 4px 0 var(--blue-dk)}.btn-outline-blue:hover{background:var(--blue-lt)}.btn-outline-blue:active{box-shadow:0 2px 0 var(--blue-dk)}
.btn-lg{padding:.9rem 2.2rem;font-size:.95rem;border-radius:var(--r)}
.btn-sm{padding:.48rem 1rem;font-size:.78rem}
.mode-chips{display:flex;gap:.5rem;margin-bottom:1.3rem;flex-wrap:wrap}
.chip{background:var(--white);border:2px solid var(--border);border-radius:999px;padding:.38rem .9rem;font-family:'Nunito',sans-serif;font-weight:800;font-size:.78rem;cursor:pointer;color:var(--muted);transition:all .15s;display:inline-flex;align-items:center;gap:.3rem}
.chip.active{border-color:var(--blue);background:var(--blue-lt);color:var(--blue-dk)}
.chip:hover:not(.active){border-color:var(--border-b);color:var(--text)}
.wr-toolbar{display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap;background:var(--bg);border:2px solid var(--border);border-radius:var(--rsm);padding:.5rem .7rem}
.wr-toolbar-left{display:flex;gap:.4rem;align-items:center;flex-wrap:wrap}
.wr-toolbar-right{display:flex;gap:.4rem;align-items:center;flex-shrink:0}
.card-box{background:var(--white);border:2px solid var(--border);border-radius:var(--r);box-shadow:0 4px 0 var(--border-b)}
.fc-area{display:flex;flex-direction:column;align-items:center;gap:1.3rem}
.flashcard{width:100%;max-width:480px;height:220px;perspective:1200px;cursor:pointer}
.card-inner{width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform .5s cubic-bezier(.4,0,.2,1)}
.flashcard.flipped .card-inner{transform:rotateY(180deg)}
.card-face{position:absolute;inset:0;border-radius:var(--r);backface-visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.8rem;text-align:center;border:2px solid var(--border);box-shadow:0 4px 0 var(--border-b)}
.card-front{background:var(--white)}
.card-back{background:var(--green-lt);border-color:var(--green);box-shadow:0 4px 0 var(--green-dk);transform:rotateY(180deg)}
.card-tag{font-size:.65rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:.22rem .6rem;border-radius:999px;margin-bottom:.7rem;display:inline-flex;align-items:center;gap:.3rem}
.card-front .card-tag{background:var(--blue-lt);color:var(--blue-dk)}
.card-back  .card-tag{background:rgba(88,204,2,.18);color:var(--green-dk)}
.card-word{font-size:1.9rem;font-weight:900;line-height:1.2}
.card-front .card-word{color:var(--text)}
.card-back  .card-word{color:var(--green-dk);font-size:1.5rem}
.flip-hint{margin-top:.9rem;font-size:.72rem;font-weight:700;color:var(--muted);animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:.35}50%{opacity:1}}
.fc-btns{display:flex;gap:.9rem}
.qcm-qbox{padding:1.8rem 1.5rem;text-align:center;margin-bottom:1.2rem}
.qcm-word{font-size:2rem;font-weight:900;line-height:1.2}
.qcm-instr{font-size:.8rem;color:var(--muted);font-weight:600;margin-top:.4rem}
.qcm-grid{display:grid;grid-template-columns:1fr 1fr;gap:.7rem;margin-bottom:1rem}
.qcm-opt{background:var(--white);border:2px solid var(--border);border-radius:var(--rsm);box-shadow:0 3px 0 var(--border-b);padding:.9rem 1rem;font-family:'Nunito',sans-serif;font-size:.87rem;font-weight:700;color:var(--text);cursor:pointer;text-align:left;line-height:1.35;transition:transform .1s,border-color .1s,background .1s}
.qcm-opt:hover:not(:disabled){border-color:var(--blue);background:var(--blue-lt);color:var(--blue-dk);transform:translateY(-2px)}
.qcm-opt:active:not(:disabled){transform:translateY(1px)}
.qcm-opt.correct{background:var(--green-lt);border-color:var(--green);color:var(--green-dk);box-shadow:0 3px 0 var(--green-dk)}
.qcm-opt.wrong{background:var(--red-lt);border-color:var(--red);color:var(--red);box-shadow:0 3px 0 var(--red-dk)}
.qcm-opt:disabled{cursor:default}
.qcm-fb{border-radius:var(--rsm);padding:.85rem 1.1rem;font-weight:800;font-size:.9rem;display:none;align-items:center;gap:.6rem;margin-bottom:.9rem}
.qcm-fb.show{display:flex}
.qcm-fb.ok{background:var(--green-lt);color:var(--green-dk);border:2px solid var(--green)}
.qcm-fb.ko{background:var(--red-lt);color:var(--red);border:2px solid var(--red)}
.wr-qbox{padding:1.8rem;text-align:center;margin-bottom:1rem;transition:background .35s,border-color .35s,box-shadow .35s}
.wr-qbox.flash-ok{background:var(--green-lt)!important;border-color:var(--green)!important;box-shadow:0 4px 0 var(--green-dk)!important;animation:flashOk .5s ease}
.wr-qbox.flash-ko{background:var(--red-lt)!important;border-color:var(--red)!important;box-shadow:0 4px 0 var(--red-dk)!important;animation:flashKo .5s ease}
@keyframes flashOk{0%{transform:scale(1)}30%{transform:scale(1.025)}100%{transform:scale(1)}}
@keyframes flashKo{0%{transform:translateX(0)}15%{transform:translateX(-7px)}35%{transform:translateX(7px)}55%{transform:translateX(-5px)}75%{transform:translateX(4px)}100%{transform:translateX(0)}}
.wr-lang-tag{display:inline-flex;align-items:center;gap:.3rem;font-size:.65rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:.22rem .6rem;border-radius:999px;margin-bottom:.55rem}
.tag-en{background:var(--blue-lt);color:var(--blue-dk)}
.tag-fr{background:var(--purple-lt);color:#7b2fbe}
.wr-word{font-size:1.9rem;font-weight:900;line-height:1.2}
.wr-word.c-en{color:var(--blue-dk)}.wr-word.c-fr{color:#8a2be2}
.wr-sub{font-size:.8rem;color:var(--muted);font-weight:600;margin-top:.35rem}
.hint-row{font-family:'Nunito',monospace;font-size:1.1rem;font-weight:800;letter-spacing:.18em;color:#ccc;text-align:center;min-height:1.8rem;margin-bottom:.6rem}
.hint-row .rev{color:var(--green)}
.wr-correct-reveal{display:none;text-align:center;padding:.6rem 1rem;background:var(--red-lt);border:2px solid var(--red);border-radius:var(--rsm);margin-bottom:.8rem;font-weight:700;font-size:.88rem;color:var(--red)}
.wr-correct-reveal strong{color:var(--red-dk)}
.wr-correct-reveal.show{display:block}
.wr-input-row{display:flex;gap:.7rem;margin-bottom:.9rem}
.wr-input{flex:1;background:var(--white);border:2px solid var(--border);border-radius:var(--rsm);box-shadow:0 3px 0 var(--border-b);padding:.82rem 1rem;font-family:'Nunito',sans-serif;font-size:.97rem;font-weight:700;color:var(--text);outline:none;transition:border-color .15s,box-shadow .15s}
.wr-input:focus{border-color:var(--blue);box-shadow:0 3px 0 var(--blue-dk)}
.wr-input.ok{border-color:var(--green);box-shadow:0 3px 0 var(--green-dk);background:var(--green-lt)}
.wr-input.ko{border-color:var(--red);box-shadow:0 3px 0 var(--red-dk);background:var(--red-lt)}
.wr-actions{display:flex;gap:.6rem;align-items:center;flex-wrap:wrap}
.score-screen{text-align:center;padding:2rem 1rem 2.5rem;display:none}
.score-icon{font-size:1px;margin-bottom:.5rem;animation:bounceIn .6s ease}
.score-icon svg{width:80px;height:80px}
@keyframes bounceIn{0%{transform:scale(.4) rotate(-15deg);opacity:0}70%{transform:scale(1.15) rotate(3deg)}100%{transform:scale(1) rotate(0);opacity:1}}
.score-title{font-size:1.9rem;font-weight:900;margin-bottom:.25rem}
.score-sub{color:var(--muted);font-weight:700;font-size:.88rem;margin-bottom:1.8rem}
.score-badges{display:flex;justify-content:center;gap:1rem;margin-bottom:1.8rem;flex-wrap:wrap}
.score-badge{background:var(--white);border:2px solid var(--border);box-shadow:0 4px 0 var(--border-b);border-radius:var(--r);padding:.9rem 1.3rem;min-width:90px}
.score-badge .val{font-size:2rem;font-weight:900;line-height:1}
.score-badge .lbl{font-size:.68rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-top:.2rem}
.score-badge.g .val{color:var(--green)}.score-badge.r .val{color:var(--red)}.score-badge.b .val{color:var(--blue)}
.btn-row{display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap}
.list-ctrl{display:flex;gap:.5rem;margin-bottom:1.1rem;flex-wrap:wrap}
.search-inp{flex:1;min-width:160px;background:var(--white);border:2px solid var(--border);border-radius:var(--rsm);padding:.58rem .9rem;font-family:'Nunito',sans-serif;font-weight:700;font-size:.88rem;outline:none;color:var(--text)}
.search-inp:focus{border-color:var(--blue)}
.vgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:.65rem}
.vcard{background:var(--white);border:2px solid var(--border);box-shadow:0 3px 0 var(--border-b);border-radius:var(--rsm);padding:.85rem .95rem;display:flex;justify-content:space-between;align-items:flex-start;gap:.4rem;transition:border-color .15s,transform .1s}
.vcard:hover{border-color:var(--blue);transform:translateY(-1px)}
.ven{font-size:.88rem;font-weight:800;line-height:1.3}.vfr{font-size:.76rem;font-weight:600;color:var(--muted);margin-top:.18rem;line-height:1.3}
.vdot{width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:3px}
.vdot.known{background:var(--green)}.vdot.learning{background:var(--yellow)}.vdot.unknown{background:#ccc}
.cat-pill{display:inline-block;padding:.12rem .48rem;border-radius:999px;font-size:.6rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;margin-top:.28rem}
.cp-co{background:var(--blue-lt);color:var(--blue-dk)}.cp-ec{background:var(--green-lt);color:var(--green-dk)}.cp-wo{background:var(--purple-lt);color:#7b2fbe}
.sgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem;margin-bottom:1.2rem}
.scard{background:var(--white);border:2px solid var(--border);box-shadow:0 4px 0 var(--border-b);border-radius:var(--r);padding:1.2rem}
.scard .val{font-size:2.2rem;font-weight:900;line-height:1}.scard .lbl{font-size:.7rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-top:.25rem}
.scard.g .val{color:var(--green)}.scard.b .val{color:var(--blue)}.scard.y .val{color:var(--yellow)}.scard.r .val{color:var(--red)}
.bar-sec{background:var(--white);border:2px solid var(--border);box-shadow:0 4px 0 var(--border-b);border-radius:var(--r);padding:1.2rem;margin-bottom:.9rem}
.bar-sec h3{font-size:.75rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:1rem}
.bar-row{display:flex;align-items:center;gap:.7rem;margin-bottom:.7rem}
.bar-lbl{font-size:.78rem;font-weight:700;width:105px;text-align:right;flex-shrink:0}
.bar-track{flex:1;height:10px;background:var(--border);border-radius:999px;overflow:hidden}
.bar-fill{height:100%;border-radius:999px;transition:width 1.2s cubic-bezier(.34,1.56,.64,1)}
.bar-num{font-weight:800;font-size:.73rem;color:var(--muted);min-width:38px}
.express-toggle{display:flex;align-items:center;gap:.5rem;cursor:pointer;user-select:none}
.express-track{position:relative;width:42px;height:24px;background:var(--border);border-radius:999px;transition:background .2s;flex-shrink:0;border:2px solid var(--border-b)}
.express-thumb{position:absolute;top:2px;left:2px;width:16px;height:16px;background:var(--white);border-radius:50%;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
input[type=checkbox]:checked+.express-track{background:var(--green);border-color:var(--green-dk)}
input[type=checkbox]:checked+.express-track .express-thumb{transform:translateX(18px)}
.express-toggle input{display:none}
.express-lbl{font-size:.8rem;font-weight:800;color:var(--muted)}
input[type=checkbox]:checked~.express-lbl{color:var(--green-dk)}
.express-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:.25rem;flex-wrap:wrap;gap:.5rem}
@keyframes pop{0%{transform:scale(1)}50%{transform:scale(1.07)}100%{transform:scale(1)}}
.pop{animation:pop .3s ease}
@media(max-width:520px){.qcm-grid{grid-template-columns:1fr}.card-word,.qcm-word,.wr-word{font-size:1.45rem}}
</style>
</head>
<body>
<nav>
  <div class="logo">
    <div class="logo-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    </div>
  </div>
  <div class="nav-pills">
    <div class="nav-pill np-green">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      <span id="nav-streak">0</span>
    </div>
    <div class="nav-pill np-blue">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      <span id="nav-known">0</span>/150
    </div>
  </div>
</nav>
<div class="tabs">
  <button class="tab-btn active" onclick="switchTab('flashcards',this)">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
    Flashcards
  </button>
  <button class="tab-btn" onclick="switchTab('qcm',this)">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    QCM
  </button>
  <button class="tab-btn" onclick="switchTab('writing',this)">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    Écriture
  </button>
  <button class="tab-btn" onclick="switchTab('liste',this)">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
    Liste
  </button>
  <button class="tab-btn" onclick="switchTab('stats',this)">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    Stats
  </button>
</div>

<div id="view-flashcards" class="view active">
  <div class="express-row">
    <div class="sec-title" style="margin-bottom:0">Flashcards</div>
    <label class="express-toggle">
      <input type="checkbox" id="fc-express">
      <span class="express-track"><span class="express-thumb"></span></span>
      <span class="express-lbl">Mode express</span>
    </label>
  </div>
  <div class="sec-sub">Clique sur la carte pour voir la traduction.</div>
  <div class="xp-wrap">
    <div class="xp-track"><div class="xp-fill" id="fc-bar" style="width:0%"></div></div>
    <div class="xp-lbl" id="fc-ctr">1/150</div>
  </div>
  <div class="fc-area">
    <div class="flashcard" id="flashcard" onclick="flipCard()">
      <div class="card-inner">
        <div class="card-face card-front">
          <div class="card-tag">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            Anglais
          </div>
          <div class="card-word" id="fc-en">—</div>
          <div class="flip-hint">Cliquer pour retourner ↺</div>
        </div>
        <div class="card-face card-back">
          <div class="card-tag">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Traduction
          </div>
          <div class="card-word" id="fc-fr">—</div>
        </div>
      </div>
    </div>
    <div class="fc-btns" id="fc-btns" style="display:none">
      <button class="btn btn-ghost" onclick="markCard(false)">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        Je ne savais pas
      </button>
      <button class="btn btn-green" onclick="markCard(true)">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Je savais !
      </button>
    </div>
    <div style="display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center">
      <button class="btn btn-ghost btn-sm" onclick="startFC(false)">Recommencer</button>
      <button class="btn btn-ghost btn-sm" onclick="startFC(true)">Inconnus seulement</button>
    </div>
  </div>
  <div class="score-screen" id="fc-done">
    <div class="score-icon" id="fc-icon"></div>
    <div class="score-title" id="fc-title">Bien joué !</div>
    <div class="score-sub" id="fc-sub"></div>
    <div class="score-badges">
      <div class="score-badge g"><div class="val" id="fc-sk">0</div><div class="lbl">Connus</div></div>
      <div class="score-badge r"><div class="val" id="fc-su">0</div><div class="lbl">À revoir</div></div>
    </div>
    <div class="btn-row">
      <button class="btn btn-outline-blue" onclick="startFC(true)">Rejouer les inconnus</button>
      <button class="btn btn-green btn-lg" onclick="startFC(false)">Tout refaire</button>
    </div>
  </div>
</div>

<div id="view-qcm" class="view">
  <div class="express-row">
    <div class="sec-title" style="margin-bottom:0">QCM</div>
    <label class="express-toggle">
      <input type="checkbox" id="qcm-express">
      <span class="express-track"><span class="express-thumb"></span></span>
      <span class="express-lbl">Mode express</span>
    </label>
  </div>
  <div class="sec-sub">Trouvez la bonne traduction parmi 4 propositions.</div>
  <div class="xp-wrap">
    <div class="xp-track"><div class="xp-fill" id="qcm-bar" style="width:0%"></div></div>
    <div class="xp-lbl" id="qcm-ctr">1/150</div>
  </div>
  <div class="hearts" id="qcm-hearts"></div>
  <div id="qcm-game">
    <div class="card-box qcm-qbox">
      <div class="qcm-word" id="qcm-word">—</div>
      <div class="qcm-instr">Quelle est la traduction en français ?</div>
    </div>
    <div class="qcm-grid" id="qcm-opts"></div>
    <div class="qcm-fb" id="qcm-fb"></div>
    <div style="text-align:center">
      <button class="btn btn-blue" id="qcm-next" style="display:none" onclick="nextQCM()">Continuer →</button>
    </div>
  </div>
  <div class="score-screen" id="qcm-done">
    <div class="score-icon" id="qcm-icon"></div>
    <div class="score-title" id="qcm-title">Résultat</div>
    <div class="score-sub" id="qcm-sub"></div>
    <div class="score-badges">
      <div class="score-badge g"><div class="val" id="qcm-ok">0</div><div class="lbl">Corrects</div></div>
      <div class="score-badge r"><div class="val" id="qcm-ko">0</div><div class="lbl">Erreurs</div></div>
      <div class="score-badge b"><div class="val" id="qcm-pct">0%</div><div class="lbl">Score</div></div>
    </div>
    <div class="btn-row"><button class="btn btn-green btn-lg" onclick="startQCM()">Rejouer</button></div>
  </div>
</div>

<div id="view-writing" class="view">
  <div class="express-row">
    <div class="sec-title" style="margin-bottom:0">Écriture</div>
    <label class="express-toggle">
      <input type="checkbox" id="wr-express">
      <span class="express-track"><span class="express-thumb"></span></span>
      <span class="express-lbl">Mode express</span>
    </label>
  </div>
  <div class="sec-sub">Tapez la traduction. Entrée = valider / continuer.</div>
  <div class="wr-toolbar" id="wr-chips">
    <div class="wr-toolbar-left">
      <button class="chip active" onclick="setWrMode('mixed',this)">Mélangé</button>
      <button class="chip" onclick="setWrMode('en2fr',this)">EN→FR</button>
      <button class="chip" onclick="setWrMode('fr2en',this)">FR→EN</button>
    </div>
    <div class="wr-toolbar-right">
      <button class="btn btn-ghost btn-sm" id="wr-hint-btn" onclick="wrHint()">Indice</button>
      <button class="btn btn-ghost btn-sm" id="wr-skip-btn" onclick="wrSkip()">Passer</button>
    </div>
  </div>
  <div class="xp-wrap">
    <div class="xp-track"><div class="xp-fill" id="wr-bar" style="width:0%"></div></div>
    <div class="xp-lbl" id="wr-ctr">1/150</div>
  </div>
  <div id="wr-game">
    <div class="card-box wr-qbox" id="wr-qbox">
      <div class="wr-lang-tag" id="wr-tag">Anglais</div>
      <div class="wr-word" id="wr-shown">—</div>
      <div class="wr-sub" id="wr-sub">Tapez la traduction</div>
    </div>
    <div class="wr-correct-reveal" id="wr-reveal"></div>
    <div class="hint-row" id="wr-hint"></div>
    <div class="wr-input-row">
      <input class="wr-input" id="wr-input" type="text" placeholder="Votre réponse…" autocomplete="off" autocorrect="off" spellcheck="false" onkeydown="wrKey(event)">
      <button class="btn btn-blue" id="wr-validate-btn" onclick="checkWR()">✓ Valider</button>
    </div>
    <div class="wr-actions">
      <button class="btn btn-blue" id="wr-next" style="display:none" onclick="nextWR()">Continuer →</button>
    </div>
  </div>
  <div class="score-screen" id="wr-done">
    <div class="score-icon" id="wr-icon"></div>
    <div class="score-title" id="wr-title">Résultat</div>
    <div class="score-sub" id="wr-sub2"></div>
    <div class="score-badges">
      <div class="score-badge g"><div class="val" id="wr-ok">0</div><div class="lbl">Corrects</div></div>
      <div class="score-badge r"><div class="val" id="wr-ko">0</div><div class="lbl">Erreurs</div></div>
      <div class="score-badge b"><div class="val" id="wr-pct">0%</div><div class="lbl">Score</div></div>
    </div>
    <div class="btn-row"><button class="btn btn-green btn-lg" onclick="startWR()">Rejouer</button></div>
  </div>
</div>

<div id="view-liste" class="view">
  <div class="sec-title">Les 150 mots</div>
  <div class="sec-sub"><span style="color:var(--green)">●</span> maîtrisé &nbsp;<span style="color:var(--yellow)">●</span> en cours &nbsp;<span style="color:#ccc">●</span> inconnu</div>
  <div class="list-ctrl">
    <input class="search-inp" id="search-inp" placeholder="Rechercher…" oninput="renderList()">
    <button class="chip active" onclick="setFilter('all',this)">Tout</button>
    <button class="chip" onclick="setFilter('company',this)">Company</button>
    <button class="chip" onclick="setFilter('economy',this)">Economy</button>
    <button class="chip" onclick="setFilter('working',this)">Working Life</button>
  </div>
  <div class="vgrid" id="vgrid"></div>
</div>

<div id="view-stats" class="view">
  <div class="sec-title">Statistiques</div>
  <div class="sec-sub">Votre progression en détail.</div>
  <div class="sgrid">
    <div class="scard b"><div class="val">150</div><div class="lbl">Total</div></div>
    <div class="scard g"><div class="val" id="st-kn">0</div><div class="lbl">Maîtrisés</div></div>
    <div class="scard y"><div class="val" id="st-le">0</div><div class="lbl">En cours</div></div>
    <div class="scard r"><div class="val" id="st-pc">0%</div><div class="lbl">Progression</div></div>
  </div>
  <div class="bar-sec"><h3>Par catégorie</h3><div id="cat-bars"></div></div>
  <div style="text-align:center;margin-top:1.2rem">
    <button class="btn btn-ghost btn-sm" onclick="if(confirm('Réinitialiser toute la progression ?')){resetAll();}">Réinitialiser</button>
  </div>
</div>

<script>
const SVG_TROPHY='<svg viewBox="0 0 24 24" fill="none" stroke="#ffc800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M6 3h12v6a6 6 0 0 1-12 0z"/><line x1="12" y1="15" x2="12" y2="19"/><line x1="8" y1="21" x2="16" y2="21"/></svg>';
const SVG_STAR='<svg viewBox="0 0 24 24" fill="none" stroke="#58cc02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
const SVG_FACE='<svg viewBox="0 0 24 24" fill="none" stroke="#ff4b4b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>';
function scoreIcon(p){return p>=80?SVG_TROPHY:p>=50?SVG_STAR:SVG_FACE;}
function scoreTitle(p){return p>=80?'Excellent !':p>=50?'Bien joué !':'Continue !';}
const VOCAB=[
  {id:0,en:"Company",fr:"Entreprise",cat:"company"},{id:1,en:"Corporation",fr:"Société / Entreprise",cat:"company"},{id:2,en:"Organisation",fr:"Organisation",cat:"company"},{id:3,en:"Structure",fr:"Structure",cat:"company"},{id:4,en:"Department",fr:"Département",cat:"company"},{id:5,en:"Division",fr:"Division",cat:"company"},{id:6,en:"Branch",fr:"Succursale",cat:"company"},{id:7,en:"Headquarters",fr:"Siège (social)",cat:"company"},{id:8,en:"Subsidiary",fr:"Filiale",cat:"company"},{id:9,en:"Office",fr:"Bureau",cat:"company"},{id:10,en:"Team",fr:"Équipe",cat:"company"},{id:11,en:"Staff",fr:"Personnel",cat:"company"},{id:12,en:"Employee",fr:"Employé(e)",cat:"company"},{id:13,en:"Employer",fr:"Employeur",cat:"company"},{id:14,en:"Board of Directors",fr:"Conseil d'administration",cat:"company"},{id:15,en:"Executive",fr:"Cadre / Dirigeant",cat:"company"},{id:16,en:"CEO (Chief Executive Officer)",fr:"PDG (Président Directeur Général)",cat:"company"},{id:17,en:"CFO (Chief Financial Officer)",fr:"Directeur(trice) financier(ère)",cat:"company"},{id:18,en:"Manager",fr:"Responsable / Manager",cat:"company"},{id:19,en:"Supervisor",fr:"Superviseur",cat:"company"},{id:20,en:"Assistant",fr:"Assistant(e)",cat:"company"},{id:21,en:"Intern",fr:"Stagiaire",cat:"company"},{id:22,en:"Hierarchy",fr:"Hiérarchie",cat:"company"},{id:23,en:"Chain of command",fr:"Chaîne de commandement",cat:"company"},{id:24,en:"Leadership",fr:"Direction / Leadership",cat:"company"},{id:25,en:"Management",fr:"Gestion / Management",cat:"company"},{id:26,en:"Administration",fr:"Administration",cat:"company"},{id:27,en:"Finance",fr:"Finances",cat:"company"},{id:28,en:"Human Resources (HR)",fr:"Ressources humaines (RH)",cat:"company"},{id:29,en:"Marketing",fr:"Marketing",cat:"company"},{id:30,en:"Sales",fr:"Ventes",cat:"company"},{id:31,en:"Legal",fr:"Juridique",cat:"company"},{id:32,en:"Operations",fr:"Opérations",cat:"company"},{id:33,en:"IT (Information Technology)",fr:"Informatique",cat:"company"},{id:34,en:"Research & Development (R&D)",fr:"Recherche et développement",cat:"company"},{id:35,en:"Customer service",fr:"Service client",cat:"company"},{id:36,en:"Logistics",fr:"Logistique",cat:"company"},{id:37,en:"Supply chain",fr:"Chaîne d'approvisionnement",cat:"company"},{id:38,en:"Corporate culture",fr:"Culture d'entreprise",cat:"company"},{id:39,en:"Organisational chart",fr:"Organigramme",cat:"company"},{id:40,en:"Reporting line",fr:"Ligne hiérarchique",cat:"company"},{id:41,en:"Policy",fr:"Politique",cat:"company"},{id:42,en:"Procedure",fr:"Procédure",cat:"company"},{id:43,en:"Strategy",fr:"Stratégie",cat:"company"},{id:44,en:"Objective",fr:"Objectif",cat:"company"},{id:45,en:"Goal",fr:"But",cat:"company"},{id:46,en:"Mission statement",fr:"Déclaration de mission",cat:"company"},{id:47,en:"Vision",fr:"Vision",cat:"company"},{id:48,en:"Stakeholder",fr:"Partie prenante",cat:"company"},{id:49,en:"Shareholder",fr:"Actionnaire",cat:"company"},
  {id:50,en:"Economy",fr:"Économie",cat:"economy"},{id:51,en:"Economic growth",fr:"Croissance économique",cat:"economy"},{id:52,en:"Inflation",fr:"Inflation",cat:"economy"},{id:53,en:"Deflation",fr:"Déflation",cat:"economy"},{id:54,en:"Recession",fr:"Récession",cat:"economy"},{id:55,en:"Unemployment",fr:"Chômage",cat:"economy"},{id:56,en:"Employment",fr:"Emploi",cat:"economy"},{id:57,en:"Labour market",fr:"Marché du travail",cat:"economy"},{id:58,en:"GDP (Gross Domestic Product)",fr:"PIB (Produit Intérieur Brut)",cat:"economy"},{id:59,en:"Interest rate",fr:"Taux d'intérêt",cat:"economy"},{id:60,en:"Loan",fr:"Prêt",cat:"economy"},{id:61,en:"Debt",fr:"Dette",cat:"economy"},{id:62,en:"Credit",fr:"Crédit",cat:"economy"},{id:63,en:"Investment",fr:"Investissement",cat:"economy"},{id:64,en:"Investor",fr:"Investisseur",cat:"economy"},{id:65,en:"Capital",fr:"Capital",cat:"economy"},{id:66,en:"Profit",fr:"Profit / Bénéfice",cat:"economy"},{id:67,en:"Loss",fr:"Perte",cat:"economy"},{id:68,en:"Revenue",fr:"Revenu",cat:"economy"},{id:69,en:"Tax",fr:"Impôt / Taxe",cat:"economy"},{id:70,en:"Subsidy",fr:"Subvention",cat:"economy"},{id:71,en:"Budget",fr:"Budget",cat:"economy"},{id:72,en:"Deficit",fr:"Déficit",cat:"economy"},{id:73,en:"Surplus",fr:"Excédent",cat:"economy"},{id:74,en:"Trade",fr:"Commerce",cat:"economy"},{id:75,en:"Import",fr:"Importation",cat:"economy"},{id:76,en:"Export",fr:"Exportation",cat:"economy"},{id:77,en:"Balance of trade",fr:"Balance commerciale",cat:"economy"},{id:78,en:"Currency",fr:"Devise / Monnaie",cat:"economy"},{id:79,en:"Exchange rate",fr:"Taux de change",cat:"economy"},{id:80,en:"Market",fr:"Marché",cat:"economy"},{id:81,en:"Consumer",fr:"Consommateur",cat:"economy"},{id:82,en:"Demand",fr:"Demande",cat:"economy"},{id:83,en:"Supply",fr:"Offre",cat:"economy"},{id:84,en:"Price",fr:"Prix",cat:"economy"},{id:85,en:"Cost",fr:"Coût",cat:"economy"},{id:86,en:"Economic policy",fr:"Politique économique",cat:"economy"},{id:87,en:"Public spending",fr:"Dépenses publiques",cat:"economy"},{id:88,en:"Taxation",fr:"Fiscalité",cat:"economy"},{id:89,en:"Financial crisis",fr:"Crise financière",cat:"economy"},{id:90,en:"Stock market",fr:"Marché boursier",cat:"economy"},{id:91,en:"Shares",fr:"Actions",cat:"economy"},{id:92,en:"Earnings",fr:"Revenus",cat:"economy"},{id:93,en:"Minimum wage",fr:"Salaire minimum",cat:"economy"},{id:94,en:"Productivity",fr:"Productivité",cat:"economy"},{id:95,en:"Wealth",fr:"Richesse",cat:"economy"},{id:96,en:"Poverty",fr:"Pauvreté",cat:"economy"},{id:97,en:"Inequality",fr:"Inégalités",cat:"economy"},{id:98,en:"Standard of living",fr:"Niveau de vie",cat:"economy"},{id:99,en:"Cost of living",fr:"Coût de la vie",cat:"economy"},
  {id:100,en:"Employee",fr:"Employé(e)",cat:"working"},{id:101,en:"Employer",fr:"Employeur",cat:"working"},{id:102,en:"Colleague",fr:"Collègue",cat:"working"},{id:103,en:"Manager",fr:"Responsable / Directeur(trice)",cat:"working"},{id:104,en:"Boss",fr:"Patron(ne)",cat:"working"},{id:105,en:"Career",fr:"Carrière",cat:"working"},{id:106,en:"Profession",fr:"Profession",cat:"working"},{id:107,en:"Workplace",fr:"Lieu de travail",cat:"working"},{id:108,en:"Office",fr:"Bureau",cat:"working"},{id:109,en:"Job interview",fr:"Entretien d'embauche",cat:"working"},{id:110,en:"Resume (CV)",fr:"CV",cat:"working"},{id:111,en:"Cover letter",fr:"Lettre de motivation",cat:"working"},{id:112,en:"Application",fr:"Candidature",cat:"working"},{id:113,en:"Contract",fr:"Contrat",cat:"working"},{id:114,en:"Full-time",fr:"À plein temps",cat:"working"},{id:115,en:"Part-time",fr:"À temps partiel",cat:"working"},{id:116,en:"Internship",fr:"Stage",cat:"working"},{id:117,en:"Work experience",fr:"Expérience professionnelle",cat:"working"},{id:118,en:"Promotion",fr:"Promotion",cat:"working"},{id:119,en:"Salary",fr:"Salaire",cat:"working"},{id:120,en:"Wage",fr:"Rémunération",cat:"working"},{id:121,en:"Income",fr:"Revenu",cat:"working"},{id:122,en:"Pay rise",fr:"Augmentation de salaire",cat:"working"},{id:123,en:"Overtime",fr:"Heures supplémentaires",cat:"working"},{id:124,en:"Shift",fr:"Quart de travail",cat:"working"},{id:125,en:"Commute",fr:"Trajet (domicile-travail)",cat:"working"},{id:126,en:"Remote work",fr:"Télétravail",cat:"working"},{id:127,en:"Self-employed",fr:"Indépendant(e)",cat:"working"},{id:128,en:"Freelancer",fr:"Travailleur(se) indépendant(e)",cat:"working"},{id:129,en:"Unemployed",fr:"Sans emploi",cat:"working"},{id:130,en:"Retired",fr:"Retraité(e)",cat:"working"},{id:131,en:"Resign",fr:"Démissionner",cat:"working"},{id:132,en:"Fire (someone)",fr:"Renvoyer",cat:"working"},{id:133,en:"Hire",fr:"Embaucher",cat:"working"},{id:134,en:"Deadline",fr:"Date limite",cat:"working"},{id:135,en:"Task",fr:"Tâche",cat:"working"},{id:136,en:"Responsibility",fr:"Responsabilité",cat:"working"},{id:137,en:"Workload",fr:"Charge de travail",cat:"working"},{id:138,en:"Team",fr:"Équipe",cat:"working"},{id:139,en:"Leadership",fr:"Leadership / Commandement",cat:"working"},{id:140,en:"Training",fr:"Formation",cat:"working"},{id:141,en:"Skills",fr:"Compétences",cat:"working"},{id:142,en:"Qualifications",fr:"Diplômes / Qualifications",cat:"working"},{id:143,en:"Experience",fr:"Expérience",cat:"working"},{id:144,en:"Workplace culture",fr:"Culture d'entreprise",cat:"working"},{id:145,en:"Benefits",fr:"Avantages",cat:"working"},{id:146,en:"Sick leave",fr:"Congé maladie",cat:"working"},{id:147,en:"Annual leave",fr:"Congé annuel",cat:"working"},{id:148,en:"Productivity",fr:"Productivité",cat:"working"},{id:149,en:"Job satisfaction",fr:"Satisfaction au travail",cat:"working"},
];
const mastery={};VOCAB.forEach(v=>mastery[v.id]='unknown');
let streak=0;
(function(){try{const d=localStorage.getItem('wv6');if(d){const o=JSON.parse(d);Object.assign(mastery,o.m||o);streak=o.s||0}}catch(e){}})();
function save(){try{localStorage.setItem('wv6',JSON.stringify({m:mastery,s:streak}))}catch(e){}}
function resetAll(){VOCAB.forEach(v=>mastery[v.id]='unknown');streak=0;save();updateNav();renderStats();renderList();}
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function updateNav(){document.getElementById('nav-known').textContent=Object.values(mastery).filter(v=>v==='known').length;document.getElementById('nav-streak').textContent=streak;}
function switchTab(tab,btn){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));document.getElementById('view-'+tab).classList.add('active');btn.classList.add('active');if(tab==='qcm')startQCM();if(tab==='writing')startWR();if(tab==='liste')renderList();if(tab==='stats')renderStats();}
let fcOrder=[],fcIdx=0,fcKnown=0,fcExpressTimer=null;
function isFCExpress(){return document.getElementById('fc-express')?.checked}
function startFC(onlyUnknown){let pool=onlyUnknown?VOCAB.filter(v=>mastery[v.id]!=='known'):[...VOCAB];if(!pool.length)pool=[...VOCAB];if(fcExpressTimer){clearTimeout(fcExpressTimer);fcExpressTimer=null}fcOrder=shuffle(pool);fcIdx=0;fcKnown=0;document.getElementById('fc-done').style.display='none';document.getElementById('flashcard').style.display='';document.getElementById('fc-btns').style.display='none';showFC();}
function showFC(){const fc=document.getElementById('flashcard');fc.classList.remove('flipped');document.getElementById('fc-btns').style.display='none';const total=fcOrder.length;document.getElementById('fc-bar').style.width=(fcIdx/total*100)+'%';document.getElementById('fc-ctr').textContent=Math.min(fcIdx+1,total)+'/'+total;if(fcIdx>=total){showFCDone();return}const w=fcOrder[fcIdx];document.getElementById('fc-en').textContent=w.en;document.getElementById('fc-fr').textContent=w.fr;if(isFCExpress()){fcExpressTimer=setTimeout(()=>{document.getElementById('flashcard').classList.add('flipped');fcExpressTimer=setTimeout(()=>{markCard(true);},1800);},1200);}}
function flipCard(){if(isFCExpress())return;if(fcIdx>=fcOrder.length)return;document.getElementById('flashcard').classList.toggle('flipped');if(document.getElementById('flashcard').classList.contains('flipped'))document.getElementById('fc-btns').style.display='flex';}
function markCard(knew){if(fcExpressTimer){clearTimeout(fcExpressTimer);fcExpressTimer=null}const w=fcOrder[fcIdx];mastery[w.id]=knew?'known':'learning';if(knew){fcKnown++;streak++}else{streak=0}save();fcIdx++;showFC();updateNav();}
function showFCDone(){document.getElementById('flashcard').style.display='none';document.getElementById('fc-btns').style.display='none';const total=fcOrder.length,pct=Math.round(fcKnown/total*100);document.getElementById('fc-sk').textContent=fcKnown;document.getElementById('fc-su').textContent=total-fcKnown;document.getElementById('fc-icon').innerHTML=scoreIcon(pct);document.getElementById('fc-title').textContent=scoreTitle(pct);document.getElementById('fc-sub').textContent=pct+'% maîtrisé sur ce tour';document.getElementById('fc-done').style.display='block';document.getElementById('fc-bar').style.width='100%';}
let qcmOrder=[],qcmIdx=0,qcmCorrect=0,qcmAnswered=false,qcmLives=5,qcmExpressTimer=null;
function isQCMExpress(){return document.getElementById('qcm-express')?.checked}
function startQCM(){qcmOrder=shuffle([...VOCAB]);qcmIdx=0;qcmCorrect=0;qcmLives=5;qcmAnswered=false;if(qcmExpressTimer){clearTimeout(qcmExpressTimer);qcmExpressTimer=null}document.getElementById('qcm-done').style.display='none';document.getElementById('qcm-game').style.display='block';renderHearts();showQCM();}
function renderHearts(){const h=document.getElementById('qcm-hearts');h.innerHTML='';for(let i=0;i<5;i++){const el=document.createElement('span');el.className='heart'+(i>=qcmLives?' lost':'');el.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="'+(i<qcmLives?'#ff4b4b':'#ccc')+'" stroke="'+(i<qcmLives?'#cc0000':'#bbb')+'" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';h.appendChild(el);}}
function showQCM(){const total=qcmOrder.length;qcmAnswered=false;if(qcmIdx>=total||qcmLives<=0){showQCMDone();return}document.getElementById('qcm-ctr').textContent=(qcmIdx+1)+'/'+total;document.getElementById('qcm-bar').style.width=(qcmIdx/total*100)+'%';const correct=qcmOrder[qcmIdx];document.getElementById('qcm-word').textContent=correct.en;const pool=VOCAB.filter(v=>v.id!==correct.id&&v.fr!==correct.fr);const opts=shuffle([correct,...shuffle(pool).slice(0,3)]);const c=document.getElementById('qcm-opts');c.innerHTML='';opts.forEach(opt=>{const b=document.createElement('button');b.className='qcm-opt';b.textContent=opt.fr;b.onclick=()=>answerQCM(opt,correct,b);c.appendChild(b);});const fb=document.getElementById('qcm-fb');fb.className='qcm-fb';fb.innerHTML='';document.getElementById('qcm-next').style.display='none';}
function answerQCM(chosen,correct,btn){if(qcmAnswered)return;qcmAnswered=true;document.querySelectorAll('.qcm-opt').forEach(b=>{b.disabled=true;if(b.textContent===correct.fr)b.classList.add('correct')});const fb=document.getElementById('qcm-fb');const isOk=(chosen.id===correct.id);if(isOk){qcmCorrect++;mastery[correct.id]='known';streak++;fb.innerHTML='✓ Correct !';fb.className='qcm-fb show ok';btn.classList.add('correct','pop');}else{mastery[correct.id]='learning';qcmLives--;streak=0;fb.innerHTML='✗ Faux — réponse : <strong>'+correct.fr+'</strong>';fb.className='qcm-fb show ko';btn.classList.add('wrong');renderHearts();}save();updateNav();if(isQCMExpress()){document.getElementById('qcm-next').style.display='none';qcmExpressTimer=setTimeout(()=>{qcmIdx++;showQCM()},isOk?600:1400);}else{document.getElementById('qcm-next').style.display='inline-flex';}}
function nextQCM(){if(qcmExpressTimer){clearTimeout(qcmExpressTimer);qcmExpressTimer=null}qcmIdx++;showQCM()}
function showQCMDone(){document.getElementById('qcm-game').style.display='none';document.getElementById('qcm-done').style.display='block';document.getElementById('qcm-bar').style.width='100%';const total=qcmOrder.length,pct=Math.round(qcmCorrect/total*100);document.getElementById('qcm-ok').textContent=qcmCorrect;document.getElementById('qcm-ko').textContent=total-qcmCorrect;document.getElementById('qcm-pct').textContent=pct+'%';document.getElementById('qcm-icon').innerHTML=scoreIcon(pct);document.getElementById('qcm-title').textContent=scoreTitle(pct);document.getElementById('qcm-sub').textContent=pct+'% de bonnes réponses';}
let wrOrder=[],wrIdx=0,wrCorrect=0,wrAnswered=false,wrHints=0,wrMode='mixed',wrDir='',wrExpressTimer=null;
function isWRExpress(){return document.getElementById('wr-express')?.checked}
function setWrMode(mode,btn){wrMode=mode;document.querySelectorAll('#wr-chips .chip').forEach(b=>b.classList.remove('active'));btn.classList.add('active');startWR();}
function startWR(){wrOrder=shuffle([...VOCAB]);wrIdx=0;wrCorrect=0;wrAnswered=false;if(wrExpressTimer){clearTimeout(wrExpressTimer);wrExpressTimer=null}document.getElementById('wr-done').style.display='none';document.getElementById('wr-game').style.display='block';showWR();}
function getDir(){if(wrMode==='en2fr')return'en2fr';if(wrMode==='fr2en')return'fr2en';return Math.random()<.5?'en2fr':'fr2en'}
function getTarget(w){return wrDir==='en2fr'?w.fr:w.en}
function showWR(){const total=wrOrder.length;wrAnswered=false;wrHints=0;if(wrIdx>=total){showWRDone();return}wrDir=getDir();document.getElementById('wr-ctr').textContent=(wrIdx+1)+'/'+total;document.getElementById('wr-bar').style.width=(wrIdx/total*100)+'%';const w=wrOrder[wrIdx];const tagEl=document.getElementById('wr-tag');const wordEl=document.getElementById('wr-shown');const subEl=document.getElementById('wr-sub');if(wrDir==='en2fr'){tagEl.className='wr-lang-tag tag-en';tagEl.textContent='Anglais';wordEl.className='wr-word c-en';subEl.textContent='Tapez la traduction en français';}else{tagEl.className='wr-lang-tag tag-fr';tagEl.textContent='Français';wordEl.className='wr-word c-fr';subEl.textContent='Tapez la traduction en anglais';}wordEl.textContent=w[wrDir==='en2fr'?'en':'fr'];document.getElementById('wr-qbox').className='card-box wr-qbox';document.getElementById('wr-reveal').className='wr-correct-reveal';document.getElementById('wr-reveal').innerHTML='';renderWrHint(getTarget(w),0);const inp=document.getElementById('wr-input');inp.value='';inp.className='wr-input';inp.disabled=false;document.getElementById('wr-next').style.display='none';document.getElementById('wr-hint-btn').disabled=false;document.getElementById('wr-skip-btn').disabled=false;document.getElementById('wr-validate-btn').disabled=false;setTimeout(()=>inp.focus(),50);}
function renderWrHint(word,revealed){let html='';word.split('').forEach((ch,i)=>{if(ch===' '){html+='<span style="display:inline-block;width:.45em"> </span>';return}html+=i<revealed?'<span class="rev">'+ch+'</span>':'_ ';});document.getElementById('wr-hint').innerHTML=html;}
function wrHint(){if(wrAnswered)return;wrHints++;renderWrHint(getTarget(wrOrder[wrIdx]),wrHints);}
function wrKey(e){if(e.key==='Enter'){e.preventDefault();if(wrAnswered)nextWR();else checkWR();}}
function norm(s){return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[''()]/g,'').replace(/[^a-z0-9& \/\-]/g,'').replace(/\s+/g,' ').trim();}
function getCandidates(tgt){const base=norm(tgt);const short=norm(tgt.replace(/\s*\/.*$/,'').replace(/\s*\(.*?\)/g,''));const candidates=[base];if(short&&short!==base)candidates.push(short);tgt.split('/').forEach(part=>{const p=norm(part.replace(/\(.*?\)/g,''));if(p&&!candidates.includes(p))candidates.push(p);});return candidates;}
function coloredDiff(answer,target){const a=answer.split('');const t=target.split('');const maxLen=Math.max(a.length,t.length);let html='';for(let i=0;i<maxLen;i++){const ch=t[i]||'';if(ch==='')continue;const userCh=a[i]||'';if(ch===' '){html+=' ';continue;}if(norm(userCh)===norm(ch)){html+='<span style="color:var(--green);font-weight:900">'+ch+'</span>';}else{html+='<span style="color:var(--red);font-weight:900">'+ch+'</span>';}}return html;}
function checkWR(){if(wrAnswered)return;const w=wrOrder[wrIdx];const rawAns=document.getElementById('wr-input').value;const ans=norm(rawAns);const tgt=getTarget(w);const candidates=getCandidates(tgt);const isCorrect=candidates.includes(ans);wrAnswered=true;const inp=document.getElementById('wr-input');const qbox=document.getElementById('wr-qbox');const rev=document.getElementById('wr-reveal');inp.disabled=true;inp.className='wr-input';document.getElementById('wr-hint-btn').disabled=true;document.getElementById('wr-skip-btn').disabled=true;document.getElementById('wr-validate-btn').disabled=true;if(isCorrect){wrCorrect++;mastery[w.id]='known';streak++;qbox.classList.add('flash-ok');rev.className='wr-correct-reveal';}else{mastery[w.id]='learning';streak=0;qbox.classList.add('flash-ko');const diffHtml=coloredDiff(ans,norm(tgt));rev.innerHTML='Réponse correcte : <span style="font-family:monospace;font-size:1rem;letter-spacing:.05em">'+diffHtml+'</span>';rev.className='wr-correct-reveal show';}renderWrHint(tgt,999);save();updateNav();if(isWRExpress()){document.getElementById('wr-next').style.display='none';wrExpressTimer=setTimeout(()=>nextWR(),isCorrect?500:1600);}else{document.getElementById('wr-next').style.display='inline-flex';setTimeout(()=>document.getElementById('wr-next').focus(),80);}}
function wrSkip(){if(wrAnswered)return;const w=wrOrder[wrIdx];mastery[w.id]='learning';wrAnswered=true;streak=0;const inp=document.getElementById('wr-input');inp.disabled=true;inp.className='wr-input';const qbox=document.getElementById('wr-qbox');qbox.classList.add('flash-ko');const tgt=getTarget(w);const rev=document.getElementById('wr-reveal');rev.innerHTML='Réponse correcte : <strong>'+tgt+'</strong>';rev.className='wr-correct-reveal show';renderWrHint(tgt,999);document.getElementById('wr-hint-btn').disabled=true;document.getElementById('wr-skip-btn').disabled=true;document.getElementById('wr-validate-btn').disabled=true;save();updateNav();if(isWRExpress()){document.getElementById('wr-next').style.display='none';wrExpressTimer=setTimeout(()=>nextWR(),1400);}else{document.getElementById('wr-next').style.display='inline-flex';setTimeout(()=>document.getElementById('wr-next').focus(),80);}}
function nextWR(){if(wrExpressTimer){clearTimeout(wrExpressTimer);wrExpressTimer=null}wrIdx++;showWR();}
function showWRDone(){document.getElementById('wr-game').style.display='none';document.getElementById('wr-done').style.display='block';document.getElementById('wr-bar').style.width='100%';const total=wrOrder.length,pct=Math.round(wrCorrect/total*100);document.getElementById('wr-ok').textContent=wrCorrect;document.getElementById('wr-ko').textContent=total-wrCorrect;document.getElementById('wr-pct').textContent=pct+'%';document.getElementById('wr-icon').innerHTML=scoreIcon(pct);document.getElementById('wr-title').textContent=scoreTitle(pct);document.getElementById('wr-sub2').textContent=pct+'% de bonnes réponses';}
let filterCat='all';
const catLabel={company:'Company & Org.',economy:'Economy',working:'Working Life'};
function renderList(){const q=(document.getElementById('search-inp').value||'').toLowerCase();const filtered=VOCAB.filter(v=>(filterCat==='all'||v.cat===filterCat)&&(!q||v.en.toLowerCase().includes(q)||v.fr.toLowerCase().includes(q)));const cpMap={company:'cp-co',economy:'cp-ec',working:'cp-wo'};const grid=document.getElementById('vgrid');grid.innerHTML='';filtered.forEach(v=>{const m=mastery[v.id]||'unknown';const el=document.createElement('div');el.className='vcard';el.innerHTML='<div><div class="ven">'+v.en+'</div><div class="vfr">'+v.fr+'</div><span class="cat-pill '+cpMap[v.cat]+'">'+catLabel[v.cat]+'</span></div><div class="vdot '+m+'"></div>';grid.appendChild(el);});}
function setFilter(cat,btn){filterCat=cat;document.querySelectorAll('.list-ctrl .chip').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderList();}
function renderStats(){const kn=Object.values(mastery).filter(v=>v==='known').length;const le=Object.values(mastery).filter(v=>v==='learning').length;document.getElementById('st-kn').textContent=kn;document.getElementById('st-le').textContent=le;document.getElementById('st-pc').textContent=Math.round(kn/150*100)+'%';const cols={company:'#1cb0f6',economy:'#58cc02',working:'#ce82ff'};const bars=document.getElementById('cat-bars');bars.innerHTML='';['company','economy','working'].forEach(cat=>{const words=VOCAB.filter(v=>v.cat===cat);const cnt=words.filter(v=>mastery[v.id]==='known').length;const pct=Math.round(cnt/words.length*100);bars.innerHTML+='<div class="bar-row"><div class="bar-lbl">'+catLabel[cat]+'</div><div class="bar-track"><div class="bar-fill" style="width:'+pct+'%;background:'+cols[cat]+'"></div></div><div class="bar-num">'+cnt+'/'+words.length+'</div></div>';});}
startFC(false);updateNav();
</script>
</body>
</html>`;

export default function AnglaisVocabulaire() {
  return (
    <div className="min-h-screen bg-sky-50 flex flex-col">
      {/* Header back */}
      <div className="sticky top-0 z-10 bg-white border-b border-sky-100 px-4 py-2 flex items-center gap-2">
        <Link
          to="/anglais"
          className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 font-bold text-sm py-1 pr-2"
        >
          <ChevronLeft className="w-4 h-4" /> Anglais
        </Link>
        <span className="text-sky-300">|</span>
        <span className="font-bold text-sky-800 text-sm">📘 Vocabulaire Business</span>
      </div>

      {/* Full iframe */}
      <div className="flex-1 w-full" style={{ height: "calc(100vh - 48px)" }}>
        <iframe
          srcDoc={HTML_CONTENT}
          className="w-full h-full border-0"
          title="Vocabulaire Anglais Business"
          sandbox="allow-scripts allow-same-origin"
          style={{ minHeight: "calc(100vh - 48px)" }}
        />
      </div>
    </div>
  );
}