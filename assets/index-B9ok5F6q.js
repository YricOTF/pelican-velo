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
`,m=new Set([`left`,`right`,`throttle`,`brake`]),h=new Map([[`KeyA`,`left`],[`KeyD`,`right`],[`KeyW`,`throttle`],[`KeyS`,`brake`],[`ArrowLeft`,`left`],[`ArrowRight`,`right`],[`ArrowUp`,`throttle`],[`ArrowDown`,`brake`]]),g=new Map([[`a`,`left`],[`d`,`right`],[`w`,`throttle`],[`s`,`brake`]]);function _(e){return e.composedPath().some(e=>e.isContentEditable||e.matches?.(`input, select, textarea, [role="textbox"], [role="slider"], [role="spinbutton"]`))}function v(e){let t=e.ownerDocument,n=t.defaultView,r=new AbortController,{signal:i}=r,a=new Map,o=new Map,s=new Set,c=new Map;for(let t of e.querySelectorAll(`button[data-drive]`)){let e=t.dataset.drive;m.has(e)&&(c.set(t,{action:e,touchAction:t.style.touchAction}),t.style.touchAction=`none`)}function l(){s.clear();for(let e of a.values())s.add(e);for(let{action:e}of o.values())s.add(e);for(let[e,{action:t}]of c)s.has(t)?e.dataset.active=`true`:delete e.dataset.active}function u(){a.clear();let e=[...o];o.clear();for(let[t,{button:n}]of e)n.hasPointerCapture?.(t)&&n.releasePointerCapture(t);l()}function d(e){if(e.defaultPrevented||e.isComposing||e.altKey||e.ctrlKey||e.metaKey||_(e)||![...c.keys()].some(e=>!e.disabled))return;let t=e.key.toLowerCase(),n=h.get(e.code)??h.get(e.key)??g.get(t);if(!n)return;e.preventDefault();let r=e.code||t;a.has(r)||(a.set(r,n),l())}function f(e){a.delete(e.code||e.key.toLowerCase())&&l()}function p(e){if(e.defaultPrevented||e.button!==0)return;let t=e.target.closest?.(`button[data-drive]`),n=c.get(t);if(n&&!t.disabled){e.preventDefault(),o.set(e.pointerId,{button:t,action:n.action});try{t.setPointerCapture?.(e.pointerId)}catch{}l()}}function v(e){o.delete(e.pointerId)&&l()}return e.addEventListener(`pointerdown`,p,{signal:i}),e.addEventListener(`lostpointercapture`,v,{signal:i}),e.addEventListener(`contextmenu`,e=>{c.has(e.target.closest?.(`button[data-drive]`))&&e.preventDefault()},{signal:i}),n.addEventListener(`pointerup`,v,{signal:i,capture:!0}),n.addEventListener(`pointercancel`,v,{signal:i,capture:!0}),n.addEventListener(`keydown`,d,{signal:i}),n.addEventListener(`keyup`,f,{signal:i}),n.addEventListener(`blur`,u,{signal:i}),t.addEventListener(`visibilitychange`,()=>{t.hidden&&u()},{signal:i}),{read(){return{steer:Number(s.has(`right`))-Number(s.has(`left`)),throttle:Number(s.has(`throttle`)),brake:Number(s.has(`brake`))}},clear:u,dispose(){r.abort(),u();for(let[e,{touchAction:t}]of c)e.style.touchAction=t}}}var ee=`modulepreload`,te=function(e,t){return new URL(e,t).href},ne={},re=function(e){return e.pathname.endsWith(`.css`)},y=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},ie=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=te(t,n);let r=s(t),i=re(r);return y(ne,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:ee,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{let i=a=>{t.removeEventListener(`load`,i),t.removeEventListener(`error`,i),a.type===`error`?n(Error(`Unable to preload CSS for ${r}`)):e(a)};t.addEventListener(`load`,i),t.addEventListener(`error`,i)})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},b={bird:e,sun:t,sunset:n,route:r,flag:i,pause:o,play:s,octagon:d,keyboard:p,"clock-3":a,"rotate-ccw":c,"chevron-left":l,"chevron-right":u,"arrow-up":f};for(let e of document.querySelectorAll(`[data-icon]`))e.innerHTML=b[e.dataset.icon];var x=e=>document.getElementById(e),S=x(`stage`),C=x(`viewport`),w=x(`start`),T=x(`pause`),E=x(`recover`),D=x(`weather`),O=x(`brief`),k=x(`brief-title`),A=x(`brief-copy`),j=x(`start-label`),M=x(`speed`),N=x(`laps`),P=x(`lap-time`),F=x(`best-time`),I=x(`lap-progress`),L=x(`offroad`),R=x(`toast`),z=x(`minimap`),ae=[...document.querySelectorAll(`[data-drive]`)],B=v(document.querySelector(`.ride-panel`)),V={signal:new AbortController().signal},H=`loading`,U=`day`,W,G,K=0,q=0,J,Y=!0;function X(e,t){e.textContent!==t&&(e.textContent=t)}function Z(e,t=!1){let n=Math.floor(e/60),r=e-n*60,i=String(Math.floor(r)).padStart(2,`0`),a=Math.floor(r%1*10);return`${n}:${i}${t?`.`+a:``}`}function Q(e){clearTimeout(J),R.textContent=e,R.hidden=!1,J=setTimeout(()=>{R.hidden=!0},2600)}function $(e,t=!1){H=e,S.dataset.mode=H,W?.setMode(H),H!==`playing`&&B.clear();let n=H===`playing`&&Y;O.hidden=n,T.disabled=!n,E.disabled=!n;for(let e of ae)e.disabled=!n;let r=H===`ready`;w.disabled=!Y||!(r||H===`paused`),r?(k.textContent=`准备出发`,j.textContent=`开始骑行`):H===`paused`&&(k.textContent=`骑行暂停`,j.textContent=`继续骑行`),t&&(n?C.focus({preventScroll:!0}):w.disabled||w.focus({preventScroll:!0}))}function oe(e){let t=z.getContext(`2d`);if(!t)return null;let n=e.map(({x:e})=>e),r=e.map(({z:e})=>e),i=Math.min(...n),a=Math.min(...r),o=Math.max(...n)-i,s=Math.max(...r)-a,c=Math.min((z.width-24)/o,(z.height-16)/s),l=(z.width-o*c)/2,u=(z.height-s*c)/2,d=e=>l+(e-i)*c,f=e=>u+(e-a)*c,p=new Path2D,m=e[0];p.moveTo(d(m.x),f(m.z));for(let t of e.slice(1))p.lineTo(d(t.x),f(t.z));return p.closePath(),({position:e,heading:n})=>{t.clearRect(0,0,z.width,z.height),t.fillStyle=`#c3eee721`,t.fill(p),t.lineWidth=6,t.strokeStyle=`#b8d6c969`,t.stroke(p),t.lineWidth=1,t.strokeStyle=`#e6efd9a6`,t.setLineDash([3,4]),t.stroke(p),t.setLineDash([]),t.fillStyle=`#f1f1da`,t.fillRect(d(m.x)-2,f(m.z)-4,4,8),t.save(),t.translate(d(e.x),f(e.z)),t.rotate(n),t.beginPath(),t.moveTo(8,0),t.lineTo(-5,-4),t.lineTo(-3,0),t.lineTo(-5,4),t.closePath(),t.fillStyle=`#dbfa78`,t.strokeStyle=`#263f2d`,t.lineWidth=2,t.stroke(),t.fill(),t.restore()}}function se(e){X(M,String(Math.round(e.speed*3.6))),X(N,`${e.laps} 圈`),X(P,Z(e.lapTime)),X(F,e.bestLap===null?`—`:Z(e.bestLap,!0)),X(I,`${Math.floor(e.progress*100)}%`),L.hidden=!e.offroad,G?.(e),e.laps>K&&Q(`完成第 ${e.laps} 圈 · ${Z(e.lastLap,!0)}`),e.respawns>q&&Q(`已回到公路`),K=e.laps,q=e.respawns}w.addEventListener(`click`,()=>{(H===`ready`||H===`paused`)&&$(`playing`,!0)},V),T.addEventListener(`click`,()=>$(`paused`,!0),V),E.addEventListener(`click`,()=>W?.recover(),V),D.addEventListener(`click`,()=>{U=U===`day`?`sunset`:`day`,document.documentElement.dataset.weather=U,x(`weather-label`).textContent=U===`day`?`晴天`:`日落`,D.setAttribute(`aria-label`,U===`day`?`切换为日落`:`切换为晴天`),W?.setWeather(U)},V),document.addEventListener(`keydown`,e=>{!W||!Y||e.altKey||e.ctrlKey||e.metaKey||e.repeat||e.isComposing||(e.code===`KeyR`&&H===`playing`&&W.recover(),e.code!==`Space`||e.target.closest?.(`button, input, select, textarea, [contenteditable]`)||(H===`ready`||H===`paused`||H===`playing`)&&(e.preventDefault(),$(H===`playing`?`paused`:`playing`,!0)))},V),document.addEventListener(`visibilitychange`,()=>{document.hidden&&H===`playing`&&$(`paused`)},V);try{let{createRideScene:e}=await ie(async()=>{let{createRideScene:e}=await import(`./ride-scene-B6_Ik3MZ.js`);return{createRideScene:e}},[],import.meta.url);W=e(C,{getInput:B.read,onState:se,onContextStatus(e){Y=e,$(!e&&H===`playing`?`paused`:H),j.textContent=e?H===`ready`?`开始骑行`:`继续骑行`:`正在恢复 3D 场景`}}),G=oe(W.route),x(`route-length`).textContent=`${Math.round(W.length)} m`,W.setWeather(U),$(`ready`)}catch(e){console.error(e),$(`unavailable`),k.textContent=`3D 场景无法启动`,A.textContent=`请使用支持 WebGL 2 的浏览器。`,w.hidden=!0}