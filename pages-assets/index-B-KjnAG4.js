(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-bird"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M16 7h.01" />
  <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" />
  <path d="m20 7 2 .5-2 .5" />
  <path d="M10 18v3" />
  <path d="M14 17.75V21" />
  <path d="M7 18a6 6 0 0 0 3.84-10.61" />
</svg>
`,t=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-sun"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="12" cy="12" r="4" />
  <path d="M12 2v2" />
  <path d="M12 20v2" />
  <path d="m4.93 4.93 1.41 1.41" />
  <path d="m17.66 17.66 1.41 1.41" />
  <path d="M2 12h2" />
  <path d="M20 12h2" />
  <path d="m6.34 17.66-1.41 1.41" />
  <path d="m19.07 4.93-1.41 1.41" />
</svg>
`,n=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-moon"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
</svg>
`,r=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-cloud"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
</svg>
`,i=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-cloud-rain"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
  <path d="M16 14v6" />
  <path d="M8 14v6" />
  <path d="M12 16v6" />
</svg>
`,a=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-cloud-fog"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
  <path d="M16 17H7" />
  <path d="M17 21H9" />
</svg>
`,o=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-sunset"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 10V2" />
  <path d="m4.93 10.93 1.41 1.41" />
  <path d="M2 18h2" />
  <path d="M20 18h2" />
  <path d="m19.07 10.93-1.41 1.41" />
  <path d="M22 22H2" />
  <path d="m16 6-4 4-4-4" />
  <path d="M16 18a4 4 0 0 0-8 0" />
</svg>
`,s=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-route"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="6" cy="19" r="3" />
  <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
  <circle cx="18" cy="5" r="3" />
</svg>
`,c=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-flag"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528" />
</svg>
`,l=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-clock-3"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="12" cy="12" r="10" />
  <path d="M12 6v6h4" />
</svg>
`,u=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-pause"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect x="14" y="3" width="5" height="18" rx="1" />
  <rect x="5" y="3" width="5" height="18" rx="1" />
</svg>
`,d=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-play"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
</svg>
`,f=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-rotate-ccw"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
  <path d="M3 3v5h5" />
</svg>
`,p=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-chevron-left"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m15 18-6-6 6-6" />
</svg>
`,m=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-chevron-right"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m9 18 6-6-6-6" />
</svg>
`,ee=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-octagon"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z" />
</svg>
`,te=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-arrow-up"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m5 12 7-7 7 7" />
  <path d="M12 19V5" />
</svg>
`,ne=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-keyboard"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M10 8h.01" />
  <path d="M12 12h.01" />
  <path d="M14 8h.01" />
  <path d="M16 12h.01" />
  <path d="M18 8h.01" />
  <path d="M6 8h.01" />
  <path d="M7 16h10" />
  <path d="M8 12h.01" />
  <rect width="20" height="16" x="2" y="4" rx="2" />
</svg>
`,re=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-users"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
  <path d="M16 3.128a4 4 0 0 1 0 7.744" />
  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
  <circle cx="9" cy="7" r="4" />
</svg>
`,ie=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-shuffle"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m18 14 4 4-4 4" />
  <path d="m18 2 4 4-4 4" />
  <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" />
  <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" />
  <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" />
</svg>
`,ae=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-check"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M20 6 9 17l-5-5" />
</svg>
`,oe=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-copy"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
</svg>
`,se=`<!-- @license lucide-static v0.577.0 - ISC -->
<svg
  class="lucide lucide-house"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
  <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
</svg>
`,ce=new Set([`left`,`right`,`throttle`,`brake`]),le=new Map([[`KeyA`,`left`],[`KeyD`,`right`],[`KeyW`,`throttle`],[`KeyS`,`brake`],[`ArrowLeft`,`left`],[`ArrowRight`,`right`],[`ArrowUp`,`throttle`],[`ArrowDown`,`brake`]]),ue=new Map([[`a`,`left`],[`d`,`right`],[`w`,`throttle`],[`s`,`brake`]]);function de(e){return e.composedPath().some(e=>e.isContentEditable||e.matches?.(`input, select, textarea, [role="textbox"], [role="slider"], [role="spinbutton"]`))}function fe(e){let t=e.ownerDocument,n=t.defaultView,r=new AbortController,{signal:i}=r,a=new Map,o=new Map,s=new Set,c=new Map;for(let t of e.querySelectorAll(`button[data-drive]`)){let e=t.dataset.drive;ce.has(e)&&(c.set(t,{action:e,touchAction:t.style.touchAction}),t.style.touchAction=`none`)}function l(){s.clear();for(let e of a.values())s.add(e);for(let{action:e}of o.values())s.add(e);for(let[e,{action:t}]of c)s.has(t)?e.dataset.active=`true`:delete e.dataset.active}function u(){a.clear();let e=[...o];o.clear();for(let[t,{button:n}]of e)n.hasPointerCapture?.(t)&&n.releasePointerCapture(t);l()}function d(e){if(e.defaultPrevented||e.isComposing||e.altKey||e.ctrlKey||e.metaKey||de(e)||![...c.keys()].some(e=>!e.disabled))return;let t=e.key.toLowerCase(),n=le.get(e.code)??le.get(e.key)??ue.get(t);if(!n)return;e.preventDefault();let r=e.code||t;a.has(r)||(a.set(r,n),l())}function f(e){a.delete(e.code||e.key.toLowerCase())&&l()}function p(e){if(e.defaultPrevented||e.button!==0)return;let t=e.target.closest?.(`button[data-drive]`),n=c.get(t);if(n&&!t.disabled){e.preventDefault(),o.set(e.pointerId,{button:t,action:n.action});try{t.setPointerCapture?.(e.pointerId)}catch{}l()}}function m(e){o.delete(e.pointerId)&&l()}return e.addEventListener(`pointerdown`,p,{signal:i}),e.addEventListener(`lostpointercapture`,m,{signal:i}),e.addEventListener(`contextmenu`,e=>{c.has(e.target.closest?.(`button[data-drive]`))&&e.preventDefault()},{signal:i}),n.addEventListener(`pointerup`,m,{signal:i,capture:!0}),n.addEventListener(`pointercancel`,m,{signal:i,capture:!0}),n.addEventListener(`keydown`,d,{signal:i}),n.addEventListener(`keyup`,f,{signal:i}),n.addEventListener(`blur`,u,{signal:i}),t.addEventListener(`visibilitychange`,()=>{t.hidden&&u()},{signal:i}),{read(){return{steer:Number(s.has(`right`))-Number(s.has(`left`)),throttle:Number(s.has(`throttle`)),brake:Number(s.has(`brake`))}},clear:u,dispose(){r.abort(),u();for(let[e,{touchAction:t}]of c)e.style.touchAction=t}}}var pe=`coast`,h=Object.freeze([Object.freeze({id:`coast`,name:`海风环线`,label:`PELICAN LOOP`,description:`沿着浅滩、棕榈和灯塔骑行。`}),Object.freeze({id:`harbor`,name:`月牙港`,label:`CRESCENT HARBOR`,description:`绕过港湾的粉色沙滩和陶瓦渔村。`}),Object.freeze({id:`basalt`,name:`黑岩岬`,label:`BASALT CAPE`,description:`从黑沙海岸驶向迎风的玄武岩群。`})]);function me(e){return h.find(({id:t})=>t===e)??h[0]}var he=`modulepreload`,ge=function(e,t){return new URL(e,t).href},_e={},ve=function(e){return e.pathname.endsWith(`.css`)},ye=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},g=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=ge(t,n);let r=s(t),i=ve(r);return ye(_e,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:he,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{let i=a=>{t.removeEventListener(`load`,i),t.removeEventListener(`error`,i),a.type===`error`?n(Error(`Unable to preload CSS for ${r}`)):e(a)};t.addEventListener(`load`,i),t.addEventListener(`error`,i)})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},be={bird:e,sun:t,route:s,flag:c,pause:u,play:d,octagon:ee,keyboard:ne,users:re,shuffle:ie,check:ae,copy:oe,house:se,"clock-3":l,"rotate-ccw":f,"chevron-left":p,"chevron-right":m,"arrow-up":te};for(let e of document.querySelectorAll(`[data-icon]`))e.innerHTML=be[e.dataset.icon];var _=e=>document.getElementById(e),xe=_(`stage`),v=_(`viewport`),y=_(`start`),Se=_(`pause`),Ce=_(`recover`),we=document.querySelector(`.shell`),Te=_(`room-form`),Ee=_(`room-lobby`),De=_(`room-status`),b=_(`connection`),x=_(`host`),S=_(`join`),C=_(`lobby-map`),w=[...document.querySelectorAll(`[data-map-id]`)],Oe={clear:`晴天`,cloudy:`多云`,rain:`雨天`,mist:`薄雾`},T={day:`白天`,dusk:`黄昏`,night:`夜晚`},ke={cloudy:r,rain:i,mist:a},Ae={day:t,dusk:o,night:n},je=document.querySelector(`.hero-image`),Me=v.querySelector(`.fallback-image`),Ne=_(`brief`),E=_(`brief-title`),Pe=_(`brief-copy`),D=_(`start-label`),Fe=_(`speed`),Ie=_(`laps`),Le=_(`lap-time`),Re=_(`best-time`),ze=_(`lap-progress`),Be=_(`offroad`),Ve=_(`traffic-warning`),O=_(`toast`),k=_(`minimap`),He=[...document.querySelectorAll(`[data-drive]`)],A=fe(document.querySelector(`.ride-panel`)),j={signal:new AbortController().signal},M=`loading`,N=pe,P=`home`,F,I,L=!1,R=0,Ue,z=0,B=new Map,V,H,U=0,W=0,G,K=!0;function q(e,t){e.textContent!==t&&(e.textContent=t)}function J(e,t=!1){let n=Math.floor(e/60),r=e-n*60,i=String(Math.floor(r)).padStart(2,`0`),a=Math.floor(r%1*10);return`${n}:${i}${t?`.`+a:``}`}function Y(e){clearTimeout(G),O.textContent=e,O.hidden=!1,G=setTimeout(()=>{O.hidden=!0},2600)}function X(e,t=!1){M=e,xe.dataset.mode=M,V?.setMode(M),M!==`playing`&&A.clear();let n=M===`playing`&&K;Ne.hidden=n,Se.disabled=!n,Ce.disabled=!n;for(let e of He)e.disabled=!n;let r=M===`ready`;y.disabled=!K||!(r||M===`paused`),r?(E.textContent=`准备出发`,D.textContent=`开始骑行`):M===`paused`&&(E.textContent=`骑行暂停`,D.textContent=`继续骑行`),t&&(n?v.focus({preventScroll:!0}):!y.disabled&&window.matchMedia(`(pointer: fine)`).matches&&y.focus({preventScroll:!0}))}function We(e){let t=k.getContext(`2d`);if(!t)return null;let n=e.map(({x:e})=>e),r=e.map(({z:e})=>e),i=Math.min(...n),a=Math.min(...r),o=Math.max(...n)-i,s=Math.max(...r)-a,c=Math.min((k.width-24)/o,(k.height-16)/s),l=(k.width-o*c)/2,u=(k.height-s*c)/2,d=e=>l+(e-i)*c,f=e=>u+(e-a)*c,p=new Path2D,m=e[0];p.moveTo(d(m.x),f(m.z));for(let t of e.slice(1))p.lineTo(d(t.x),f(t.z));return p.closePath(),({position:e,heading:n},r)=>{t.clearRect(0,0,k.width,k.height),t.fillStyle=`#c3eee721`,t.fill(p),t.lineWidth=6,t.strokeStyle=`#b8d6c969`,t.stroke(p),t.lineWidth=1,t.strokeStyle=`#e6efd9a6`,t.setLineDash([3,4]),t.stroke(p),t.setLineDash([]),t.fillStyle=`#f1f1da`,t.fillRect(d(m.x)-2,f(m.z)-4,4,8),t.fillStyle=`#ffba9b`;for(let e of r)t.beginPath(),t.arc(d(e.position.x),f(e.position.z),2.2,0,2*Math.PI),t.fill();t.fillStyle=`#8ad7ff`;for(let e of B.values())t.beginPath(),t.arc(d(e.x),f(e.z),3,0,2*Math.PI),t.fill();t.save(),t.translate(d(e.x),f(e.z)),t.rotate(n),t.beginPath(),t.moveTo(8,0),t.lineTo(-5,-4),t.lineTo(-3,0),t.lineTo(-5,4),t.closePath(),t.fillStyle=`#dbfa78`,t.strokeStyle=`#263f2d`,t.lineWidth=2,t.stroke(),t.fill(),t.restore()}}function Ge(e,t){q(Fe,String(Math.round(e.speed*3.6))),q(Ie,`${e.laps} 圈`),q(Le,J(e.lapTime)),q(Re,e.bestLap===null?`—`:J(e.bestLap,!0)),q(ze,`${Math.floor(e.progress*100)}%`),Ve.hidden=!e.yielding,Be.hidden=!e.offroad||e.yielding,H?.(e,t),e.laps>U&&Y(`完成第 ${e.laps} 圈 · ${J(e.lastLap,!0)}`),e.respawns>W&&Y(`已回到公路`),U=e.laps,W=e.respawns}function Z(e){P=e,we.dataset.screen=e;for(let t of[`home`,`online`,`ride`])_(t).hidden=t!==e;_(`home-label`).hidden=e===`ride`,_(`conditions`).hidden=e!==`ride`,_(`ride-footer`).hidden=e!==`ride`,window.scrollTo(0,0)}function Q(){R+=1,clearTimeout(Ue),clearTimeout(G),A.clear(),V?.dispose(),V=null,H=null,v.removeAttribute(`data-ready`),B.clear(),L=!1,U=0,W=0,K=!0,O.hidden=!0,Ve.hidden=!0,Be.hidden=!0,k.getContext(`2d`)?.clearRect(0,0,k.width,k.height),q(Fe,`0`),q(Ie,`0 圈`),q(Le,`0:00`),q(Re,`—`),q(ze,`0%`),_(`route-length`).textContent=``}function Ke(e){let t=Object.keys(Oe),n=Object.keys(T),r=crypto.getRandomValues(new Uint32Array(3));return{mapId:e,weather:t[r[0]%t.length],timeOfDay:n[Math.floor(r[1]/4294967296*n.length)],seed:r[2]}}async function qe(e,t=!1){Q();let n=R;L=t,document.documentElement.dataset.weather=e.weather,document.documentElement.dataset.time=e.timeOfDay;let r=me(e.mapId);_(`ride-name`).textContent=r.name,_(`ride-edition`).textContent=r.label;let i=`${Oe[e.weather]} · ${T[e.timeOfDay]}`;_(`conditions-label`).textContent=i,_(`conditions-inline`).textContent=i,_(`conditions-icon`).innerHTML=ke[e.weather]??Ae[e.timeOfDay],Me.src=w.find(e=>e.dataset.mapId===r.id).querySelector(`img`).src,_(`route-context`).textContent=t?`联机 · ${I.players.length} 人`:`环岛公路`,y.hidden=!1,E.textContent=`准备出发`,Pe.innerHTML=`<span class="desktop-copy">用方向键或 WASD 控车，留意来往车辆。</span><span class="touch-copy">按住踩踏加速，同时按左转或右转。</span>`,D.textContent=`正在加载`,X(`loading`),Z(`ride`);try{let{createRideScene:i}=await g(async()=>{let{createRideScene:e}=await import(`./ride-scene-D0x8lNWC.js`);return{createRideScene:e}},[],import.meta.url);if(n!==R)return;let a=t?I.players.find(({id:e})=>e===I.selfId)?.slot??0:0;if(V=i(v,{mapId:r.id,weather:e.weather,timeOfDay:e.timeOfDay,slot:a,getInput:A.read,onState:Ge,onSnapshot:t?e=>F?.sendSnapshot(e):null,onContextStatus(e){K=e,X(!e&&M===`playing`?`paused`:M),e?(M===`ready`||M===`paused`)&&(D.textContent=M===`ready`?`开始骑行`:`继续骑行`):D.textContent=`正在恢复 3D 场景`}}),H=We(V.route),_(`route-length`).textContent=`${Math.round(V.length)} m`,X(`ready`),t){V.setPlayers(I.players,I.selfId);let t=Math.max(0,Math.min(4500,e.startsAt-Date.now()));t>0?(y.disabled=!0,D.textContent=`等待房间同步`,Ue=setTimeout(()=>X(`playing`),t)):X(`playing`)}}catch(e){if(console.error(e),n!==R)return;X(`unavailable`),E.textContent=`3D 场景无法启动`,Pe.textContent=`请使用支持 WebGL 2 的浏览器。`,y.hidden=!0}}function $(e,t=!1){De.textContent=e,De.dataset.error=String(t)}var Je={direct:`WebRTC 直连`,turn:`WebRTC + TURN`,relay:`WebSocket 中继`},Ye={direct:`使用公共信令服务，适合网络能直接互通时使用。`,turn:`网络直连受阻时可用 TURN。各玩家可以填写自己的凭据。`,relay:`所有玩家通过同一个中继地址连接。适用于已部署的房间服务器。`};function Xe(){let e=b.value;_(`turn-fields`).hidden=e!==`turn`,_(`relay-fields`).hidden=e!==`relay`,_(`connection-hint`).textContent=Ye[e]}b.addEventListener(`change`,Xe,j);function Ze(){let e=_(`rider-name`).value.trim();if(b.value===`turn`){let t=_(`turn-url`).value.trim().split(/[\s,]+/).filter(Boolean),n=_(`turn-user`).value.trim(),r=_(`turn-secret`).value;return!t.length||t.some(e=>!/^turns?:[^\s]+$/i.test(e))||!n||!r?($(`请输入有效的 TURN 地址、用户名和凭据。`,!0),null):{name:e,iceServers:[{urls:t,username:n,credential:r}]}}if(b.value===`relay`){let t=_(`relay-url`).value.trim();return t?{name:e,relayUrl:t}:($(`请填写中继服务器地址。`,!0),null)}return{name:e}}function Qe(e){I=e;let t=e.status===`connected`,n=e.status===`connecting`;if(x.disabled=n,S.disabled=n,Te.hidden=t,Ee.hidden=!t,e.error?$(e.error,!0):$(n?`正在连接房间…`:t?e.role===`host`?`将房间码发给好友，等好友加入后开始。`:`等待房主开始骑行。`:``),t){_(`lobby-code`).textContent=e.code,_(`lobby-transport`).textContent=Je[e.transport===`relay`?`relay`:b.value]+` · ${e.players.length}/4 人`;let t=e.role===`host`;_(`host-course`).hidden=!t,_(`start-round`).hidden=!t,_(`start-round`).disabled=!t||e.players.length<2,_(`lobby-players`).replaceChildren(...e.players.map(t=>{let n=document.createElement(`li`),r=document.createElement(`small`);return r.textContent=t.id===e.hostId?`房主`:`已连接`,n.append(document.createTextNode(t.name),r),n}))}if(L&&P===`ride`){let n=new Set((e.players??[]).map(({id:e})=>e));for(let e of B.keys())n.has(e)||B.delete(e);V?.setPlayers(e.players??[],e.selfId),_(`route-context`).textContent=t?`联机 · ${e.players.length} 人`:`联机已断开`,!t&&e.error&&Y(e.error)}}async function $e(e){let t=Ze(),n=_(`room-code`).value;if(!t)return;let r=++z;try{if(!F){x.disabled=!0,S.disabled=!0,$(`正在准备联机…`);let{createMultiplayer:e}=await g(async()=>{let{createMultiplayer:e}=await import(`./multiplayer-BKD0Y8QT.js`);return{createMultiplayer:e}},[],import.meta.url);if(P!==`online`||r!==z)return;F=e({onState:Qe,onRound:e=>qe(e,!0),onSnapshot(e,t){L&&(B.set(e,t),V?.receiveSnapshot(e,t))}})}e===`host`?await F.host(t):await F.join(n,t)}catch(e){x.disabled=!1,S.disabled=!1,$(e.message||`暂时无法联机，请重试。`,!0)}}for(let e of h)C.add(new Option(e.name,e.id));for(let e of w)e.addEventListener(`click`,()=>{N=e.dataset.mapId,je.src=e.querySelector(`img`).src;for(let t of w)t.setAttribute(`aria-pressed`,String(t===e))},j);_(`solo`).addEventListener(`click`,()=>qe(Ke(N)),j),_(`show-online`).addEventListener(`click`,()=>{C.value=N,Z(`online`)},j),_(`back-online`).addEventListener(`click`,()=>{z+=1,F?.leave(),Z(`home`)},j),_(`back-game`).addEventListener(`click`,()=>{F?.leave(),Q(),Z(`home`)},j),x.addEventListener(`click`,()=>$e(`host`),j),Te.addEventListener(`submit`,e=>{e.preventDefault(),$e(`guest`)},j),_(`leave-room`).addEventListener(`click`,()=>F?.leave(),j),_(`copy-code`).addEventListener(`click`,async()=>{if(I?.code)try{await navigator.clipboard.writeText(I.code),$(`已复制房间码。`)}catch{$(`房间码 ${I.code}`)}},j),_(`start-round`).addEventListener(`click`,()=>{I?.role!==`host`||I.players.length<2||F.startRound({...Ke(C.value),startsAt:Date.now()+2500})},j),y.addEventListener(`click`,()=>{(M===`ready`||M===`paused`)&&X(`playing`,!0)},j),Se.addEventListener(`click`,()=>X(`paused`,!0),j),Ce.addEventListener(`click`,()=>V?.recover(),j),document.addEventListener(`keydown`,e=>{P!==`ride`||!V||!K||e.altKey||e.ctrlKey||e.metaKey||e.repeat||e.isComposing||(e.code===`KeyR`&&M===`playing`&&V.recover(),e.code!==`Space`||e.target.closest?.(`button, input, select, textarea, [contenteditable]`)||(M===`ready`&&!y.disabled||M===`paused`||M===`playing`)&&(e.preventDefault(),X(M===`playing`?`paused`:`playing`,!0)))},j);function et(){P===`ride`&&M===`playing`&&X(`paused`)}document.addEventListener(`visibilitychange`,()=>{document.hidden&&et()},j),window.addEventListener(`pagehide`,et,j),_(`relay-url`).value=``,_(`solo`).disabled=!1,_(`show-online`).disabled=!1,Xe();export{pe as n,me as r,g as t};