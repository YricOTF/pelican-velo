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
`,r=`<!-- @license lucide-static v0.577.0 - ISC -->
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
`,i=`<!-- @license lucide-static v0.577.0 - ISC -->
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
`,a=`<!-- @license lucide-static v0.577.0 - ISC -->
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
`,o=`<!-- @license lucide-static v0.577.0 - ISC -->
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
`,s=`<!-- @license lucide-static v0.577.0 - ISC -->
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
`,c=`<!-- @license lucide-static v0.577.0 - ISC -->
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
`,l=`<!-- @license lucide-static v0.577.0 - ISC -->
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
`,u=`<!-- @license lucide-static v0.577.0 - ISC -->
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
`,d=`<!-- @license lucide-static v0.577.0 - ISC -->
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
`,f=`<!-- @license lucide-static v0.577.0 - ISC -->
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
`,p=`<!-- @license lucide-static v0.577.0 - ISC -->
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
`,m=new Set([`left`,`right`,`throttle`,`brake`]),h=new Map([[`KeyA`,`left`],[`KeyD`,`right`],[`KeyW`,`throttle`],[`KeyS`,`brake`],[`ArrowLeft`,`left`],[`ArrowRight`,`right`],[`ArrowUp`,`throttle`],[`ArrowDown`,`brake`]]),g=new Map([[`a`,`left`],[`d`,`right`],[`w`,`throttle`],[`s`,`brake`]]);function _(e){return e.composedPath().some(e=>e.isContentEditable||e.matches?.(`input, select, textarea, [role="textbox"], [role="slider"], [role="spinbutton"]`))}function v(e){let t=e.ownerDocument,n=t.defaultView,r=new AbortController,{signal:i}=r,a=new Map,o=new Map,s=new Set,c=new Map;for(let t of e.querySelectorAll(`button[data-drive]`)){let e=t.dataset.drive;m.has(e)&&(c.set(t,{action:e,touchAction:t.style.touchAction}),t.style.touchAction=`none`)}function l(){s.clear();for(let e of a.values())s.add(e);for(let{action:e}of o.values())s.add(e);for(let[e,{action:t}]of c)s.has(t)?e.dataset.active=`true`:delete e.dataset.active}function u(){a.clear();let e=[...o];o.clear();for(let[t,{button:n}]of e)n.hasPointerCapture?.(t)&&n.releasePointerCapture(t);l()}function d(e){if(e.defaultPrevented||e.isComposing||e.altKey||e.ctrlKey||e.metaKey||_(e)||![...c.keys()].some(e=>!e.disabled))return;let t=e.key.toLowerCase(),n=h.get(e.code)??h.get(e.key)??g.get(t);if(!n)return;e.preventDefault();let r=e.code||t;a.has(r)||(a.set(r,n),l())}function f(e){a.delete(e.code||e.key.toLowerCase())&&l()}function p(e){if(e.defaultPrevented||e.button!==0)return;let t=e.target.closest?.(`button[data-drive]`),n=c.get(t);if(n&&!t.disabled){e.preventDefault(),o.set(e.pointerId,{button:t,action:n.action});try{t.setPointerCapture?.(e.pointerId)}catch{}l()}}function v(e){o.delete(e.pointerId)&&l()}return e.addEventListener(`pointerdown`,p,{signal:i}),e.addEventListener(`lostpointercapture`,v,{signal:i}),e.addEventListener(`contextmenu`,e=>{c.has(e.target.closest?.(`button[data-drive]`))&&e.preventDefault()},{signal:i}),n.addEventListener(`pointerup`,v,{signal:i,capture:!0}),n.addEventListener(`pointercancel`,v,{signal:i,capture:!0}),n.addEventListener(`keydown`,d,{signal:i}),n.addEventListener(`keyup`,f,{signal:i}),n.addEventListener(`blur`,u,{signal:i}),t.addEventListener(`visibilitychange`,()=>{t.hidden&&u()},{signal:i}),{read(){return{steer:Number(s.has(`right`))-Number(s.has(`left`)),throttle:Number(s.has(`throttle`)),brake:Number(s.has(`brake`))}},clear:u,dispose(){r.abort(),u();for(let[e,{touchAction:t}]of c)e.style.touchAction=t}}}var y=`modulepreload`,b=function(e,t){return new URL(e,t).href},x={},ee=function(e){return e.pathname.endsWith(`.css`)},te=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},ne=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=b(t,n);let r=s(t),i=ee(r);return te(x,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:y,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{let i=a=>{t.removeEventListener(`load`,i),t.removeEventListener(`error`,i),a.type===`error`?n(Error(`Unable to preload CSS for ${r}`)):e(a)};t.addEventListener(`load`,i),t.addEventListener(`error`,i)})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},re={bird:e,sun:t,sunset:n,route:r,flag:i,pause:o,play:s,octagon:d,keyboard:p,"clock-3":a,"rotate-ccw":c,"chevron-left":l,"chevron-right":u,"arrow-up":f};for(let e of document.querySelectorAll(`[data-icon]`))e.innerHTML=re[e.dataset.icon];var S=e=>document.getElementById(e),C=S(`stage`),w=S(`viewport`),T=S(`start`),E=S(`pause`),D=S(`recover`),O=S(`weather`),k=S(`brief`),A=S(`brief-title`),j=S(`brief-copy`),M=S(`start-label`),N=S(`speed`),ie=S(`laps`),ae=S(`lap-time`),oe=S(`best-time`),P=S(`lap-progress`),se=S(`offroad`),F=S(`traffic-warning`),I=S(`toast`),L=S(`minimap`),R=[...document.querySelectorAll(`[data-drive]`)],z=v(document.querySelector(`.ride-panel`)),B={signal:new AbortController().signal},V=`loading`,H=`day`,U,W,G=0,K=0,q,J=!0;function Y(e,t){e.textContent!==t&&(e.textContent=t)}function X(e,t=!1){let n=Math.floor(e/60),r=e-n*60,i=String(Math.floor(r)).padStart(2,`0`),a=Math.floor(r%1*10);return`${n}:${i}${t?`.`+a:``}`}function Z(e){clearTimeout(q),I.textContent=e,I.hidden=!1,q=setTimeout(()=>{I.hidden=!0},2600)}function Q(e,t=!1){V=e,C.dataset.mode=V,U?.setMode(V),V!==`playing`&&z.clear();let n=V===`playing`&&J;k.hidden=n,E.disabled=!n,D.disabled=!n;for(let e of R)e.disabled=!n;let r=V===`ready`;T.disabled=!J||!(r||V===`paused`),r?(A.textContent=`准备出发`,M.textContent=`开始骑行`):V===`paused`&&(A.textContent=`骑行暂停`,M.textContent=`继续骑行`),t&&(n?w.focus({preventScroll:!0}):T.disabled||T.focus({preventScroll:!0}))}function ce(e){let t=L.getContext(`2d`);if(!t)return null;let n=e.map(({x:e})=>e),r=e.map(({z:e})=>e),i=Math.min(...n),a=Math.min(...r),o=Math.max(...n)-i,s=Math.max(...r)-a,c=Math.min((L.width-24)/o,(L.height-16)/s),l=(L.width-o*c)/2,u=(L.height-s*c)/2,d=e=>l+(e-i)*c,f=e=>u+(e-a)*c,p=new Path2D,m=e[0];p.moveTo(d(m.x),f(m.z));for(let t of e.slice(1))p.lineTo(d(t.x),f(t.z));return p.closePath(),({position:e,heading:n},r)=>{t.clearRect(0,0,L.width,L.height),t.fillStyle=`#c3eee721`,t.fill(p),t.lineWidth=6,t.strokeStyle=`#b8d6c969`,t.stroke(p),t.lineWidth=1,t.strokeStyle=`#e6efd9a6`,t.setLineDash([3,4]),t.stroke(p),t.setLineDash([]),t.fillStyle=`#f1f1da`,t.fillRect(d(m.x)-2,f(m.z)-4,4,8),t.fillStyle=`#ffba9b`;for(let e of r)t.beginPath(),t.arc(d(e.position.x),f(e.position.z),2.2,0,2*Math.PI),t.fill();t.save(),t.translate(d(e.x),f(e.z)),t.rotate(n),t.beginPath(),t.moveTo(8,0),t.lineTo(-5,-4),t.lineTo(-3,0),t.lineTo(-5,4),t.closePath(),t.fillStyle=`#dbfa78`,t.strokeStyle=`#263f2d`,t.lineWidth=2,t.stroke(),t.fill(),t.restore()}}function le(e,t){Y(N,String(Math.round(e.speed*3.6))),Y(ie,`${e.laps} 圈`),Y(ae,X(e.lapTime)),Y(oe,e.bestLap===null?`—`:X(e.bestLap,!0)),Y(P,`${Math.floor(e.progress*100)}%`),F.hidden=!e.yielding,se.hidden=!e.offroad||e.yielding,W?.(e,t),e.laps>G&&Z(`完成第 ${e.laps} 圈 · ${X(e.lastLap,!0)}`),e.respawns>K&&Z(`已回到公路`),G=e.laps,K=e.respawns}T.addEventListener(`click`,()=>{(V===`ready`||V===`paused`)&&Q(`playing`,!0)},B),E.addEventListener(`click`,()=>Q(`paused`,!0),B),D.addEventListener(`click`,()=>U?.recover(),B),O.addEventListener(`click`,()=>{H=H===`day`?`sunset`:`day`,document.documentElement.dataset.weather=H,S(`weather-label`).textContent=H===`day`?`晴天`:`日落`,O.setAttribute(`aria-label`,H===`day`?`切换为日落`:`切换为晴天`),U?.setWeather(H)},B),document.addEventListener(`keydown`,e=>{!U||!J||e.altKey||e.ctrlKey||e.metaKey||e.repeat||e.isComposing||(e.code===`KeyR`&&V===`playing`&&U.recover(),e.code!==`Space`||e.target.closest?.(`button, input, select, textarea, [contenteditable]`)||(V===`ready`||V===`paused`||V===`playing`)&&(e.preventDefault(),Q(V===`playing`?`paused`:`playing`,!0)))},B);function $(){V===`playing`&&Q(`paused`)}document.addEventListener(`visibilitychange`,()=>{document.hidden&&$()},B),window.addEventListener(`pagehide`,$,B);try{let{createRideScene:e}=await ne(async()=>{let{createRideScene:e}=await import(`./ride-scene-BhD4NhYm.js`);return{createRideScene:e}},[],import.meta.url);U=e(w,{getInput:z.read,onState:le,onContextStatus(e){J=e,Q(!e&&V===`playing`?`paused`:V),M.textContent=e?V===`ready`?`开始骑行`:`继续骑行`:`正在恢复 3D 场景`}}),W=ce(U.route),S(`route-length`).textContent=`${Math.round(U.length)} m`,U.setWeather(H),Q(`ready`)}catch(e){console.error(e),Q(`unavailable`),A.textContent=`3D 场景无法启动`,j.textContent=`请使用支持 WebGL 2 的浏览器。`,T.hidden=!0}