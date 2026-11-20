

(()=>{
 "use strict";
 document.documentElement.lang="uk";
 try{localStorage.setItem("vatra-language","uk");}catch(_){}
 const ready=Promise.resolve();
 window.VATRA_LANGUAGE=Object.freeze({
  locale:"uk",ready,
  translate(value){return typeof value==="string"?value:String(value??"");},
  setLanguage(){return false;},
  getLanguage(){return "uk";}
 });
})();