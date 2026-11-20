(()=>{
 "use strict";
 if(window.VATRA_HOST_ALLOWED===false)return;
 const tr=(uk,en)=>document.documentElement.lang==="en"?en:uk;
 const validId=value=>/^[1-9]\d{0,18}$/.test(String(value||""));
 const validUUID=value=>/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(String(value||""));
 const make=(tag,className,text)=>{
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(text!==undefined)node.textContent=text;
  return node;
 };
 const glyph=type=>{
  const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("width","20");
  svg.setAttribute("height","20");svg.setAttribute("fill","none");
  svg.setAttribute("stroke","currentColor");svg.setAttribute("stroke-width","1.85");
  svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");
  svg.setAttribute("aria-hidden","true");svg.classList.add("ui-vatra-post-action-symbol-001");
  const path=(d)=>{
   const el=document.createElementNS("http://www.w3.org/2000/svg","path");
   el.setAttribute("d",d);svg.append(el);
  };
  if(type==="heart")path("M12 20.5 4.8 13.4C-1 7.6 7.2 1.5 12 7c4.8-5.5 13 .6 7.2 6.4Z");
  if(type==="thumb")path("M8 10.5 12.3 3c.6-1 2.1-.6 2.1.8v4.7h4.3a2.8 2.8 0 0 1 2.7 3.4l-1.6 6.7a2.8 2.8 0 0 1-2.7 2.1H8V10.5ZM3 10.5h5v10H3z");
  if(type==="comments")path("M20.5 11.3c0 4.8-3.9 8.6-8.6 8.6-1.4 0-2.9-.3-4.2-1L3 20l1.6-4.5a8.5 8.5 0 1 1 15.9-4.2Z");
  if(type==="bookmark")path("M6.5 3.5h11a1 1 0 0 1 1 1V21L12 16.8 5.5 21V4.5a1 1 0 0 1 1-1Z");
  if(type==="paperclip")path("m9 13 6-6a3.2 3.2 0 0 1 4.5 4.5l-8 8a5.2 5.2 0 0 1-7.4-7.4l8-8");
  if(type==="camera")path("M4 7h3l2-3h6l2 3h3v13H4V7ZM12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z");
  if(type==="smile")path("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 14c2.2 3 5.8 3 8 0M9 10h.01M15 10h.01");
  if(type==="arrow")path("M4 12h15m-6-6 6 6-6 6");
  if(type==="video")path("M4 5h13v14H4zM17 9l4-3v12l-4-3");
  if(type==="file")path("M6 3h9l4 4v14H6V3ZM15 3v5h4");
  if(type==="x")path("M5 5 19 19M19 5 5 19");

  if(type==="share")path("M13 5l7 7-7 7v-4.3c-5 0-8.4 1.7-10 4.3.3-7 3.4-10.8 10-10.8V5Z");
  return svg;
 };
 const action=(className,type,label)=>{
  const button=make("button",className);button.type="button";
  button.append(glyph(type),make("span","vt-vatra-post-action-label-001",label));
  button.setAttribute("aria-label",label);button.title=label;
  return button;
 };
 const appRoot=new URL("../../",document.currentScript.src);
 const relativeRoot=()=>appRoot;
 const dateValue=input=>{
  const date=new Date(input);return Number.isNaN(date.valueOf())?"":new Intl.DateTimeFormat(
   document.documentElement.lang==="en"?"en-US":"uk-UA",
   {day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}
  ).format(date);
 };
 async function authorMap(client,rows){
  const ids=[...new Set(rows.map(x=>String(x.author_vatra_id)).filter(validId))];
  const names=new Map(),images=new Map();
  if(!ids.length)return {names,images};
  const [profile,media]=await Promise.all([
   (window.VATRA_PUBLIC_NAMES?.get(client,ids)||
    client.from("public_profiles").select("vatra_id,display_name").in("vatra_id",ids)),
   (window.VATRA_AVATAR?.paths?.(client,ids)||
    client.from("profile_media").select("vatra_id,avatar_path").in("vatra_id",ids))
  ]);
  if(!profile.error)for(const x of profile.data||[])names.set(String(x.vatra_id),x.display_name);
  if(!media.error)for(const x of media.data||[]){
   const id=String(x.vatra_id),path=x.avatar_path;
   if(typeof path!=="string"||!path.startsWith(id+"/avatar/"))continue;
   const url=client.storage.from("avatars").getPublicUrl(path)?.data?.publicUrl;
   if(url)try{
    const validated=new URL(url);
    if(validated.protocol==="https:"&&validated.hostname==="cxrcycxrlkufozomsxcs.supabase.co")
     images.set(id,validated.href);
   }catch(_){}
  }
  return {names,images};
 }
 const COMMENT_PAGE_TTL_MS=4_000,COMMENT_PAGE_MAX=32;
 const commentPageCaches=new WeakMap();
 function commentPageState(client){
  let state=commentPageCaches.get(client);
  if(state)return state;
  state={entries:new Map(),generation:0};
  commentPageCaches.set(client,state);
  if(typeof client.auth?.onAuthStateChange==="function"){
   client.auth.onAuthStateChange(event=>{
    if(event==="INITIAL_SESSION"||event==="TOKEN_REFRESHED")return;
    state.generation++;state.entries.clear();
   });
  }
  return state;
 }
 function invalidateComments(client){
  const state=client&&commentPageCaches.get(client);
  if(state){state.generation++;state.entries.clear();}
 }
 async function commentThreadPage(client,params){
  const {p_kind,p_post_id,p_sort,p_parent,p_offset,p_limit}=params||{};
  if(!client||typeof client.rpc!=="function"||
   !["person","group"].includes(p_kind)||!validUUID(p_post_id)||
   !["relevant","newest","all"].includes(p_sort)||
   (p_parent!==null&&!validUUID(p_parent))||
   !Number.isSafeInteger(p_offset)||p_offset<0||
   !Number.isSafeInteger(p_limit)||p_limit<1||p_limit>50)
   return {data:null,error:Error("Invalid comment page request")};
  const state=commentPageState(client),generation=state.generation;
  const key=JSON.stringify([p_kind,p_post_id,p_sort,p_parent,p_offset,p_limit]);
  const previous=state.entries.get(key);
  if(previous){
   if(previous.pending){
    try{
     const rows=await previous.pending;
     if(state.generation!==generation)throw Error("Viewer changed");
     return {data:rows.map(row=>({...row})),error:null};
    }catch(error){return {data:null,error};}
   }
   if(previous.expires>Date.now()){
    state.entries.delete(key);state.entries.set(key,previous);
    return {data:previous.rows.map(row=>({...row})),error:null};
   }
   state.entries.delete(key);
  }
  const pending=(async()=>{
   const {data,error}=await client.rpc("vatra_comment_thread_page",params);
   if(error)throw error;
   if(state.generation!==generation)throw Error("Viewer changed");
   if(!Array.isArray(data))throw Error("Invalid comment page response");
   return data;
  })();
  state.entries.set(key,{pending,expires:0});
  while(state.entries.size>COMMENT_PAGE_MAX)
   state.entries.delete(state.entries.keys().next().value);
  try{
   const rows=await pending;
   if(state.generation!==generation)throw Error("Viewer changed");
   if(state.entries.get(key)?.pending===pending){
    state.entries.delete(key);
    state.entries.set(key,{rows:rows.map(row=>({...row})),expires:Date.now()+COMMENT_PAGE_TTL_MS});
   }
   return {data:rows.map(row=>({...row})),error:null};
  }catch(error){
   if(state.entries.get(key)?.pending===pending)state.entries.delete(key);
   return {data:null,error};
  }
 }
 const engagementQueryCache=new WeakMap(),engagementAuthBound=new WeakSet();
 const ENGAGEMENT_TTL_MS=3_000,ENGAGEMENT_MAX_PAGES=16;
 function invalidateEngagement(client){
  if(client)engagementQueryCache.delete(client);
 }
 function bindEngagementAuth(client){
  if(engagementAuthBound.has(client))return;
  engagementAuthBound.add(client);
  if(typeof client.auth?.onAuthStateChange==="function")
   client.auth.onAuthStateChange(event=>{
    if(event==="INITIAL_SESSION"||event==="TOKEN_REFRESHED")return;
    invalidateEngagement(client);
   });
 }
 async function prefetchEngagement(client,posts){
  const unique=new Map();
  for(const post of posts||[]){
   const kind=post?.kind==="group"?"group":"person";
   if(validUUID(post?.id))unique.set(kind+":"+post.id,{kind,id:post.id});
  }
  const requested=[...unique.values()],empty=new Map();
  if(!requested.length||typeof client?.rpc!=="function")return empty;
  bindEngagementAuth(client);
  const key=requested.map(post=>post.kind+":"+post.id).sort().join("|");
  let cache=engagementQueryCache.get(client);
  if(!cache){cache=new Map();engagementQueryCache.set(client,cache);}
  const previous=cache.get(key);
  if(previous){
   if(previous.pending){
    try{
     const result=await previous.pending;
     return engagementQueryCache.get(client)===cache?new Map(result):new Map();
    }catch(_){return new Map();}
   }
   if(previous.expires>Date.now())return new Map(previous.data);
   cache.delete(key);
  }
  const pending=(async()=>{
   const result=new Map();
   for(let i=0;i<requested.length;i+=24){
    const {data,error}=await client.rpc("post_engagement_page",{
     p_posts:requested.slice(i,i+24)
    });
    if(error)throw error;
    for(const item of data||[]){
     if(validUUID(item?.post_id)&&["group","person"].includes(item.post_kind))
      result.set(item.post_kind+":"+item.post_id,item);
    }
   }
   return result;
  })();
  cache.set(key,{pending,expires:0});
  try{
   const result=await pending;
   if(engagementQueryCache.get(client)!==cache)return new Map();
   if(engagementQueryCache.get(client)===cache){
    cache.delete(key);
    cache.set(key,{data:new Map(result),expires:Date.now()+ENGAGEMENT_TTL_MS});
    while(cache.size>ENGAGEMENT_MAX_PAGES)cache.delete(cache.keys().next().value);
   }
   return result;
  }catch(_){
   if(engagementQueryCache.get(client)===cache)cache.delete(key);
   return new Map();
  }
 }
function appendAudience(container,level,isGroup=false){
  if(!container)return;
  const visibility=isGroup?"group":["public","friends","only_me"].includes(level)?level:"public";
  const label=visibility==="friends"?tr("Для друзів","Friends only"):
   visibility==="only_me"?tr("Лише я","Only me"):
   visibility==="group"?tr("Учасники спільноти","Community members"):
   tr("Публічно","Public");
  const marker=make("span","feed-post-audience ui-feed-post-audience-001");
  marker.setAttribute("aria-label",label);
  marker.tabIndex=0;
  const hint=make("span","vt-vatra-post-audience-hint-001",label);
  hint.setAttribute("aria-hidden","true");
  const symbol=glyph(visibility==="only_me"?"bookmark":visibility==="public"?"share":"comments");
  symbol.setAttribute("class","ui-feed-post-audience-icon-001");
  symbol.replaceChildren();
  const ns="http://www.w3.org/2000/svg";
  const path=document.createElementNS(ns,"path");
  if(visibility==="only_me")path.setAttribute("d","M7 10V7a5 5 0 0 1 10 0v3M5.5 10.5h13v10h-13z");
  else if(visibility==="public")path.setAttribute("d","M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c-4 4-4 14 0 18M12 3c4 4 4 14 0 18");
  else path.setAttribute("d","M15.5 10a3 3 0 1 0-6 0 3 3 0 0 0 6 0ZM4 21v-1a8 8 0 0 1 16 0v1M5.5 9a2.5 2.5 0 0 0 0 5M18.5 9a2.5 2.5 0 0 1 0 5");
  symbol.append(path);marker.append(symbol,hint);
  container.append(marker);
 }
 let ownerMenuListenersBound=false;
 function addOwnerMenu(header,{source="feed",onArchive=null,onDelete}={}){
  if(!header||typeof onDelete!=="function")return null;
  const details=make("details","vatra-post-owner-menu ui-vatra-post-owner-menu-001");
  details.dataset.vatraPostOwnerMenu="";
  const summary=make("summary","vatra-post-owner-toggle vt-vatra-post-owner-toggle-001");
  summary.setAttribute("aria-label",tr("Дії з публікацією","Post options"));
  summary.title=tr("Дії з публікацією","Post options");
  const dots=document.createElementNS("http://www.w3.org/2000/svg","svg");
  dots.setAttribute("viewBox","0 0 24 24");
  dots.setAttribute("width","21");dots.setAttribute("height","21");
  dots.setAttribute("fill","currentColor");dots.setAttribute("aria-hidden","true");
  dots.classList.add("ui-vatra-post-owner-dots-001");
  for(const x of [5,12,19]){
   const c=document.createElementNS("http://www.w3.org/2000/svg","circle");
   c.setAttribute("cx",String(x));c.setAttribute("cy","12");c.setAttribute("r","1.65");
   dots.append(c);
  }
  summary.append(dots);
  const panel=make("div","vatra-post-owner-panel ui-vatra-post-owner-panel-001");
  panel.setAttribute("role","group");
  panel.setAttribute("aria-label",tr("Керування публікацією","Manage post"));
  const option=(kind,text,handler)=>{
   const extra=source==="profile"?
    (kind==="archive"?"vt-profile-post-archive-001":"vt-profile-post-remove-001"):
    (kind==="archive"?"vt-feed-post-archive-001":"feed-post-delete vt-feed-post-delete-001");
   const button=make("button","vatra-post-owner-action vt-vatra-post-owner-"+kind+"-001 "+extra,text);
   button.type="button";
   button.addEventListener("click",()=>{
    details.open=false;
    if(button.disabled)return;
    void handler();
   });
   panel.append(button);
  };
  if(typeof onArchive==="function")
   option("archive",tr("Зберегти в архів","Move to archive"),onArchive);
  option("delete",tr("Видалити","Delete"),onDelete);
  details.append(summary,panel);
  details.addEventListener("toggle",()=>{
   if(!details.open)return;
   document.querySelectorAll("details[data-vatra-post-owner-menu]").forEach(item=>{
    if(item!==details)item.open=false;
   });
  });
  if(!ownerMenuListenersBound){
   ownerMenuListenersBound=true;
   document.addEventListener("pointerdown",event=>{
    document.querySelectorAll("details[data-vatra-post-owner-menu][open]").forEach(item=>{
     if(!item.contains(event.target))item.open=false;
    });
   });
   document.addEventListener("keydown",event=>{
    if(event.key!=="Escape")return;
    const open=document.querySelector("details[data-vatra-post-owner-menu][open]");
    if(!open)return;
    event.preventDefault();open.open=false;open.querySelector("summary")?.focus();
   });
  }
  header.append(details);
  return details;
 }
 function mount(client,post,container,settings={}){
  const kind=post?.kind==="group"?"group":"person";
  if(!validUUID(post?.id)||!client||!container)return;
  const ownId=String(settings.ownId||""),userId=settings.userId;
  const snapshot=settings.engagement?.post_id===post.id&&settings.engagement?.post_kind===kind?
   settings.engagement:null;
  const shell=make("section","vatra-post-interactions ui-vatra-post-interactions-001");
  shell.setAttribute("aria-label",tr("Взаємодія з публікацією","Post interactions"));
  const row=make("div","vatra-post-action-row ui-vatra-post-action-row-001");
  const like=action("vt-vatra-post-like-001","thumb",tr("Подобається","Like"));
  like.setAttribute("aria-pressed","false");
  const count=make("span","vt-vatra-post-like-count-001","0");
  like.append(count);
  const commentsButton=action("vt-vatra-post-comments-toggle-001","comments",tr("Коментарі","Comments"));
  const commentsCount=make("span","vt-vatra-post-comments-count-001","0");
  commentsButton.append(commentsCount);
  commentsButton.setAttribute("aria-expanded","false");
  row.append(like,commentsButton);shell.append(row);
  const status=make("p","vt-vatra-post-interactions-status-001");
  status.setAttribute("role","status");status.hidden=true;
  const feedback=(message,bad=false)=>{
   status.hidden=!message;status.textContent=message;status.dataset.state=bad?"error":"ok";
  };
  let likeReady=!!snapshot,likePending=null,liked=!!snapshot?.viewer_liked,
   likeCount=Math.max(0,Number(snapshot?.like_count)||0);
  if(snapshot){
   count.textContent=String(likeCount);
   like.setAttribute("aria-pressed",String(liked));
   like.classList.toggle("is-liked",liked);
  }
  const likeFilter=query=>query.eq("post_kind",kind).eq("post_id",post.id);
  const hydrateLike=()=>{
   if(likeReady)return Promise.resolve();
   if(likePending)return likePending;
   likePending=(async()=>{
    const [total,mine]=await Promise.all([
     likeFilter(client.from("post_likes").select("liker_id",{count:"exact",head:true})),
     likeFilter(client.from("post_likes").select("liker_id")).eq("liker_id",userId).limit(1)
    ]);
    if(total.error||mine.error)throw total.error||mine.error;
    likeCount=total.count||0;liked=!!mine.data?.length;likeReady=true;
    count.textContent=String(Math.max(0,likeCount));
    like.setAttribute("aria-pressed",String(liked));
    like.classList.toggle("is-liked",liked);
   })().catch(()=>feedback(tr("Вподобання тимчасово недоступні.","Likes temporarily unavailable."),true))
    .finally(()=>{likePending=null;});
   return likePending;
  };
  if(!snapshot&&typeof IntersectionObserver!=="undefined"){
   const observer=new IntersectionObserver(entries=>{
    if(entries.some(x=>x.isIntersecting)){observer.disconnect();void hydrateLike();}
   },{rootMargin:"160px"});
   observer.observe(shell);
  }else if(!snapshot){void hydrateLike();}
  like.addEventListener("click",async()=>{
   if(like.disabled)return;
   like.disabled=true;feedback("");
   try{
    if(!likeReady)await hydrateLike();
    if(!likeReady)throw Error("Likes unavailable");
    const result=liked?
     await likeFilter(client.from("post_likes").delete()).eq("liker_id",userId)
      .select("liker_id").maybeSingle():
     await client.from("post_likes").insert({post_kind:kind,post_id:post.id,liker_id:userId});
    if(result.error||(liked&&String(result.data?.liker_id)!==String(userId)))
     throw result.error||Error("Post like was not removed");
    liked=!liked;likeCount+=liked?1:-1;
    like.classList.toggle("is-liked",liked);like.setAttribute("aria-pressed",String(liked));
    count.textContent=String(Math.max(0,likeCount));
    invalidateEngagement(client);
   }catch(_){feedback(tr("Не вдалося змінити вподобання.","Could not update your like."),true);}
   finally{like.disabled=false;}
  });

  const panel=make("div","vatra-post-comments-panel ui-vatra-post-comments-panel-001");
  panel.hidden=true;
  commentsButton.setAttribute("aria-expanded","false");

  const filterRow=make("div","vatra-post-comments-filter-row ui-vatra-post-comments-filter-row-001");
  const sortLabel=make("label","vt-vatra-post-comments-filter-label-001");
  sortLabel.setAttribute("aria-label",tr("Сортування коментарів","Comment sort"));
  const sort=make("select","ui-vatra-post-comments-sort-001");
  sort.name="vatra_post_comments_sort";
  sort.setAttribute("aria-label",tr("Сортування коментарів","Comment sort"));
  for(const [id,uk,en] of [
   ["relevant","Найактуальніші","Most relevant"],
   ["newest","Найновіші","Newest"],
   ["all","Усі коментарі","All comments"]
  ]){
   const option=make("option","ui-vatra-post-comment-option-"+id,tr(uk,en));
   option.value=id;sort.append(option);
  }
  sortLabel.append(sort);filterRow.append(sortLabel);
  const note=make("small","vt-vatra-post-comments-sort-note-001");
  const updateNote=()=>{
   note.textContent=sort.value==="relevant"?
    tr("Спочатку друзі та найпопулярніші коментарі.","Friends and most-liked comments appear first."):
    sort.value==="newest"?
    tr("Від найновіших, без позначеного спаму.","Newest first, excluding marked spam."):
    tr("Усі доступні коментарі, зокрема можливий спам.",
       "All accessible comments, including possible spam.");
  };
  updateNote();panel.append(filterRow,note);
  const entries=make("div","vatra-post-comment-list ui-vatra-post-comment-list-001");
  entries.setAttribute("role","feed");entries.setAttribute("aria-busy","false");
  const more=make("button","vt-vatra-post-comments-more-001",
   tr("Завантажити ще коментарі","Load more comments"));
  more.type="button";more.hidden=true;
  const form=make("form","vatra-post-comment-form ui-vatra-post-comment-form-001");
  const input=make("textarea","ui-vatra-post-comment-input-001");
  input.name="vatra_post_comment";input.maxLength=1000;input.rows=1;
  input.placeholder=tr("Коментувати…","Write a comment…");
  input.setAttribute("aria-label",tr("Ваш коментар","Your comment"));
  const ownPortrait=make("span","vatra-post-comment-composer-avatar ui-vatra-post-comment-composer-avatar-001");
  ownPortrait.setAttribute("aria-hidden","true");
  window.VATRA_AVATAR?.fallback(ownPortrait);
  const headerPortrait=document.querySelector("#feed-header-avatar");
  if(headerPortrait?.classList.contains("has-photo")){
   ownPortrait.style.backgroundImage=headerPortrait.style.backgroundImage;
   ownPortrait.classList.add("has-photo");
  }
  const composer=make("div","vatra-post-comment-composer ui-vatra-post-comment-composer-001");
  const replying=make("div","vatra-post-comment-replying ui-vatra-post-comment-replying-001");
  replying.hidden=true;
  const replyingText=make("span","vt-vatra-post-comment-replying-text-001");
  const cancelReply=make("button","vt-vatra-post-comment-cancel-reply-001");
  cancelReply.type="button";cancelReply.setAttribute("aria-label",tr("Скасувати відповідь","Cancel reply"));
  cancelReply.append(glyph("x"));replying.append(replyingText,cancelReply);
  const composerInput=make("div","vatra-post-comment-input-wrap ui-vatra-post-comment-input-wrap-001");
  const controls=make("div","vatra-post-comment-toolbar ui-vatra-post-comment-toolbar-001");
  const tool=(type,cls,label)=>{
   const button=make("button",cls);button.type="button";button.append(glyph(type));
   button.setAttribute("aria-label",label);button.title=label;return button;
  };
  const attach=tool("paperclip","vt-vatra-post-comment-attach-001",tr("Додати вкладення","Attach media"));
  const emoji=tool("smile","vt-vatra-post-comment-emoji-001",tr("Емодзі та стікери","Emoji and stickers"));
  const send=tool("arrow","vt-vatra-post-comment-send-001",tr("Опублікувати коментар","Post comment"));
  send.type="submit";
  controls.append(attach,emoji,send);
  composerInput.append(input,controls);
  const popovers=make("div","vatra-post-comment-popovers ui-vatra-post-comment-popovers-001");
  const attachmentMenu=make("div","vatra-post-comment-attach-menu ui-vatra-post-comment-attach-menu-001");
  attachmentMenu.hidden=true;attachmentMenu.setAttribute("role","menu");
  const fileInput=make("input","ui-vatra-post-comment-file-001");
  fileInput.type="file";fileInput.accept="image/jpeg,image/png,image/webp,video/mp4,video/webm";
  fileInput.hidden=true;fileInput.setAttribute("aria-label",tr("Додати файл до коментаря","Choose comment media"));
  const menuOption=(type,uk,en,accept)=>{
   const item=make("button","vt-vatra-post-comment-menu-"+type,tr(uk,en));
   item.type="button";item.setAttribute("role","menuitem");
   item.prepend(glyph(type==="photo"?"camera":type==="video"?"video":"paperclip"));
   item.addEventListener("click",()=>{
    fileInput.accept=accept;hideMenus();
    fileInput.click();
   });return item;
  };
  attachmentMenu.append(
   menuOption("device","З пристрою","From device","image/jpeg,image/png,image/webp,video/mp4,video/webm"),
   menuOption("photo","Фотографія","Photo","image/jpeg,image/png,image/webp"),
   menuOption("video","Відео","Video","video/mp4,video/webm")
  );
  const emojiPanel=make("div","vatra-post-comment-emoji-panel ui-vatra-post-comment-emoji-panel-001");
  emojiPanel.hidden=true;
  const emojiTabs=make("div","vatra-post-comment-emoji-tabs ui-vatra-post-comment-emoji-tabs-001");
  const emojisTab=make("button","vt-vatra-post-comment-emoji-tab-001",tr("Емодзі","Emoji"));
  const stickerTab=make("button","vt-vatra-post-comment-sticker-tab-001",tr("Стікери","Stickers"));
  emojisTab.type="button";stickerTab.type="button";
  emojiTabs.append(emojisTab,stickerTab);
  const emojiContent=make("div","vatra-post-comment-emoji-scroll ui-vatra-post-comment-emoji-scroll-001");
  emojiPanel.append(emojiTabs,emojiContent);
  popovers.append(attachmentMenu,emojiPanel);
  const attachmentPreview=make("div","vatra-post-comment-file-preview ui-vatra-post-comment-file-preview-001");
  attachmentPreview.hidden=true;
  const fileLabel=make("span","vt-vatra-post-comment-file-name-001");
  const removeFile=tool("x","vt-vatra-post-comment-file-remove-001",tr("Прибрати вкладення","Remove attachment"));
  attachmentPreview.append(fileLabel,removeFile);
  composer.append(replying,composerInput,popovers,fileInput,attachmentPreview);
  form.append(ownPortrait,composer);
  panel.append(entries,more,form);shell.append(panel,status);
  const pageSize=window.matchMedia?.("(max-width: 640px)")?.matches?4:6;
  const replySize=3;
  let commentOffset=0,busy=false,ticket=0,pendingReset=false,replyTarget=null,chosenFile=null,emojiMode="emoji";
  const rootReplies=new Map();
  const stopReply=()=>{
   replyTarget=null;replying.hidden=true;replyingText.textContent="";
  };
  cancelReply.addEventListener("click",()=>{stopReply();input.focus();});
  const updateSend=()=>{send.disabled=!input.value.trim()&&!chosenFile;};
  let activeMenu=null,menuCloseTimer=0;
  const clearMenuClose=()=>{
   if(menuCloseTimer){clearTimeout(menuCloseTimer);menuCloseTimer=0;}
  };
  const hideMenus=()=>{
   clearMenuClose();activeMenu=null;
   attachmentMenu.hidden=true;emojiPanel.hidden=true;
   attach.setAttribute("aria-expanded","false");
   emoji.setAttribute("aria-expanded","false");
  };
  const positionPopover=element=>{
   const anchor=(element===attachmentMenu?attach:emoji).getBoundingClientRect();
   const bounds=form.closest("dialog")?.getBoundingClientRect();
   const view=window.visualViewport;
   const vx=view?.offsetLeft||0,vy=view?.offsetTop||0;
   const vw=view?.width||innerWidth,vh=view?.height||innerHeight;
   const left=Math.max(vx+8,(bounds?.left??vx)+8);
   const right=Math.min(vx+vw-8,(bounds?.right??vx+vw)-8);
   const top=vy+8,bottom=vy+vh-8,gap=6;
   if(anchor.bottom<=top||anchor.top>=bottom||(bounds&&(anchor.bottom<=bounds.top||anchor.top>=bounds.bottom))){hideMenus();return;}
   const desiredWidth=element===attachmentMenu?218:350;
   const width=Math.max(0,Math.min(desiredWidth,right-left));
   const desiredHeight=element===attachmentMenu?160:310;
   const above=Math.max(0,anchor.top-top-gap),below=Math.max(0,bottom-anchor.bottom-gap);
   const upward=above>=desiredHeight||above>=below;
   const available=Math.max(0,upward?above:below);
   if(width<100||available<44){hideMenus();return;}
   element.style.setProperty("--beta-pop-width",width+"px");
   element.style.setProperty("--beta-pop-height",Math.min(desiredHeight,available)+"px");
   const x=Math.max(left,Math.min(anchor.right-width,right-width));
   const height=element.getBoundingClientRect().height;
   const y=upward?Math.max(top,anchor.top-gap-height):anchor.bottom+gap;
   element.style.setProperty("--beta-pop-left",Math.round(x)+"px");
   element.style.setProperty("--beta-pop-top",Math.round(y)+"px");
  };
  const openMenu=(element,trigger)=>{
   hideMenus();
   activeMenu=element;element.hidden=false;trigger.setAttribute("aria-expanded","true");
   positionPopover(element);
  };
  const hoverPointer=event=>event.pointerType==="mouse"||(event.pointerType==="pen"&&window.matchMedia("(any-hover:hover)").matches);
  const bindMenu=(element,trigger)=>{
   let pointerType="";
   trigger.setAttribute("aria-expanded","false");
   const scheduleClose=event=>{
    if(!hoverPointer(event)||activeMenu!==element)return;
    clearMenuClose();
    menuCloseTimer=setTimeout(()=>{
     menuCloseTimer=0;
     if(activeMenu===element&&!trigger.matches(":hover")&&!element.matches(":hover"))hideMenus();
    },180);
   };
   trigger.addEventListener("pointerenter",event=>{
    if(!hoverPointer(event))return;
    if(activeMenu!==element)openMenu(element,trigger);
    else clearMenuClose();
   });
   trigger.addEventListener("pointerleave",scheduleClose);
   element.addEventListener("pointerenter",event=>{if(hoverPointer(event)&&activeMenu===element)clearMenuClose();});
   element.addEventListener("pointerleave",scheduleClose);
   trigger.addEventListener("pointerdown",event=>{pointerType=event.pointerType;});
   trigger.addEventListener("click",event=>{
    const mouseClick=event.detail!==0&&(pointerType==="mouse"||(pointerType==="pen"&&window.matchMedia("(any-hover:hover)").matches));
    pointerType="";
    if(mouseClick){if(activeMenu!==element)openMenu(element,trigger);return;}
    if(activeMenu===element)hideMenus();else openMenu(element,trigger);
   });
  };
  bindMenu(attachmentMenu,attach);
  bindMenu(emojiPanel,emoji);
  const emojiGroups=[
   [tr("Емоції","Emotions"),
    ["😀","😃","😄","😁","😆","😅","😂","🤣","😊","🙂","😉","😍","🥰","😘","😎","🤩","🥳","😢","😭","😡","😱","🤔","😴","😇","🙃","🫶","❤️","💙","💛","🔥","✨","🎉"]],
   [tr("Жести й люди","Gestures and people"),
    ["👍","👎","👌","✌️","🤞","🤟","🤘","👏","🙌","🙏","🤝","👋","💪","👀","💯","💐","🎂","💌"]]
  ];
  const stickers=["🔥","🥳","😍","🤣","🤯","😎","🤝","🥹","😼","🐱","🐶","🦊","🐻","🐼","🦄","💖","🎉","🎁","🌈","🌻"];
  const addEmoji=value=>{
   const start=input.selectionStart,end=input.selectionEnd;
   input.setRangeText(value,start,end,"end");input.dispatchEvent(new Event("input",{bubbles:true}));
   input.focus();
  };
  const renderEmoji=()=>{
   emojiContent.replaceChildren();
   for(const [title,values] of emojiMode==="sticker"?[[tr("Великі емодзі","Large emoji"),stickers]]:emojiGroups){
    emojiContent.append(make("h4","vt-vatra-post-comment-emoji-heading-001",title));
    const grid=make("div","vatra-post-comment-emoji-grid ui-vatra-post-comment-emoji-grid-001");
    for(const value of values){
     const button=make("button","vt-vatra-post-comment-emoji-option-001",value);
     button.type="button";button.setAttribute("aria-label",value);
     if(emojiMode==="sticker")button.classList.add("is-sticker");
     button.addEventListener("click",()=>{
      addEmoji(value);hideMenus();
     });
     grid.append(button);
    }
    emojiContent.append(grid);
   }
   emojisTab.setAttribute("aria-selected",String(emojiMode==="emoji"));
   stickerTab.setAttribute("aria-selected",String(emojiMode==="sticker"));
  };
  emojisTab.addEventListener("click",()=>{emojiMode="emoji";renderEmoji();positionPopover(emojiPanel);});
  stickerTab.addEventListener("click",()=>{emojiMode="sticker";renderEmoji();positionPopover(emojiPanel);});
  renderEmoji();
  document.addEventListener("pointerdown",event=>{
   if(!form.isConnected||attach.contains(event.target)||emoji.contains(event.target)||popovers.contains(event.target))return;
   hideMenus();
  });
  form.addEventListener("keydown",event=>{
   if(event.key==="Escape"){if(!attachmentMenu.hidden||!emojiPanel.hidden)event.preventDefault();hideMenus();if(replyTarget)stopReply();}
   if(event.key==="Enter"&&!event.shiftKey&&event.target===input&&!event.isComposing){
    event.preventDefault();if(!send.disabled)form.requestSubmit(send);
   }
  });
  fileInput.addEventListener("change",()=>{
   const file=fileInput.files?.[0];
   if(!file)return;
   const allowed={
    "image/jpeg":["image","jpg",6291456],"image/png":["image","png",6291456],
    "image/webp":["image","webp",6291456],
    "video/mp4":["video","mp4",52428800],"video/webm":["video","webm",52428800]
   };
   const type=allowed[file.type];
   if(!type||file.size>type[2]||file.size<1){
    feedback(tr("Фото: до 6 МБ. Відео: до 50 МБ. Доступні JPEG, PNG, WebP, MP4, WebM.",
     "Photo: up to 6 MB. Video: up to 50 MB. JPEG, PNG, WebP, MP4 or WebM."),true);
    fileInput.value="";chosenFile=null;attachmentPreview.hidden=true;updateSend();return;
   }
   chosenFile={file,kind:type[0],ext:type[1]};
   fileLabel.textContent=file.name.slice(0,110);
   attachmentPreview.hidden=false;feedback("");updateSend();
  });
  removeFile.addEventListener("click",()=>{
   chosenFile=null;fileInput.value="";attachmentPreview.hidden=true;updateSend();
  });
  input.addEventListener("input",updateSend);updateSend();
  const startReply=(rootId,name)=>{
   replyTarget={id:rootId,name};
   replyingText.textContent=tr("Відповідь для ","Replying to ")+name;
   replying.hidden=false;hideMenus();
   input.focus();input.scrollIntoView({block:"nearest",behavior:"smooth"});
  };
  const displayMedia=(item,content)=>{
   if(!item.media_kind||!item.media_path)return;
   const id=String(item.author_vatra_id),kind=item.media_kind,path=item.media_path;
   if(!validId(id)||!["image","video"].includes(kind)||
    !path.startsWith(id+"/comments/"))return;
   const box=make("div","vatra-post-comment-media ui-vatra-post-comment-media-001");
   const media=make(kind==="image"?"img":"video",
    "ui-vatra-post-comment-media-"+kind+"-001");
   if(kind==="image"){
    media.alt=tr("Фото в коментарі","Comment photo");media.loading="lazy";
   }else{media.controls=true;media.preload="metadata";media.playsInline=true;}
   box.append(media);content.append(box);
   const bucket=kind==="image"?"post-images":"videos";
   void (async()=>{
    try{
     const getSigned=window.VATRA_POST_MEDIA?.signed;
     let signedUrl;
     if(typeof getSigned==="function"){
      signedUrl=await getSigned(client,kind,path,300);
     }else{
      const {data,error}=await client.storage.from(bucket).createSignedUrl(path,300);
      if(error)throw error;
      signedUrl=data?.signedUrl;
     }
     if(!signedUrl||!box.isConnected)return;
     const url=new URL(signedUrl,location.origin);
     if(url.protocol!=="https:"||url.hostname!=="cxrcycxrlkufozomsxcs.supabase.co")return;
     media.src=url.href;
    }catch(_){}
   })();
  };
  function renderComment(item,people,ownLikes,rootId,isReply=false,initialReplyCount=0){
   const id=String(item.author_vatra_id);
   const name=people.names.get(id)||tr("Користувач VATRA","VATRA member");
   const card=make("article","vatra-post-comment ui-vatra-post-comment-001");
   card.id="vatra-comment-"+item.id;card.dataset.commentId=item.id;
   if(isReply)card.classList.add("is-reply");
   const avatar=make("a","vatra-comment-avatar ui-vatra-comment-avatar-001");
   avatar.href=new URL("id"+id,relativeRoot()).href;
   avatar.setAttribute("aria-label",name);window.VATRA_AVATAR?.fallback(avatar);
   const photo=people.images.get(id);
   if(photo){avatar.style.backgroundImage="url("+JSON.stringify(photo)+")";
    avatar.classList.add("has-photo");window.VATRA_AVATAR?.clearFallback(avatar);}
   const content=make("div","vatra-post-comment-content ui-vatra-post-comment-content-001");
   const author=make("a","vt-vatra-post-comment-author-001",name);
   author.href=avatar.href;
    void window.VATRA_VERIFIED?.attach(client,author,id);
   const body=make("p","vt-vatra-post-comment-body-001",item.body||"");
   if(item.body){
    const emojiOnly=Array.from(item.body.trim()).length<=8 &&
     /^[\p{Extended_Pictographic}\uFE0F\u200D\p{Emoji_Modifier}\s]+$/u.test(item.body.trim());
    if(emojiOnly)body.classList.add("is-sticker");
   }
   content.append(author);
   if(item.body)content.append(body);
   displayMedia(item,content);
   if(item.moderation_status==="possible_spam")content.append(
    make("small","vt-vatra-post-comment-spam-001",tr("Можливий спам","Potential spam")));
   const actions=make("div","vatra-post-comment-actions ui-vatra-post-comment-actions-001");
   const stamp=make("time","vt-vatra-post-comment-date-001",dateValue(item.created_at));
   stamp.dateTime=item.created_at;
   const answer=make("button","vt-vatra-post-comment-reply-001",tr("Відповісти","Reply"));
   answer.type="button";answer.addEventListener("click",()=>startReply(rootId,name));
   const likeComment=make("button","vt-vatra-post-comment-like-001");
   likeComment.type="button";likeComment.append(glyph("heart"));
   const heartCount=make("span","vt-vatra-post-comment-like-count-001");
   likeComment.append(heartCount);
   let likeCount=Number(item.likes)||0,ownLiked=ownLikes.has(item.id);
   const renderLike=()=>{
    heartCount.textContent=likeCount?String(likeCount):"";
    likeComment.setAttribute("aria-pressed",String(ownLiked));
    likeComment.setAttribute("aria-label",ownLiked?tr("Прибрати вподобання","Unlike"):
     tr("Подобається","Like"));
   };
   renderLike();likeComment.addEventListener("click",async()=>{
    if(likeComment.disabled)return;likeComment.disabled=true;
    try{
     const result=ownLiked?
      await client.from("post_comment_likes").delete()
       .eq("comment_id",item.id).eq("liker_id",userId)
       .select("comment_id").maybeSingle():
      await client.from("post_comment_likes").insert({comment_id:item.id,liker_id:userId});
     if(result.error||(ownLiked&&String(result.data?.comment_id)!==String(item.id)))
      throw result.error||Error("Comment like was not removed");
     ownLiked=!ownLiked;likeCount+=ownLiked?1:-1;renderLike();
     invalidateComments(client);
    }catch(_){feedback(tr("Не вдалося змінити вподобання.","Could not update like."),true);}
    finally{likeComment.disabled=false;}
   });
   actions.append(stamp,answer,likeComment);content.append(actions);
   card.append(avatar,content);
   if(!isReply){
    const replyArea=make("div","vatra-comment-replies ui-vatra-comment-replies-001");
    const expand=make("button","vt-vatra-comment-expand-replies-001");
    expand.type="button";expand.hidden=true;
    const repliesList=make("div","vatra-comment-reply-list ui-vatra-comment-reply-list-001");
    repliesList.hidden=true;
    const moreReplies=make("button","vt-vatra-comment-more-replies-001",
     tr("Показати ще відповіді","Show more replies"));
    moreReplies.type="button";moreReplies.hidden=true;
    replyArea.append(expand,repliesList,moreReplies);content.append(replyArea);
    let replyOffset=0,replyCount=Math.max(0,Number(initialReplyCount)||0),open=false,working=false;
    const label=()=>expand.textContent=open?tr("Згорнути відповіді","Hide replies"):
     (replyCount===1?tr("1 відповідь","1 reply"):
      String(replyCount)+" "+tr("відповідей","replies"));
    const loadReplies=async(reset=false)=>{
     if(working)return;working=true;moreReplies.disabled=true;
     if(reset){replyOffset=0;repliesList.replaceChildren();}
     try{
      const {data,error}=await commentThreadPage(client,{
       p_kind:kind,p_post_id:post.id,p_sort:sort.value,
       p_parent:item.id,p_offset:replyOffset,p_limit:replySize+1
      });
      if(error)throw error;
      const rows=(data||[]).slice(0,replySize);
      const people=await authorMap(client,rows);
      const ids=rows.map(x=>x.id);
      let mine=new Set();
      if(ids.length){
       const result=await client.from("post_comment_likes")
        .select("comment_id").in("comment_id",ids).eq("liker_id",userId);
       if(!result.error)mine=new Set((result.data||[]).map(x=>x.comment_id));
      }
      for(const reply of rows)repliesList.append(renderComment(reply,people,mine,item.id,true));
      replyOffset+=rows.length;moreReplies.hidden=(data||[]).length<=replySize;
      repliesList.hidden=false;
     }catch(_){feedback(tr("Не вдалося завантажити відповіді.","Could not load replies."),true);}
     finally{working=false;moreReplies.disabled=false;}
    };
    const setOpen=async(value,reload=false)=>{
     open=value;label();repliesList.hidden=!open;
     if(open&&(reload||replyOffset===0))await loadReplies(true);
     else if(!open)moreReplies.hidden=true;
     else moreReplies.hidden=replyOffset>=replyCount;
    };
    expand.addEventListener("click",()=>void setOpen(!open));
    moreReplies.addEventListener("click",()=>void loadReplies());
    rootReplies.set(item.id,{expand:async reload=>{
     replyCount=Math.max(replyCount+1,1);expand.hidden=false;await setOpen(true,reload);
    }});
    expand.hidden=replyCount===0;label();
   }
   return card;
  }
  async function loadComments(reset=false){
   if(busy){
    if(reset){pendingReset=true;ticket++;}
    return;
   }
   busy=true;more.disabled=true;entries.setAttribute("aria-busy","true");
   const token=++ticket;
   if(reset){commentOffset=0;entries.replaceChildren();more.hidden=true;rootReplies.clear();}
   try{
    const {data,error}=await commentThreadPage(client,{
     p_kind:kind,p_post_id:post.id,p_sort:sort.value,
     p_parent:null,p_offset:commentOffset,p_limit:pageSize+1
    });
    if(error)throw error;
    if(token!==ticket)return;
    const rows=(data||[]).slice(0,pageSize),ids=rows.map(x=>x.id);
    const [people,replyResult]=await Promise.all([
     authorMap(client,rows),
     ids.length?client.rpc("comment_reply_counts",{
      p_kind:kind,p_post_id:post.id,p_parents:ids
     }):Promise.resolve({data:[],error:null})
    ]);
    const replyCounts=new Map(
     (replyResult?.error?[]:replyResult?.data||[])
      .map(item=>[item.parent_id,Math.max(0,Number(item.reply_count)||0)])
    );
    let mine=new Set();
    if(ids.length){
     const result=await client.from("post_comment_likes")
      .select("comment_id").in("comment_id",ids).eq("liker_id",userId);
     if(!result.error)mine=new Set((result.data||[]).map(x=>x.comment_id));
    }
    if(token!==ticket)return;
    if(reset&&!rows.length)entries.append(make("p","vt-vatra-post-comments-empty-001",
     tr("Коментарів поки немає.","No comments yet.")));
    for(const item of rows)entries.append(renderComment(item,people,mine,item.id,false,replyCounts.get(item.id)||0));
    commentOffset+=rows.length;more.hidden=(data||[]).length<=pageSize;
    const deepComment=new URLSearchParams(location.search).get("comment");
    if(validUUID(deepComment)){
     const target=document.getElementById("vatra-comment-"+deepComment);
     if(target)target.scrollIntoView({block:"center"});
    }
    feedback("");
   }catch(_){
    if(token===ticket)feedback(tr("Не вдалося завантажити коментарі.","Could not load comments."),true);
   }finally{
    busy=false;more.disabled=false;entries.setAttribute("aria-busy","false");
    if(pendingReset){pendingReset=false;void loadComments(true);}
   }
  }
  let commentDialog=null;
  const openComments=()=>{
   if(commentDialog?.open)return;
   const card=container.closest(".feed-post-card")||container;
   if(!card.parentNode)return;
   const marker=make("span","ui-beta-comment-origin-001");marker.hidden=true;
   card.parentNode.insertBefore(marker,card);
   const dialog=make("dialog","vatra-post-comment-dialog ui-vatra-post-comment-dialog-001");
   dialog.setAttribute("aria-label",tr("Публікація та коментарі","Post and comments"));
   const close=make("button","vt-vatra-post-comment-dialog-close-001");
   close.type="button";close.setAttribute("aria-label",tr("Закрити коментарі","Close comments"));
   close.append(glyph("x"));
   const content=make("div","vatra-post-comment-dialog-content ui-vatra-post-comment-dialog-content-001");
   content.append(card);dialog.append(close,content,popovers);document.body.append(dialog);
   const reposition=()=>{
    if(activeMenu)positionPopover(activeMenu);
   };
   const viewport=window.visualViewport;
   content.addEventListener("scroll",reposition,{passive:true});
   window.addEventListener("resize",reposition);
   viewport?.addEventListener("resize",reposition);
   viewport?.addEventListener("scroll",reposition);
   commentDialog=dialog;panel.hidden=false;
   commentsButton.setAttribute("aria-expanded","true");
   const previousFocus=document.activeElement;
   let restored=false;
   const restore=()=>{
    if(restored)return;restored=true;
    hideMenus();
    content.removeEventListener("scroll",reposition);
    window.removeEventListener("resize",reposition);
    viewport?.removeEventListener("resize",reposition);
    viewport?.removeEventListener("scroll",reposition);
    composer.insertBefore(popovers,fileInput);
    panel.hidden=true;commentsButton.setAttribute("aria-expanded","false");
    if(marker.parentNode)marker.parentNode.replaceChild(card,marker);
    else if(card.isConnected)card.remove();
    dialog.remove();commentDialog=null;
    if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
   };
   const dismiss=()=>{if(dialog.open)dialog.close();restore();};
   dialog.addEventListener("close",restore,{once:true});
   dialog.addEventListener("cancel",event=>{
    if(!attachmentMenu.hidden||!emojiPanel.hidden){event.preventDefault();hideMenus();}
   });
   close.addEventListener("click",dismiss);
   dialog.addEventListener("click",event=>{if(event.target===dialog)dismiss();});
   dialog.showModal();close.focus({preventScroll:true});
   void loadComments(true);
  };
  commentsButton.addEventListener("click",openComments);
  if(new URLSearchParams(location.search).get("comment")&&
   new URLSearchParams(location.search).get("post")===post.id)
   queueMicrotask(openComments);
  sort.addEventListener("change",()=>{updateNote();void loadComments(true);});
  more.addEventListener("click",()=>void loadComments(false));
  form.addEventListener("submit",async event=>{
   event.preventDefault();
   hideMenus();
   const body=input.value.trim(),file=chosenFile;
   if((!body&&!file)||body.length>1000||send.disabled||!validId(ownId))return;
   send.disabled=true;let uploaded=null,committed=false;
   try{
    const payload={post_kind:kind,post_id:post.id,
     author_id:userId,author_vatra_id:ownId,body};
    const target=replyTarget;
    if(target)payload.parent_comment_id=target.id;
    if(file){
     const bucket=file.kind==="image"?"post-images":"videos";
     const filename=crypto.randomUUID()+"."+file.ext;
     const path=ownId+"/comments/"+filename;
     const {error}=await client.storage.from(bucket).upload(path,file.file,{
      contentType:file.file.type,cacheControl:"3600",upsert:false
     });
     if(error)throw error;
     uploaded={bucket,path};
     payload.media_kind=file.kind;payload.media_path=path;
    }
    const result=await client.from("post_comments").insert(payload);
    if(result.error)throw result.error;
    committed=true;
    invalidateEngagement(client);invalidateComments(client);
    input.value="";chosenFile=null;fileInput.value="";
    attachmentPreview.hidden=true;stopReply();updateSend();
    if(target&&rootReplies.has(target.id))await rootReplies.get(target.id).expand(true);
    else await loadComments(true);
    void refreshSocial();feedback(tr("Коментар опубліковано.","Comment published."));
   }catch(_){
    if(!committed){
     if(uploaded)try{await client.storage.from(uploaded.bucket).remove([uploaded.path]);}catch(_){}
     feedback(tr("Не вдалося опублікувати коментар. Спробуйте ще раз.",
      "Could not post comment. Please retry."),true);
    }else{
     feedback(tr("Коментар опубліковано.","Comment published."));
    }
   }finally{updateSend();}
  });

  let socialTicket=0;
  async function refreshSocial(){
   const ticket=++socialTicket;
   try{
   const commentsResult=await client.from("post_comments").select("id",{count:"exact",head:true})
     .eq("post_kind",kind).eq("post_id",post.id);
    if(!shell.isConnected||ticket!==socialTicket)return;
    if(!commentsResult.error)commentsCount.textContent=String(Number(commentsResult.count||0));
   }catch(_){}
  }
  if(snapshot){
   commentsCount.textContent=String(Math.max(0,Number(snapshot.comment_count)||0));
  }
  if(!snapshot&&typeof IntersectionObserver!=="undefined"){
   const summaryObserver=new IntersectionObserver(entries=>{
    if(entries.some(x=>x.isIntersecting)){
     summaryObserver.disconnect();void refreshSocial();
    }
   },{rootMargin:"220px"});
   summaryObserver.observe(shell);
  }else if(!snapshot){void refreshSocial();}
  container.append(shell);
 }
 async function renderSharedPreview(client,post,container){
  const kind=post?.shared_post_kind,id=post?.shared_post_id;
  if(!["person","group"].includes(kind)||!validUUID(id)||!container)return;
  const preview=make("aside","vatra-post-share-preview ui-vatra-post-share-preview-001");
  preview.append(make("strong","vt-vatra-post-share-preview-heading-001",
   tr("Оригінальна публікація","Original post")));
  container.append(preview);
  try{
   const table=kind==="person"?"feed_posts":"community_posts";
   const {data,error}=await client.from(table)
    .select(kind==="group"?
     "id,club_id,author_vatra_id,body,media_kind,media_path,media_items,created_at":
     "id,author_vatra_id,body,media_kind,media_path,media_items,created_at")
    .eq("id",id).maybeSingle();
   if(error||!data)throw Error("Original post unavailable");
   if(!preview.isConnected)return;
   const member=await client.from("public_profiles").select("display_name")
    .eq("vatra_id",data.author_vatra_id).maybeSingle();
   const name=!member.error&&member.data?.display_name?
    member.data.display_name:tr("Користувач VATRA","VATRA member");
   const link=make("a","vt-vatra-post-original-link-001",name);
   link.href=new URL("id"+data.author_vatra_id,relativeRoot()).href;
   preview.append(link);
    void window.VATRA_VERIFIED?.attach(client,link,data.author_vatra_id);
   if(kind==="group"&&data.club_id){
    const group=await client.from("communities").select("name").eq("club_id",data.club_id).maybeSingle();
    const groupLink=make("a","vt-vatra-post-original-community-001",
     group.data?.name||tr("Спільнота VATRA","VATRA community"));
    groupLink.href=new URL("club"+data.club_id,relativeRoot()).href;
    preview.append(groupLink);
   }
   if(data.body){
    const body=make("p","vt-vatra-post-share-preview-body-001",data.body);
    window.VATRA_POST_MEDIA?.linkifyHashtags(body);preview.append(body);
   }
   if(data.media_items?.length||(data.media_kind&&data.media_path))void window.VATRA_POST_MEDIA?.mount(client,data,preview);
  }catch(_){
   if(preview.isConnected)preview.append(make("p","vt-vatra-post-original-unavailable-001",
    tr("Ця публікація недоступна.","This post is unavailable.")));
  }
 }
 window.VATRA_POST_INTERACTIONS={mount,renderSharedPreview,authorMap,prefetchEngagement,appendAudience,addOwnerMenu};
})();
