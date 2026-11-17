

(()=>{
 "use strict";
 const path=location.pathname;

 const appRoot=new URL("../../",document.currentScript.src).pathname;
 const preview=location.protocol==="https:"&&
  appRoot!=="/"&&path.startsWith(appRoot);
 const customHost=location.hostname==="vatra.com.co";
 const custom=location.protocol==="https:"&&customHost;

 const insecureCustom=location.protocol==="http:"&&customHost;
 const local=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&/^(http:|https:)$/.test(location.protocol);
 const allowed=preview||custom||local;
 window.VATRA_HOST_ALLOWED=allowed;
 if(allowed){

  const base=appRoot;
  const rel=path.startsWith(base)?path.slice(base.length):"";
  const plain=rel.replace(/\/$/,"");
  const forbidden=/^(?:feed|friends|communities|club|gifts|notifications)(?:\.html)?$/i.test(plain)||
   /^club[1-9][0-9]{0,18}$/i.test(plain);
  if(forbidden){location.replace(new URL("profile",location.origin+base).href);return;}

  if(/^(?:terms|privacy|cookies)(?:\.html)?$/i.test(plain)){
   location.replace(new URL("./",location.origin+base).href);return;
  }

  if(/^(?:create-account|profile|forgot|reset|verify)\.html$/i.test(plain)){
   const clean=plain.replace(/\.html$/i,"");
   history.replaceState(history.state,"",base+clean+location.search+location.hash);
  }
  if(plain==="index.html"){
   history.replaceState(history.state,"",base+location.search+location.hash);
  }
  return;
 }
 document.documentElement.setAttribute("data-vatra-denied","");
 const style=document.createElement("style");
 style.textContent='html[data-vatra-denied] body{visibility:hidden!important}body.vatra-access-blocked{margin:0;min-height:100dvh;display:grid;place-items:center;background:#f8f9fd;font-family:Onest,system-ui,sans-serif;color:#2C3850}body.vatra-access-blocked main{max-width:460px;margin:20px;padding:35px;border-radius:18px;border:1px solid #e3e8f2;background:#fff;text-align:center}body.vatra-access-blocked a{color:#4269d7}';
 document.head.append(style);
 document.addEventListener("DOMContentLoaded",()=>{
  document.body.replaceChildren();
  document.body.className="vatra-access-blocked";
  document.documentElement.removeAttribute("data-vatra-denied");
  const card=document.createElement("main");
  const title=document.createElement("h1");
  title.textContent=insecureCustom?"Очікуємо на HTTPS":"VATRA БЕТА";
  const copy=document.createElement("p");
  copy.textContent=insecureCustom?
   "Домен підключено, але сторінку відкрито без захищеного з’єднання. Вхід і реєстрація будуть доступні після активації HTTPS.":
   "Відкрийте тестову версію на офіційній адресі VATRA.";
  const link=document.createElement("a");link.href="https://vatra.com.co/";
  link.textContent=insecureCustom?"Спробувати захищену адресу":"Перейти до VATRA БЕТА";
  card.append(title,copy,link);document.body.append(card);
 });
})();