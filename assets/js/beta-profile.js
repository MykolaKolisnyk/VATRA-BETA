

(()=>{
"use strict";
if(window.VATRA_HOST_ALLOWED===false)return;
const URL_ROOT="https://cxrcycxrlkufozomsxcs.supabase.co";
const PUBLIC_KEY="sb_publishable_oKypZDxi8PP1oxSylfh5wQ_H6HxeM-i";
const $=selector=>document.querySelector(selector);
const root=new URL("../../",document.currentScript.src);
const home=()=>root.href;
const ownProfile=id=>new URL(id?"id"+id:"profile",root).href;
const validId=id=>/^[1-9][0-9]{0,18}$/.test(String(id??""));
const $name=$("#profile-heading");
const loading=$("#profile-loading");
const status=(message,error=false)=>{
 const node=$("#profile-edit-message");
 if(node){node.textContent=message;node.hidden=!message;node.dataset.betaError=error?"true":"false";}
};
function showError(message){
 const caption=loading?.querySelector(".vatra-auth-loading-caption");
 if(caption)caption.textContent=message;
 if(loading){
  loading.dataset.loadingError="true";
  loading.setAttribute("role","alert");
  if(!loading.querySelector(".beta-retry")){
   const retry=document.createElement("button");
   retry.className="beta-retry";retry.type="button";
   retry.textContent="Повторити";retry.onclick=()=>location.reload();
   loading.querySelector(".vatra-auth-loading-content")?.append(retry);
  }
 }
}
function reveal(){
 document.body.dataset.authReady="true";
 document.body.dataset.feedReady="true";
 document.body.classList.remove("vatra-shell-pending");
 if(loading)loading.hidden=true;
 $("#profile-app").hidden=false;
}
function bindNavTooltips(){

 const targets=document.querySelectorAll(
  ".social-top-nav [data-vatra-tooltip-uk],.feed-header-controls [data-vatra-tooltip-uk]");
 if(!targets.length)return;
 const tip=document.createElement("span");
 tip.id="beta-nav-tooltip";tip.className="vatra-shell-tooltip beta-nav-tooltip";
 tip.setAttribute("role","tooltip");
 document.body.append(tip);
 let active=null;
 const hide=()=>{
  tip.removeAttribute("data-open");
  if(active)active.removeAttribute("aria-describedby");
  active=null;
 };
 const show=target=>{
  const lang=String(document.documentElement.lang||"uk").toLowerCase().startsWith("en")?"en":"uk";
  const label=target.getAttribute("data-vatra-tooltip-"+lang)||
   target.getAttribute("aria-label")||"";
  if(!label)return;
  if(active&&active!==target)active.removeAttribute("aria-describedby");
  active=target;tip.textContent=label;
  target.setAttribute("aria-describedby",tip.id);
  tip.dataset.open="true";
  const box=target.getBoundingClientRect();
  const width=tip.offsetWidth,height=tip.offsetHeight;
  const left=Math.max(12,Math.min(box.left+box.width/2-width/2,
   Math.max(12,window.innerWidth-width-12)));
  const below=box.bottom+10;
  const top=below+height<=window.innerHeight-12?below:
   Math.max(12,box.top-height-10);
  tip.style.left=Math.round(left)+"px";
  tip.style.top=Math.round(top)+"px";
 };
 for(const element of targets){

  element.removeAttribute("title");
  element.addEventListener("mouseenter",()=>show(element));
  element.addEventListener("mouseleave",hide);
  element.addEventListener("focus",()=>show(element));
  element.addEventListener("blur",hide);
  element.addEventListener("pointerdown",hide);
 }
 window.addEventListener("resize",hide,{passive:true});
 document.addEventListener("scroll",hide,{passive:true,capture:true});
}
function lockUI(){
 const allowed=[
  "#profile-edit-open","#feed-menu-own-profile","#profile-avatar-trigger",
  "#profile-cover-view","#profile-avatar-upload-button",
  "#profile-cover-upload-button","#profile-edit-save",
  "#profile-edit-cancel","#feed-logout","#profile-tab-posts",
  "#profile-write-post","#profile-quick-media","#profile-posts-more","#profile-post-filter-button","#profile-post-filter-reset",
  "#profile-status","#vatra-search-back","#feed-search-clear-input",
  "#feed-search-submit","#beta-search-more",".feed-account-toggle"
 ];
 const allowedNodes=new Set(allowed.flatMap(s=>[...document.querySelectorAll(s)]));
 const elements=document.querySelectorAll(
  "#profile-app a,#profile-app button,#profile-app summary,#profile-app [role='button']");
 for(const element of elements){
  if(allowedNodes.has(element))continue;
  if(element.closest("dialog"))continue;
  element.dataset.betaLocked="true";
  element.setAttribute("aria-disabled","true");

  if(!element.closest(".social-top-nav,.feed-header-controls"))
   element.setAttribute("title","Недоступно до повного запуску VATRA");
 }
 bindNavTooltips();

 document.addEventListener("click",event=>{
  const target=event.target.closest("[data-beta-locked]");
  if(!target)return;
  event.preventDefault();event.stopImmediatePropagation();
 },true);

 const label=$("#profile-tab-posts");
 if(label)label.setAttribute("aria-selected","true");
 for(const button of document.querySelectorAll(".social-profile-tabs [data-profile-tab]:not([data-profile-tab='posts'])")){
  button.hidden=button.dataset.profileTab==="friends";
  button.setAttribute("aria-disabled","true");
 }
 $("#profile-tab-friends").hidden=true;
 $("#profile-archive-wrap").hidden=false;
 $("#profile-saved-section").hidden=true;
 for(const panel of document.querySelectorAll("[data-profile-panel]"))
  panel.hidden=panel.id!=="profile-posts-section";

 $("#profile-quick-compose").hidden=true;
 $(".profile-post-filter-wrap").hidden=true;
 $("#profile-posts-more").hidden=true;
 $("#profile-posts-empty").hidden=true;
 $("#profile-status").hidden=true;
 $("#profile-online-dot").hidden=true;
 const about=$("#profile-about-card");
 if(about){
  $("#profile-about-heading").textContent="Про VATRA";
  const empty=$("#profile-about-empty");if(empty)empty.hidden=true;
  const desc=$("#profile-about-text");
  if(desc){desc.hidden=false;desc.textContent="Це ваша сторінка у VATRA. Змінюйте аватар та обкладинку, створюйте публікації і діліться своїми історіями."; }
 }
 for(const [key,title] of [["friends","Друзі"]]){
  const area=$("#profile-"+key+"-preview");
  if(!area)continue;
  const list=$("#profile-"+key+"-preview-list");
  if(list)list.replaceChildren();
  const link=area.querySelector(".profile-mini-more");
  if(link)link.hidden=true;
  const text=document.createElement("p");text.className="beta-preview-note";
  text.textContent=title+" стануть доступними після запуску VATRA.";
  area.append(text);
 }
 const giftsEmpty=$("#profile-gifts-preview-empty");
 giftsEmpty.textContent="Завантажуємо подарунки…";
 giftsEmpty.hidden=false;
 const postsHeading=$(".profile-posts-overview");
 if(postsHeading)postsHeading.hidden=false;
 const posts=$("#profile-posts");
 posts.replaceChildren();
 const card=document.createElement("article");
 card.className="beta-member-count";
 card.innerHTML='<h2 class="beta-count-heading">Зареєстровано користувачів</h2><output class="beta-count-value" id="beta-member-total" aria-live="polite" aria-label="Кількість зареєстрованих користувачів VATRA">—</output><p class="beta-count-description vt-beta-count-description-001">Успіх <a class="beta-count-link vt-beta-count-link-001" href="https://vatra.com.co/">VATRA</a> напряму залежить від Вас та Вашої активності.</p><div class="beta-count-actions"><button class="beta-count-share" id="beta-count-share" type="button"><svg class="ui-beta-count-share-icon-001" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle class="ui-beta-share-top-001" cx="18" cy="5" r="3"/><circle class="ui-beta-share-left-001" cx="6" cy="12" r="3"/><circle class="ui-beta-share-bottom-001" cx="18" cy="19" r="3"/><path class="ui-beta-share-lines-001" d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></svg><span class="vt-beta-count-share-001">Запросити друзів</span></button><input class="beta-count-share-link" type="url" value="https://vatra.com.co/" readonly hidden aria-label="Посилання для запрошення"><p class="beta-count-share-feedback" role="status" hidden></p></div>';
 postsHeading.before(card);
 const share=card.querySelector(".beta-count-share");
 const shareLink=card.querySelector(".beta-count-share-link");
 const feedback=card.querySelector(".beta-count-share-feedback");
 let sharing=false;
 share.addEventListener("click",async()=>{
  if(sharing)return;
  sharing=true;
  feedback.hidden=true;
  shareLink.hidden=true;
  const url="https://vatra.com.co/";
  try{
   if(typeof navigator.share==="function"){
    try{
     await navigator.share({title:"VATRA",text:"Приєднуйся до VATRA!",url});
     return;
    }catch(error){
     if(error?.name==="AbortError")return;
    }
   }
   try{
    if(!navigator.clipboard?.writeText)throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(url);
    feedback.textContent="Посилання скопійовано.";
   }catch(_){
    shareLink.hidden=false;
    shareLink.focus();
    shareLink.select();
    feedback.textContent="Скопіюйте посилання та надішліть друзям.";
   }
   feedback.hidden=false;
  }finally{sharing=false;}
 });
 $(".feed-header-brand")?.setAttribute("href",ownProfile());
}
const giftCatalog={
 first_flame:{name:"Перший вогник",image:"first-flame.png"},
 beta_member:{name:"БЕТА-учасник",image:"beta-member.png"}
};
function makeGiftTile(gift){
 const tile=document.createElement("div");
 tile.className="profile-gift-tile beta-gift-tile";
 const art=document.createElement("img");
 art.className="profile-gift-art ui-beta-gift-art-001";
 art.src=new URL("assets/gifts/"+gift.image,root).href;
 art.alt="";
 art.width=110;
 art.height=110;
 art.decoding="async";
 const name=document.createElement("span");
 name.className="vt-profile-gift-name-001";
 name.textContent=gift.name;
 tile.append(art,name);
 return tile;
}
async function loadProfileGifts(client,vatraId){
 const preview=$("#profile-gifts-preview-list"),empty=$("#profile-gifts-preview-empty");
 if(!preview||!empty)return;
 try{
  const {data,error}=await client.from("profile_gifts").select("gift_code")
   .eq("recipient_vatra_id",vatraId);
  if(error)throw error;
  const codes=new Set((data||[]).map(row=>row.gift_code));
  const gifts=Object.keys(giftCatalog).filter(code=>codes.has(code)).map(code=>giftCatalog[code]);
  preview.replaceChildren(...gifts.map(makeGiftTile));
  empty.textContent="Подарунків поки немає.";
  empty.hidden=gifts.length>0;
 }catch(_){
  preview.replaceChildren();
  empty.textContent="Не вдалося завантажити подарунки.";
  empty.hidden=false;
 }
}
const q=$;
const t=(uk,en)=>uk;
const locale="uk-UA";
const memberUrl=ownProfile;
const node=(tag,cls,value)=>{
 const el=document.createElement(tag);el.className=cls;
 if(value!==undefined)el.textContent=value;
 return el;
};
const dateText=value=>{
 const date=new Date(value);
 return Number.isNaN(date.getTime())?"":new Intl.DateTimeFormat("uk-UA",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(date);
};
function postNotice(message){
 const status=q("#profile-posts-empty");
 status.textContent=message;status.hidden=false;
}
function confirmPostAction({title,description,action}){
 const dialog=q("#profile-confirm-dialog");
 if(!dialog||dialog.open)return Promise.resolve(false);
 q("#profile-confirm-heading").textContent=title;
 q("#profile-confirm-description").textContent=description;
 q("#profile-confirm-accept").textContent=action;
 return new Promise(resolve=>{
  const accept=q("#profile-confirm-accept"),cancel=q("#profile-confirm-cancel"),close=q("#profile-confirm-close");
  let result=false;
  const yes=()=>{result=true;dialog.close();};
  const no=()=>dialog.close();
  const cleanup=()=>{
   accept.removeEventListener("click",yes);cancel.removeEventListener("click",no);close.removeEventListener("click",no);
   resolve(result);
  };
  accept.addEventListener("click",yes);cancel.addEventListener("click",no);close.addEventListener("click",no);
  dialog.addEventListener("close",cleanup,{once:true});dialog.showModal();
 });
}
function activateProfilePosts(client,user,ownId,targetId){
 const mine=String(ownId)===String(targetId);
 q("#profile-quick-compose").hidden=!mine;
 q(".profile-post-filter-wrap").hidden=false;
 q(".profile-posts-overview").hidden=false;
 if(mine){
  const composerAvatar=q("#profile-compose-avatar"),profileAvatar=q("#profile-avatar");
  const sync=()=>{
   if(!composerAvatar||!profileAvatar)return;
   composerAvatar.style.backgroundImage=profileAvatar.style.backgroundImage;
   composerAvatar.classList.toggle("has-photo",profileAvatar.classList.contains("has-photo"));
  };
  sync();
  if(typeof MutationObserver==="function")new MutationObserver(sync).observe(profileAvatar,{attributes:true,attributeFilter:["class","style"]});
  bindPostComposer(client,user,ownId);
 }
 setupProfilePostFilters(client,targetId,ownId,user.id);
 return loadPosts(client,targetId,ownId,user.id);
}
let profilePostsRequest=0;
async function loadPosts(client,targetId,ownId,userId,append=false){
 const list=q("#profile-posts"),empty=q("#profile-posts-empty"),more=q("#profile-posts-more");
 if(!list||(append&&list.dataset.loading==="true"))return;
 const ticket=++profilePostsRequest;
 const offset=append?Number(list.dataset.offset||0):0;
 const year=Number(q("#profile-post-filter-year")?.value||0);
 const month=Number(q("#profile-post-filter-month")?.value||0);
 list.dataset.loading="true";list.setAttribute("aria-busy","true");
 if(!append){
  list.replaceChildren();
  empty.textContent=t("Завантаження публікацій…","Loading posts…");
  empty.hidden=false;
  list.dataset.offset="0";
  if(more)more.hidden=true;
 }
 if(more)more.disabled=true;
 try{
  let query=client.from("feed_posts")
   .select("id,author_vatra_id,body,created_at,visibility,media_kind,media_path,media_items,shared_post_kind,shared_post_id")
   .eq("author_vatra_id",targetId);
  if(typeof query.is==="function")query=query.is("archived_at",null);
  if(year>=2026&&year<=9999){
   const start=new Date(year,month?month-1:0,1);
   const end=month?new Date(year,month,1):new Date(year+1,0,1);
   query=query.gte("created_at",start.toISOString())
    .lt("created_at",end.toISOString());
  }
  const {data,error}=await query.order("created_at",{ascending:false})
   .order("id",{ascending:false}).range(offset,offset+11);
  if(ticket!==profilePostsRequest)return;
  if(error)throw error;
  const rows=data||[];
  const engagement=await (window.VATRA_POST_INTERACTIONS?.prefetchEngagement(
   client,rows.map(post=>({...post,kind:"person"})))||Promise.resolve(new Map()));
  if(ticket!==profilePostsRequest)return;
  if(!append)list.replaceChildren();
  const batch=document.createDocumentFragment();
  for(const post of rows){
   const article=node("article","feed-post-card ui-profile-post-card-001");
   article.dataset.postId=post.id;
   const header=node("div","feed-post-header ui-profile-post-header-001");
   const identity=node("div","feed-post-author ui-profile-post-author-001");
   const name=node("a","feed-post-name vt-profile-post-name-001 feed-post-profile-link",
    q("#profile-heading").textContent);
   name.href=memberUrl(targetId);
   void window.VATRA_VERIFIED?.attach(client,name,post.author_vatra_id);
   const stamp=node("time","feed-post-date vt-profile-post-date-001",dateText(post.created_at));
   stamp.dateTime=post.created_at;
   const meta=node("div","feed-post-meta-row ui-profile-post-meta-row-001");
   meta.append(stamp);window.VATRA_POST_INTERACTIONS?.appendAudience(meta,post.visibility,false);
   identity.append(name,meta);
   const avatar=node("a","feed-avatar feed-post-avatar vt-profile-post-avatar-001 feed-post-profile-avatar",
    q("#profile-avatar").textContent||"V");
   avatar.href=memberUrl(targetId);
   avatar.setAttribute("aria-label",t("Переглянути профіль","View profile"));
   const profileAvatar=q("#profile-avatar");
   if(profileAvatar.classList.contains("has-photo")){
    avatar.style.backgroundImage=profileAvatar.style.backgroundImage;
    avatar.classList.add("has-photo");avatar.textContent="";
   }
   header.append(avatar,identity);
   if(String(ownId)===String(targetId)){
    window.VATRA_POST_INTERACTIONS?.addOwnerMenu(header,{
     source:"profile",
     onDelete:async()=>{
      if(!await confirmPostAction({
       title:t("Видалити публікацію?","Delete this post?"),
       description:t("Публікацію буде видалено з вашої сторінки без можливості відновлення.",
        "This post will be removed from your profile permanently."),
       action:t("Видалити","Delete")
      }))return;
      const {data,error}=await client.from("feed_posts").delete().eq("id",post.id)
       .eq("author_vatra_id",ownId).select("id");
      if(error||!data?.length){postNotice("Не вдалося видалити публікацію.");return;}
      article.closest(".vatra-post-comment-dialog")?.close();
      if(post.media_path)void window.VATRA_POST_MEDIA?.remove(client,post);
      if(post.media_items?.length)void window.VATRA_POST_MEDIA?.removeGallery(client,post.media_items);
      void loadPosts(client,targetId,ownId,userId);
     }
    });
   }
   article.append(header);
   if(post.body){
    const body=node("p","feed-post-body vt-profile-post-body-001",post.body);
    window.VATRA_POST_MEDIA?.linkifyHashtags(body);
    article.append(body);
    window.VATRA_POST_MEDIA?.collapsibleBody(body);
   }
   if(post.media_items?.length||(post.media_kind&&post.media_path))void window.VATRA_POST_MEDIA?.mount(client,post,article);
   if(post.shared_post_id)void window.VATRA_POST_INTERACTIONS?.renderSharedPreview(client,post,article);
   window.VATRA_POST_INTERACTIONS?.mount(client,{...post,kind:"person"},article,{
    ownId,userId,engagement:engagement.get("person:"+post.id),

   });
   batch.append(article);
  }
  list.append(batch);
  list.dataset.offset=String(offset+rows.length);
  empty.hidden=list.querySelector(".feed-post-card")!==null;
  if(!empty.hidden)empty.textContent=year?
   t("За вибраний період публікацій немає.","No posts in the selected period."):
   t("Публікацій поки немає.","No posts yet.");
  if(more){
   more.hidden=rows.length<12;
   if(!more.dataset.bound){
    more.dataset.bound="true";
    more.addEventListener("click",()=>void loadPosts(client,targetId,ownId,userId,true));
   }
   if(!more.dataset.autoPageBound&&typeof IntersectionObserver==="function"){
    more.dataset.autoPageBound="true";
    const postPager=new IntersectionObserver(entries=>{
     if(entries.some(entry=>entry.isIntersecting)&&!more.hidden&&!more.disabled&&
      list.dataset.loading!=="true"&&document.visibilityState!=="hidden"){
      void loadPosts(client,targetId,ownId,userId,true);
     }
    },{rootMargin:"0px 0px 240px 0px"});
    postPager.observe(more);
   }
  }
 }catch(_){
  if(ticket!==profilePostsRequest)return;
  if(!append)list.replaceChildren();
  empty.textContent=t("Не вдалося завантажити публікації. Спробуйте оновити сторінку.",
   "Could not load posts. Try refreshing this page.");
  empty.hidden=false;
 }finally{
  if(ticket===profilePostsRequest){
   list.dataset.loading="false";list.setAttribute("aria-busy","false");
   if(more)more.disabled=false;
  }
 }
}
function setupProfilePostFilters(client,targetId,ownId,userId){
 const wrap=q(".profile-post-filter-wrap"),toggle=q("#profile-post-filter-button");
 const panel=q("#profile-post-filter-panel"),year=q("#profile-post-filter-year");
 const month=q("#profile-post-filter-month"),reset=q("#profile-post-filter-reset");
 const status=q("#profile-post-filter-status");
 if(!wrap||!toggle||!panel||!year||!month||!reset||!status)return;
 const option=(value,label)=>{
  const item=document.createElement("option");
  item.value=String(value);item.textContent=label;return item;
 };
 year.replaceChildren(option("",t("Усі роки","All years")));
 const current=new Date().getFullYear();
 for(let value=Math.max(2026,current);value>=2026;value--)
  year.append(option(value,String(value)));
 month.replaceChildren(option("",t("Усі місяці","All months")));
 for(let index=0;index<12;index++){
  const label=new Intl.DateTimeFormat(locale,{month:"long"}).format(new Date(2026,index,1));
  month.append(option(index+1,label.charAt(0).toLocaleUpperCase(locale)+label.slice(1)));
 }
 month.disabled=true;
 const close=()=>{
  panel.hidden=true;toggle.setAttribute("aria-expanded","false");
 };
 const refresh=()=>{
  if(!year.value){month.value="";month.disabled=true;}
  else month.disabled=false;
  const active=!!year.value;
  toggle.dataset.active=String(active);
  status.hidden=!active;
  if(active){
   const selected=month.value?
    new Intl.DateTimeFormat(locale,{month:"long",year:"numeric"})
     .format(new Date(Number(year.value),Number(month.value)-1,1)):
    year.value;
   status.textContent=t("Публікації за ","Posts for ")+selected;
  }else status.textContent="";
  void loadPosts(client,targetId,ownId,userId);
 };
 toggle.addEventListener("click",()=>{
  panel.hidden=!panel.hidden;
  toggle.setAttribute("aria-expanded",String(!panel.hidden));
 });
 year.addEventListener("change",refresh);
 month.addEventListener("change",refresh);
 reset.addEventListener("click",()=>{
  year.value="";month.value="";refresh();close();
 });
 document.addEventListener("click",event=>{
  if(!panel.hidden&&!wrap.contains(event.target))close();
 });
 document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&!panel.hidden){close();toggle.focus();}
 });
}
function bindPostComposer(client,user,ownId){
 const trigger=q("#profile-write-post");
 const dialog=q("#profile-compose-dialog");
 const form=q("#profile-compose-form");
 const input=q("#profile-compose-text");
 const submit=q("#profile-compose-submit");
 const cancel=q("#profile-compose-cancel");
 const counter=q("#profile-compose-counter");
 const visibility=q("#profile-compose-visibility");
 const status=q("#profile-compose-status");
 if(!trigger||!dialog||!form||!input||!submit||!validId(ownId))return;
 if(!window.VATRA_POST_MEDIA||!window.VATRA_COMPOSER_UI){postNotice("Не вдалося завантажити редактор публікацій. Оновіть сторінку.");return;}
 let publishing=false,picker=null;
 const update=()=>{
  const length=Array.from(input.value).length;
  counter.textContent=length+" / 2000";
  submit.disabled=publishing||(!input.value.trim()&&!picker?.getFiles()?.length)||length>2000;
 };
 const clearStatus=()=>{status.textContent="";status.hidden=true;};
 picker=window.VATRA_POST_MEDIA?.bindGalleryPicker({
  input:"#profile-compose-media",choose:"#profile-compose-media-choose",
  clear:"#profile-compose-media-remove",preview:"#profile-compose-media-preview",
  onError:text=>{status.textContent=text;status.hidden=!text;},
  onChange:()=>{update();composerUI?.sync();}
 });
 const composerUI=window.VATRA_COMPOSER_UI?.bind({prefix:"profile",ownerId:ownId,getFile:()=>picker?.getFiles()?.length>0});
 q("#profile-quick-media")?.addEventListener("click",()=>{
  trigger.click();q("#profile-compose-media-choose")?.click();
 });
 trigger.addEventListener("click",()=>{
  clearStatus();
  dialog.showModal();
  update();
  composerUI?.open();
 });
 cancel.addEventListener("click",()=>{if(!publishing)dialog.close();});
 dialog.addEventListener("cancel",event=>{if(publishing)event.preventDefault();});
 dialog.addEventListener("close",()=>{clearStatus();trigger.focus({preventScroll:true});});
 input.addEventListener("input",update);
 input.addEventListener("keydown",event=>{
  if((event.ctrlKey||event.metaKey)&&event.key==="Enter"&&!submit.disabled){
   event.preventDefault();
   form.requestSubmit();
  }
 });
 form.addEventListener("submit",async event=>{
  event.preventDefault();
  if(publishing)return;
  const body=input.value.trim(),files=picker?.getFiles()||[];
  if((!body&&!files.length)||Array.from(body).length>2000){
   status.textContent=t("Додайте текст, фото або відео (до 2000 символів).","Add text, a photo or video (up to 2000 characters).");
   status.hidden=false;return;
  }
  publishing=true;
  update();
  clearStatus();
  let uploaded=null,committed=false;
  try{
   if(files.length)uploaded=await window.VATRA_POST_MEDIA.uploadGallery(client,ownId,files);
   const {error}=await client.from("feed_posts").insert({
    author_id:user.id,author_vatra_id:ownId,body,
    visibility:["public","friends","only_me"].includes(visibility?.value)?visibility.value:"public",
    media_items:uploaded||[]
   });
   if(error)throw error;
   committed=true;
   input.value="";picker?.reset();composerUI?.reset();
   dialog.close();
   const year=q("#profile-post-filter-year"),month=q("#profile-post-filter-month");
   if(year)year.value="";if(month){month.value="";month.disabled=true;}
   q("#profile-post-filter-button").dataset.active="false";q("#profile-post-filter-status").hidden=true;
   await loadPosts(client,ownId,ownId,user.id);
  }catch(error){
   if(!committed){
    if(uploaded)try{await window.VATRA_POST_MEDIA.removeGallery(client,uploaded);}catch(_){}
    status.textContent=t("Не вдалося опублікувати допис. Повторіть спробу.","Could not publish the post. Please try again.");
    status.hidden=false;
   }else{postNotice("Допис опубліковано. Оновіть сторінку, якщо він ще не відображається.");}
  }finally{publishing=false;update();}
 });
 update();
}

async function readCount(client){
 const target=$("#beta-member-total");
 if(!target)return;
 try{
  const {count,error}=await client.from("public_profiles")
   .select("vatra_id",{count:"exact",head:true});
  if(error||!Number.isSafeInteger(count)||count<0)throw error||new Error("Invalid count");
  const formatter=new Intl.NumberFormat("uk-UA");
  target.removeAttribute("title");
  if(count===0||window.matchMedia("(prefers-reduced-motion: reduce)").matches){
   target.textContent=formatter.format(count);
   return;
  }
  target.setAttribute("aria-busy","true");
  target.textContent=formatter.format(0);
  const duration=800;
  let start=null;
  let previous=0;
  const tick=now=>{
   if(!target.isConnected)return;
   if(start===null)start=now;
   const progress=Math.min((now-start)/duration,1);
   const value=progress===1?count:Math.min(count-1,Math.floor(count*(1-Math.pow(1-progress,1.35))));
   if(value!==previous){
    target.textContent=formatter.format(value);
    previous=value;
   }
   if(progress<1)window.requestAnimationFrame(tick);
   else target.removeAttribute("aria-busy");
  };
  window.requestAnimationFrame(tick);
 }catch(_){
  target.removeAttribute("aria-busy");
  target.textContent="—";
  target.title="Лічильник тимчасово недоступний";
 }
}
const photoUrls={avatar:null,cover:null};
let openPhotoViewer=null;
function openPhotoRequestedByUrl(){
 const kind=new URLSearchParams(location.search).get("photo");
 if((kind==="avatar"||kind==="cover")&&photoUrls[kind]&&openPhotoViewer)
  openPhotoViewer(kind);
}
function bindFullscreenPhotos(){
 const dialog=$("#beta-photo-viewer"),picture=$("#beta-photo-viewer-image");
 const close=$("#beta-photo-viewer-close");
 if(!dialog||!picture||!close)return;
 const open=kind=>{
  const url=photoUrls[kind];
  if(!url||dialog.open)return;
  picture.src=url;
  picture.alt=kind==="avatar"?"Фото профілю":"Обкладинка профілю";
  dialog.showModal();
 };
 openPhotoViewer=open;
 $("#profile-avatar-trigger")?.addEventListener("click",()=>open("avatar"));
 $("#profile-cover-view")?.addEventListener("click",()=>open("cover"));
 $("#profile-cover-image")?.addEventListener("click",event=>{
  if(event.target.closest("button"))return;
  open("cover");
 });
 close.addEventListener("click",()=>dialog.close());
 dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener("close",()=>{picture.removeAttribute("src");});
}

const photoVersion={avatar:0,cover:0};
function clearProfilePhoto(kind,includeHeader=false){
 ++photoVersion[kind];
 verifiedPhotoPaths[kind]=null;
 photoUrls[kind]=null;
 if(kind==="avatar"){
  const trigger=$("#profile-avatar-trigger");
  if(trigger)trigger.disabled=true;
  for(const node of (includeHeader?
   [$("#profile-avatar"),$("#feed-header-avatar")]:[$("#profile-avatar")])){
   if(!node)continue;
   node.classList.remove("has-photo");node.style.removeProperty("background-image");
  }
 }else{
  const cover=$("#profile-cover-image"),img=$("#profile-cover-photo");
  if(img){img.removeAttribute("src");img.hidden=true;}
  cover?.classList.remove("has-photo");
  const view=$("#profile-cover-view");if(view)view.hidden=true;
  const system=$("#profile-cover-system");if(system)system.hidden=false;
 }
}

const verifiedPhotoPaths={avatar:null,cover:null};
async function loadVerifiedPhoto(url){
 const load=source=>new Promise(resolve=>{
  const image=new Image();
  let settled=false;
  const finish=async ok=>{
   if(settled)return;
   settled=true;
   clearTimeout(timeout);
   image.onload=null;image.onerror=null;
   if(ok&&typeof image.decode==="function"){
    try{
     await Promise.race([
      image.decode().catch(()=>{}),
      new Promise(done=>setTimeout(done,900))
     ]);
    }catch(_){}
   }
   resolve(ok?source:null);
  };
  const timeout=setTimeout(()=>{void finish(false);},6500);
  image.onload=()=>{void finish(true);};
  image.onerror=()=>{void finish(false);};
  image.src=source;
 });

 return await load(url)||
  await load(url+(url.includes("?")?"&":"?")+"retry="+Date.now());
}
async function showPhoto(client,vatraId,kind,path,includeHeader=false){
 const bucket={avatar:"avatars",cover:"covers"}[kind];
 if(!bucket||typeof path!=="string"||!path.startsWith(vatraId+"/"+kind+"/"))
  return false;
 if(!/\.(?:jpg|jpeg|png|webp)$/i.test(path))return false;
 if(verifiedPhotoPaths[kind]===path&&photoUrls[kind])return true;
 const url=client.storage.from(bucket).getPublicUrl(path)?.data?.publicUrl;
 if(!url)return false;
 try{
  const check=new URL(url);
  if(check.protocol!=="https:"||check.hostname!=="cxrcycxrlkufozomsxcs.supabase.co")
   return false;
 }catch(_){return false;}
 const version=++photoVersion[kind];
 const source=await loadVerifiedPhoto(url);
 if(version!==photoVersion[kind]||!source)return false;
 verifiedPhotoPaths[kind]=path;
 photoUrls[kind]=source;
 if(kind==="avatar"){
  const trigger=$("#profile-avatar-trigger");
  if(trigger){trigger.disabled=false;trigger.setAttribute("aria-label","Переглянути фото профілю");}
  const nodes=includeHeader?[$("#profile-avatar"),$("#feed-header-avatar")]:[$("#profile-avatar")];
  for(const node of nodes){
   if(!node)continue;
   node.style.backgroundImage="url("+JSON.stringify(source)+")";
   node.style.backgroundPosition="center";
   node.style.backgroundRepeat="no-repeat";
   node.style.backgroundSize="cover";
   node.classList.add("has-photo");
   node.textContent="";
  }
 }else{
  const cover=$("#profile-cover-image"),img=$("#profile-cover-photo");
  if(cover&&img){
   img.src=source;img.hidden=false;cover.classList.add("has-photo");
   const view=$("#profile-cover-view");if(view)view.hidden=false;
   const system=$("#profile-cover-system");if(system)system.hidden=true;
  }
 }
 return true;
}
function showVisitorMessage(heading){
 $("#profile-online-dot").hidden=true;
 $("#profile-last-seen").hidden=true;
 $("#profile-last-seen").textContent="";

 document.body.dataset.betaUnavailable="true";
 const statusButton=$("#profile-status");if(statusButton)statusButton.hidden=true;
 photoUrls.avatar=null;photoUrls.cover=null;
 $name.textContent=heading;
 const face=$("#profile-avatar");
 if(face){
  face.textContent="";
  face.classList.remove("has-photo");
  face.style.removeProperty("background-image");
 }
 document.title=heading+" · VATRA БЕТА";
 reveal();
}
async function showOtherProfile(client,vatraId,user,ownId){

 const member=await client.from("member_directory")
  .select("vatra_id").eq("vatra_id",vatraId).maybeSingle();
 if(member.error){showError("Не вдалося перевірити профіль. Повторіть спробу.");return;}
 if(!member.data){
  showVisitorMessage("Користувача не знайдено");
  return;
 }
 const visibility=await client.from("profile_preferences")
  .select("profile_visibility").eq("vatra_id",vatraId).maybeSingle();
 if(visibility.error){showError("Не вдалося перевірити доступ до профілю.");return;}
 if(visibility.data?.profile_visibility&&visibility.data.profile_visibility!=="public"){
  showVisitorMessage("Приватний профіль");
  return;
 }
 const profile=await client.from("public_profiles")
  .select("display_name,status_text").eq("vatra_id",vatraId).maybeSingle();
 if(profile.error){showError("Не вдалося завантажити профіль. Повторіть спробу.");return;}
 if(!profile.data){
  showVisitorMessage("Користувача не знайдено");
  return;
 }
 const name=String(profile.data.display_name||"").trim().slice(0,120)||"Учасник VATRA";
 $name.textContent=name;
  void window.VATRA_VERIFIED?.attach(client,$name,vatraId);
 const initials=name.split(/\s+/).slice(0,2).map(x=>Array.from(x)[0]||"")
  .join("").toLocaleUpperCase("uk-UA")||"V";
 $("#profile-avatar").textContent=initials;
 setupProfileStatus(client,vatraId,false,profile.data.status_text);
 setupProfilePresence(client,vatraId);
 const about=$("#profile-about-text");
 $("#profile-about-heading").textContent="Про профіль";
 if(about){
  about.hidden=false;
  about.textContent="Публічна сторінка VATRA.";
 }
 let media=await client.from("profile_media")
  .select("avatar_path,cover_path").eq("vatra_id",vatraId).maybeSingle();

 if(media.error||!media.data){
  await new Promise(resolve=>setTimeout(resolve,300));
  media=await client.from("profile_media")
   .select("avatar_path,cover_path").eq("vatra_id",vatraId).maybeSingle();
 }
 if(!media.error&&media.data){

  await Promise.all([
   showPhoto(client,vatraId,"avatar",media.data.avatar_path),
   showPhoto(client,vatraId,"cover",media.data.cover_path)
  ]);
 }
 document.title=name+" · VATRA БЕТА";
 reveal();
 openPhotoRequestedByUrl();
 await Promise.all([readCount(client),loadProfileGifts(client,vatraId),activateProfilePosts(client,user,ownId,vatraId)]);
}
function bindPhotos(client,ownId,email){

 const mediaStatus=$("#profile-media-status");
 if(mediaStatus){mediaStatus.textContent="";mediaStatus.hidden=true;}
 const buttons={avatar:$("#profile-avatar-upload-button"),cover:$("#profile-cover-upload-button")};
 const inputs={avatar:$("#profile-avatar-file"),cover:$("#profile-cover-file")};
 const kinds={avatar:"avatars",cover:"covers"};
 const types={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
 const dialog=$("#profile-edit-dialog");
 const display=(kind,path)=>showPhoto(client,ownId,kind,path,true);
 const cacheKey="vatra.beta.verified-media.v1."+ownId;
 let media=null,busy=false,revision=0;

 try{
  const stored=JSON.parse(sessionStorage.getItem(cacheKey)||"null");
  if(stored?.avatar_path)display("avatar",stored.avatar_path);
  if(stored?.cover_path)display("cover",stored.cover_path);
 }catch(_){}
 const saveCachedMedia=()=>{
  try{sessionStorage.setItem(cacheKey,JSON.stringify({
   avatar_path:media?.avatar_path||null,cover_path:media?.cover_path||null
  }));}catch(_){}
 };
 const load=async()=>{
  const expected=revision;
  let response=await client.from("profile_media")
   .select("avatar_path,cover_path").eq("vatra_id",ownId).maybeSingle();

  if(response.error){
   await new Promise(resolve=>setTimeout(resolve,300));
   response=await client.from("profile_media")
    .select("avatar_path,cover_path").eq("vatra_id",ownId).maybeSingle();
  }
  if(expected!==revision||response.error)return;
  media=response.data;
  const photos=[];
  for(const kind of ["avatar","cover"]){
   const path=media?.[kind+"_path"];
   if(path)photos.push(display(kind,path));
   else clearProfilePhoto(kind,true);
  }

  await Promise.all(photos);
  if(expected!==revision)return;
  window.VATRA_AVATAR?.fromPath(client,email,ownId,media?.avatar_path||null);
  saveCachedMedia();
 };
 for(const kind of Object.keys(buttons)){
  buttons[kind].hidden=false;
  buttons[kind].addEventListener("click",()=>inputs[kind].click());
  inputs[kind].addEventListener("change",()=>{
   const file=inputs[kind].files?.[0];
   if(file)void upload(file,kind);
  });
 }
 function msg(text,bad=false){
  status(text,bad);

  if(mediaStatus){mediaStatus.hidden=true;mediaStatus.textContent="";}
 }

 const ownedPhotoPath=(kind,path)=>typeof path==="string"&&
  new RegExp("^"+ownId+"/"+kind+"/[^/]+\\.(?:jpe?g|png|webp)$","i").test(path);
 const readOwnMedia=async()=>{
  const {data,error}=await client.from("profile_media")
   .select("avatar_path,cover_path").eq("vatra_id",ownId).maybeSingle();
  if(error)throw error;
  return data;
 };
 async function upload(file,kind){
  if(busy)return;
  const ext=types[file.type];
  if(!ext||file.size>6291456||file.size<1){
   msg("Оберіть JPEG, PNG або WebP не більше 6 МБ.",true);return;
  }
  busy=true;
  revision++;
  Object.values(buttons).forEach(btn=>btn.disabled=true);
  msg("Завантаження зображення…");
  const uid=typeof crypto.randomUUID==="function"?crypto.randomUUID():
   Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,"0")).join("");
  const path=ownId+"/"+kind+"/"+uid+"."+ext;
  const column=kind==="avatar"?"avatar_path":"cover_path";
  let uploaded=false,committed=false;
  try{

   const before=await readOwnMedia();
   const previousPath=before?.[column]||null;
   const {error:uploadError}=await client.storage.from(kinds[kind]).upload(
    path,file,{contentType:file.type,cacheControl:"3600",upsert:false});
   if(uploadError)throw uploadError;
   uploaded=true;
   const values={[column]:path,updated_at:new Date().toISOString()};
   let action=before?
    client.from("profile_media").update(values).eq("vatra_id",ownId):
    client.from("profile_media").insert({vatra_id:ownId,...values});

   if(before)action=previousPath===null?
    action.is(column,null):action.eq(column,previousPath);
   let writeData=null,writeError=null;
   try{
    const result=await action.select(column).maybeSingle();
    writeData=result.data;writeError=result.error;
   }catch(error){writeError=error;}
   let latest=null,readVerified=false;
   try{
    latest=await readOwnMedia();
    readVerified=true;
   }catch(_){}
   const confirmed=readVerified?
    latest?.[column]===path:(!writeError&&writeData?.[column]===path);
   if(!confirmed)throw writeError||new Error("New profile image was not saved");
   committed=true;
   media={...(latest||before||media||{}),...values};
   saveCachedMedia();
   display(kind,path);
   if(kind==="avatar")window.VATRA_AVATAR?.fromPath(client,email,ownId,path);

   let cleanupWarning="";
   if(previousPath&&previousPath!==path&&ownedPhotoPath(kind,previousPath)){
    if(readVerified&&latest?.[column]===path){
     try{
      const {error:removeError}=await client.storage.from(kinds[kind])
       .remove([previousPath]);
      if(removeError)throw removeError;
     }catch(_){
      cleanupWarning="Нове фото збережено, але старе не вдалося видалити зі сховища.";
     }
    }else{
     cleanupWarning="Нове фото збережено. Старий файл буде потрібно видалити після перевірки з’єднання.";
    }
   }
   msg(cleanupWarning,!!cleanupWarning);
  }catch(error){

   let cleanupPending=false;
   if(uploaded&&!committed){
    try{
     const current=await readOwnMedia();
     if(current?.[column]!==path){
      const {error:removeError}=await client.storage.from(kinds[kind]).remove([path]);
      if(removeError)cleanupPending=true;
     }else cleanupPending=true;
    }catch(_){cleanupPending=true;}
   }
   msg(cleanupPending?
    "Перевірте підключення й оновіть профіль: стан фото не вдалося підтвердити або завершити очищення.":
    "Не вдалося зберегти зображення. Перевірте з’єднання й повторіть.",true);
   void load();
  }finally{
   busy=false;
   Object.values(buttons).forEach(btn=>btn.disabled=false);
   Object.values(inputs).forEach(input=>input.value="");
  }
 }
 const edit=$("#profile-edit-open");
 edit.hidden=false;
 edit.addEventListener("click",()=>{status("");dialog.showModal();});
 $("#profile-edit-cancel")?.addEventListener("click",()=>dialog.close());
 $("#profile-edit-form")?.addEventListener("submit",event=>{
  event.preventDefault();
  if(!busy)dialog.close();
 });
 dialog.addEventListener("click",event=>{if(event.target===dialog&&!busy)dialog.close();});
 return load();
}
function bindMemberSearch(client,ownId){

 const form=$("#feed-search-form"),input=$("#feed-search-input");
 const panel=$("#vatra-search-panel"),results=$("#beta-search-results");
 const back=$("#vatra-search-back"),clear=$("#feed-search-clear-input");
 const more=$("#beta-search-more"),heading=$("#beta-search-heading");
 const count=$("#beta-search-result-count"),brand=$(".feed-brand-search");
 if(!form||!input||!panel||!results||!back||!clear||!more||!heading||!brand)return;

 document.body.append(panel);
 const storageKey="vatra.beta.search.recent.profiles.v2."+ownId;
 const pageSize=40;
 let visible=false,timer=null,controller=null,serial=0,term="",offset=0;
 let total=0,hasMore=false,loading=false;
 const seen=new Set();

 const recentRead=()=>{
  try{
   const data=JSON.parse(localStorage.getItem(storageKey)||"[]");
   return Array.isArray(data)?data.filter(x=>typeof x==="string"&&validId(x))
    .slice(0,8):[];
  }catch(_){return [];}
 };
 const remember=id=>{
  const value=String(id);
  if(!validId(value))return;
  const records=[value,...recentRead().filter(x=>x!==value)].slice(0,8);
  try{localStorage.setItem(storageKey,JSON.stringify(records));}catch(_){}
 };
 const message=(value,extra="")=>{
  const p=document.createElement("p");p.className="beta-search-message "+extra;
  p.textContent=value;results.append(p);
 };
 const stop=()=>{
  if(timer!==null){clearTimeout(timer);timer=null;}
  if(controller){controller.abort();controller=null;}
  serial++;loading=false;
 };
 const position=()=>{
  if(!visible)return;
  const header=$(".feed-header")?.getBoundingClientRect();
  const search=form.getBoundingClientRect();
  const vw=window.innerWidth,vh=window.innerHeight;
  const mobile=window.matchMedia("(max-width:600px)").matches;
  const viewport=window.visualViewport;
  const top=Math.max(header?.bottom||search.bottom,mobile?(viewport?.offsetTop||0):0);
  const bottom=mobile&&viewport?viewport.height+viewport.offsetTop:vh;
  panel.style.left="0px";
  panel.style.top=Math.round(top)+"px";
  panel.style.width=Math.round(mobile?vw:Math.min(vw,Math.max(300,search.right)))+"px";
  panel.style.maxHeight=Math.max(mobile?60:130,Math.round(bottom-top-10))+"px";
 };
 const resetView=async()=>{
  stop();
  const ticket=serial;
  term="";offset=0;total=0;hasMore=false;seen.clear();
  heading.textContent="Нещодавно переглянуті";count.textContent="";more.hidden=true;
  results.replaceChildren();
  const records=recentRead();
  if(!records.length){message("Ви ще не переглядали профілі через пошук");return;}
  message("Завантажуємо переглянуті профілі…");
  try{
   const profiles=await client.from("public_profiles")
    .select("vatra_id,display_name").in("vatra_id",records);
   if(ticket!==serial)return;
   if(profiles.error)throw profiles.error;
   const rows=profiles.data||[];
   const ids=rows.map(x=>String(x.vatra_id)).filter(validId);
   if(!ids.length){results.replaceChildren();message("Переглянутих профілів немає");return;}
   const permissions=await client.from("profile_preferences")
    .select("vatra_id,profile_visibility").in("vatra_id",ids);
   if(ticket!==serial)return;
   if(permissions.error)throw permissions.error;
   const hidden=new Set((permissions.data||[])
    .filter(x=>x.profile_visibility&&x.profile_visibility!=="public")
    .map(x=>String(x.vatra_id)));
   const shown=rows.filter(x=>!hidden.has(String(x.vatra_id)));
   const media=shown.length?await client.from("profile_media")
    .select("vatra_id,avatar_path")
    .in("vatra_id",shown.map(x=>String(x.vatra_id))):{data:[],error:null};
   if(ticket!==serial)return;
   const pictures=new Map((media.error?[]:media.data||[])
    .map(x=>[String(x.vatra_id),x.avatar_path]));
   const people=new Map(shown.map(x=>[String(x.vatra_id),x]));
   results.replaceChildren();
   for(const id of records){
    const person=people.get(id);
    if(person)addRow(person,pictures.get(id),true);
   }
   if(!total)message("Переглянутих профілів немає");
  }catch(_){
   if(ticket===serial){
    results.replaceChildren();message("Не вдалося завантажити переглянуті профілі.","beta-search-error");
   }
  }
 };
 const close=()=>{
  if(!visible)return;
  visible=false;stop();
  panel.hidden=true;input.setAttribute("aria-expanded","false");
  brand.classList.remove("vatra-search-active");
  back.setAttribute("aria-hidden","true");back.tabIndex=-1;
  clear.hidden=true;
 };
 const open=()=>{
  if(!visible){
   visible=true;panel.hidden=false;
   brand.classList.add("vatra-search-active");
   back.removeAttribute("aria-hidden");back.tabIndex=0;
   input.setAttribute("aria-expanded","true");
  }
  position();
 };
 const validAvatar=(id,path)=>{
  if(typeof path!=="string"||!path.startsWith(id+"/avatar/")||
   !/\.(?:png|jpe?g|webp)$/i.test(path))return null;
  const url=client.storage.from("avatars").getPublicUrl(path)?.data?.publicUrl;
  try{
   const dest=new URL(url);
   return dest.protocol==="https:"&&dest.hostname==="cxrcycxrlkufozomsxcs.supabase.co"?
    dest.href:null;
  }catch(_){return null;}
 };
 const addRow=(person,path,isRecent=false)=>{
  const id=String(person.vatra_id||"");
  if(!validId(id)||seen.has(id))return;
  seen.add(id);total++;
  const link=document.createElement("a");
  link.className="beta-search-result";
  link.href=ownProfile(id);
  link.setAttribute("aria-label",String(person.display_name||"Учасник VATRA")+" — VATRA ID "+id);
  const face=document.createElement("span");
  face.className="beta-search-avatar";
  face.setAttribute("aria-hidden","true");
  const avatar=validAvatar(id,path);
  if(avatar){
   const img=document.createElement("img");
   img.className="beta-search-avatar-image";img.src=avatar;img.alt="";
   img.loading="lazy";img.decoding="async";
   face.append(img);
  }
  const name=document.createElement("strong");
  name.className="beta-search-name";
  name.textContent=String(person.display_name||"").trim().slice(0,120)||"Учасник VATRA";
   void window.VATRA_VERIFIED?.attach(client,name,id);
  const number=document.createElement("span");
  number.className="beta-search-id";number.textContent="ID "+id;
  link.append(face,name,number);
  link.addEventListener("click",()=>remember(id));
  if(!isRecent){
   results.append(link);
   return;
  }
  const row=document.createElement("div");
  row.className="beta-search-history-entry";
  const remove=document.createElement("button");
  remove.type="button";
  remove.className="beta-search-history-remove";
  remove.textContent="×";
  remove.setAttribute("aria-label","Видалити "+name.textContent+" з історії");
  remove.title="Видалити з історії";
  remove.addEventListener("click",event=>{
   event.preventDefault();event.stopPropagation();
   const remaining=recentRead().filter(saved=>saved!==id);
   try{localStorage.setItem(storageKey,JSON.stringify(remaining));}catch(_){}
   row.remove();
   seen.delete(id);
   total=Math.max(0,total-1);
   if(!results.querySelector(".beta-search-history-entry"))
    message("Ви ще не переглядали профілі через пошук");
  });
  row.append(link,remove);
  results.append(row);
 };
 const fetchPage=async ticket=>{
  if(loading||ticket!==serial||!term)return;
  loading=true;more.hidden=true;
  let spinner=null;
  try{
   spinner=document.createElement("p");
   spinner.className="beta-search-message beta-search-loading";
   spinner.textContent="Шукаємо у VATRA…";results.append(spinner);
   const exact=term.match(/^(?:id\s*#?\s*)?([1-9][0-9]{0,18})$/i);
   let query=client.from("public_profiles").select("vatra_id,display_name");
   if(exact)query=query.eq("vatra_id",exact[1]);
   else{
    const escaped=term.replace(/[\%_]/g,ch=>"\\"+ch);
    query=query.ilike("display_name","%"+escaped+"%");
   }
   if(typeof query.abortSignal==="function"){
    controller=new AbortController();query=query.abortSignal(controller.signal);
   }
   const {data,error}=await query.order("vatra_id",{ascending:true})
    .range(offset,offset+pageSize-1);
   if(ticket!==serial)return;
   if(error)throw error;
   const rows=data||[];
   offset+=rows.length;hasMore=!exact&&rows.length===pageSize;
   if(rows.length){
    const ids=rows.map(x=>String(x.vatra_id)).filter(validId);
    const permissions=await client.from("profile_preferences")
     .select("vatra_id,profile_visibility").in("vatra_id",ids);
    if(ticket!==serial)return;
    if(permissions.error)throw permissions.error;
    const hidden=new Set((permissions.data||[])
     .filter(x=>x.profile_visibility&&x.profile_visibility!=="public")
     .map(x=>String(x.vatra_id)));
    const shown=rows.filter(x=>!hidden.has(String(x.vatra_id)));
    const media=shown.length?await client.from("profile_media")
     .select("vatra_id,avatar_path")
     .in("vatra_id",shown.map(x=>String(x.vatra_id))):{data:[],error:null};
    if(ticket!==serial)return;
    const photos=new Map((media.error?[]:media.data||[])
     .map(x=>[String(x.vatra_id),x.avatar_path]));
    for(const person of shown)addRow(person,photos.get(String(person.vatra_id)));
   }
   if(ticket!==serial)return;
   count.textContent=total?"Знайдено: "+total:"";
   if(!total&&!hasMore)message("Користувачів не знайдено");
   more.hidden=!hasMore;
  }catch(_){
   if(ticket===serial)message("Не вдалося виконати пошук. Спробуйте ще раз.","beta-search-error");
  }finally{
   spinner?.remove();
   if(ticket===serial)loading=false;
   controller=null;
  }
 };
 const search=()=>{
  stop();
  term=input.value.trim().replace(/\s+/g," ").slice(0,120);
  offset=0;total=0;hasMore=false;seen.clear();
  results.replaceChildren();
  heading.textContent=term?"Результати пошуку":"Нещодавно переглянуті";
  count.textContent="";clear.hidden=!term;more.hidden=true;
  if(!term){void resetView();return;}
  if(term.length<2&&!/^[1-9]$/.test(term)){message("Введіть щонайменше 2 символи");return;}
  const ticket=serial;
  timer=setTimeout(()=>{timer=null;void fetchPage(ticket);},220);
 };
 input.addEventListener("focus",()=>{open();if(!input.value.trim())void resetView();});
 input.addEventListener("input",()=>{open();search();});
 input.addEventListener("search",()=>{open();search();});
 input.addEventListener("keydown",event=>{
  if(event.key==="Escape"){event.preventDefault();close();input.blur();}
  if(event.key==="ArrowDown"&&visible){
   const row=results.querySelector("a,button");
   if(row){event.preventDefault();row.focus();}
  }
 });
 form.addEventListener("submit",event=>{
  event.preventDefault();open();search();
 });
 clear.addEventListener("click",()=>{
  input.value="";search();input.focus({preventScroll:true});
 });
 back.addEventListener("click",()=>{close();input.blur();});
 more.addEventListener("click",()=>{
  if(!loading&&hasMore){
   more.hidden=true;void fetchPage(serial);
  }
 });
 document.addEventListener("pointerdown",event=>{
  if(visible&&!form.contains(event.target)&&!panel.contains(event.target)&&
   !back.contains(event.target))close();
 });
 document.addEventListener("keydown",event=>{if(event.key==="Escape")close();});
 window.addEventListener("resize",position,{passive:true});
 window.addEventListener("scroll",position,{passive:true});
 window.visualViewport?.addEventListener("resize",position,{passive:true});
 window.visualViewport?.addEventListener("scroll",position,{passive:true});
 void resetView();
}
function bindAccountMenu(){
 const menu=$(".feed-account-menu");
 if(!menu)return;

 document.addEventListener("pointerdown",event=>{
  if(menu.open&&!menu.contains(event.target))menu.open=false;
 });
 document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&menu.open){
   menu.open=false;
   menu.querySelector("summary")?.focus({preventScroll:true});
  }
 });
 document.addEventListener("focusin",event=>{
  if(menu.open&&!menu.contains(event.target))menu.open=false;
 });
}
function setupProfilePresence(client,targetId){

 const dot=$("#profile-online-dot"),caption=$("#profile-last-seen");
 if(!dot||!caption||!window.VATRA_PRESENCE)return;
 let disposed=false,requestInFlight=false,lastConfirmed=null,resumeTimer=null;
 const render=record=>{
  const state=window.VATRA_PRESENCE.format(record,false);
  dot.hidden=!state.online;

  caption.textContent=state.online?"":state.text;
  caption.hidden=state.online||!state.text;
  if(state.date)caption.dateTime=state.date.toISOString();
  else caption.removeAttribute("datetime");
  dot.setAttribute("aria-label","Зараз у мережі");
 };
 const refresh=async()=>{
  if(disposed||requestInFlight||document.hidden)return;
  requestInFlight=true;
  try{
   const record=await window.VATRA_PRESENCE.load(client,targetId);
   if(disposed)return;
   if(record?.last_seen_at)lastConfirmed=record;

   render(record?.last_seen_at?record:lastConfirmed);
  }catch(_){
   if(!disposed)render(lastConfirmed);
  }finally{requestInFlight=false;}
 };
 void refresh();

 const timer=setInterval(()=>{void refresh();},60000);
 const visible=()=>{
  if(document.hidden)return;
  if(resumeTimer!==null)clearTimeout(resumeTimer);

  resumeTimer=setTimeout(()=>{resumeTimer=null;void refresh();},1800);
 };
 document.addEventListener("visibilitychange",visible,{passive:true});
 window.addEventListener("pagehide",()=>{
  disposed=true;clearInterval(timer);
  if(resumeTimer!==null)clearTimeout(resumeTimer);
  document.removeEventListener("visibilitychange",visible);
 },{once:true});
}
function setupProfileStatus(client,vatraId,mine,initialStatus){
 const button=$("#profile-status"),caption=$("#profile-status-text");
 if(!button||!caption)return;
 let saved=String(initialStatus||"").trim().slice(0,140);
 const render=()=>{
  caption.textContent=saved||(mine?"Додайте статус":"");
  button.hidden=!mine&&!saved;
  button.disabled=!mine;
  button.classList.toggle("is-editable",mine);
  if(mine)button.setAttribute("aria-label","Змінити статус");
  else button.setAttribute("aria-label","Статус користувача");
 };
 render();
 if(!mine)return;
 const dialog=$("#profile-status-dialog"),input=$("#profile-status-input");
 const counter=$("#profile-status-counter"),save=$("#profile-status-save"),note=$("#profile-status-error");
 if(!dialog||!input||!counter||!save||!note)return;
 const updateCounter=()=>{counter.textContent=Array.from(input.value).length+" / 140";};
 button.addEventListener("click",()=>{
  input.value=saved;updateCounter();note.hidden=true;
  dialog.showModal();input.focus({preventScroll:true});
 });
 input.addEventListener("input",updateCounter);
 $("#profile-status-cancel")?.addEventListener("click",()=>dialog.close());
 $("#profile-status-form")?.addEventListener("submit",async event=>{
  event.preventDefault();
  if(save.disabled)return;
  const next=input.value.trim();
  if(Array.from(next).length>140){
   note.textContent="Статус не може перевищувати 140 символів.";
   note.hidden=false;return;
  }
  save.disabled=true;note.hidden=true;
  try{
   const {data,error}=await client.from("public_profiles")
    .update({status_text:next||null}).eq("vatra_id",vatraId)
    .select("status_text").maybeSingle();
   if(error||!data)throw error||new Error("Status was not saved");
   saved=String(data.status_text||"").slice(0,140);
   render();dialog.close();
  }catch(_){
   note.textContent="Не вдалося зберегти статус. Повторіть спробу.";
   note.hidden=false;
  }finally{save.disabled=false;}
 });
}
async function boot(){
 await window.VATRA_LANGUAGE?.ready;
 if(!window.supabase?.createClient){showError("Не вдалося завантажити сервіс входу.");return;}
 const client=window.supabase.createClient(URL_ROOT,PUBLIC_KEY,{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,flowType:"pkce"}
 });
 const {data,error}=await client.auth.getUser();
 if(error||!data?.user?.id||!data.user.email_confirmed_at){
  location.replace(home());return;
 }
 const user=data.user,md=user.user_metadata||{};
 const displayName=[md.first_name,md.last_name].filter(x=>typeof x==="string"&&x.trim())
  .map(x=>x.trim()).join(" ").slice(0,120)||
  String(md.full_name||"").trim().slice(0,120)||"Учасник VATRA";
 $name.textContent=displayName;
 const firstName=String(md.first_name||"").trim()||displayName.split(/\s+/)[0];
 $("#feed-menu-name").textContent=firstName.slice(0,32);
 const initials=displayName.split(/\s+/).slice(0,2).map(x=>Array.from(x)[0]||"")
  .join("").toLocaleUpperCase("uk-UA")||"V";
 $("#profile-avatar").textContent=initials;

 $("#feed-header-avatar").textContent="";
 lockUI();
 bindFullscreenPhotos();
 bindAccountMenu();
 $("#feed-logout")?.addEventListener("click",async()=>{
  const btn=$("#feed-logout");btn.disabled=true;
  try{
   const {error}=await client.auth.signOut({scope:"local"});
   if(error)throw error;
   try{sessionStorage.setItem("vatra-just-signed-out","1");}catch(_){}
   location.replace(home());
  }catch(_){
   btn.disabled=false;
   const menu=$(".feed-account-dropdown");
   if(menu){
    let message=$("#beta-logout-error");
    if(!message){
     message=document.createElement("p");
     message.id="beta-logout-error";message.className="beta-logout-error";
     message.setAttribute("role","alert");menu.append(message);
    }
    message.textContent="Не вдалося вийти. Спробуйте ще раз.";
   }
  }
 });
 const account=await client.from("accounts")
  .select("vatra_id").eq("user_id",user.id).maybeSingle();

 if(account.error||!validId(account.data?.vatra_id)){
  showError("Не вдалося отримати VATRA ID. Перевірте з’єднання й повторіть спробу.");
  return;
 }
 const ownId=String(account.data.vatra_id);

 await window.VATRA_PRESENCE?.start(client,ownId,user.user_metadata?.gender);
 const ownUrl=ownProfile(ownId);
 const ownLink=$("#feed-menu-own-profile");
 if(ownLink)ownLink.href=ownUrl;
 bindMemberSearch(client,ownId);
 window.VATRA_AVATAR?.setHeader({email:user.email,name:firstName.slice(0,32),initials,id:ownId});
 const relative=location.pathname.startsWith(root.pathname)?
  location.pathname.slice(root.pathname.length):"";
 const requested=relative.match(/^id([1-9][0-9]{0,18})\/?$/);
 $(".feed-header-brand")?.setAttribute("href",ownUrl);
 if(requested&&requested[1]!==ownId){

  const ownMedia=await client.from("profile_media")
   .select("avatar_path").eq("vatra_id",ownId).maybeSingle();
  if(!ownMedia.error)
   window.VATRA_AVATAR?.fromPath(client,user.email,ownId,ownMedia.data?.avatar_path||null);

  await showOtherProfile(client,requested[1],user,ownId);
  return;
 }
 if(!requested)history.replaceState(history.state,"",ownUrl);
 const ownPublic=await client.from("public_profiles")
  .select("display_name,status_text").eq("vatra_id",ownId).maybeSingle();
 if(!ownPublic.error&&ownPublic.data){
  const profileName=String(ownPublic.data.display_name||"").trim().slice(0,120);
  if(profileName)$name.textContent=profileName;
  setupProfileStatus(client,ownId,true,ownPublic.data.status_text);
 }else{
  setupProfileStatus(client,ownId,true,"");
 }
 void window.VATRA_VERIFIED?.attach(client,$name,ownId);
  await bindPhotos(client,ownId,user.email);
 setupProfilePresence(client,ownId);
 reveal();
 openPhotoRequestedByUrl();
 await Promise.all([readCount(client),loadProfileGifts(client,ownId),activateProfilePosts(client,user,ownId,ownId)]);
}
boot().catch(()=>showError("Не вдалося відкрити профіль. Спробуйте ще раз."));
})();