(()=>{var e={};e.id=161,e.ids=[161],e.modules={7849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},5403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},4749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},9491:e=>{"use strict";e.exports=require("assert")},2361:e=>{"use strict";e.exports=require("events")},7147:e=>{"use strict";e.exports=require("fs")},3685:e=>{"use strict";e.exports=require("http")},5687:e=>{"use strict";e.exports=require("https")},2037:e=>{"use strict";e.exports=require("os")},1017:e=>{"use strict";e.exports=require("path")},2781:e=>{"use strict";e.exports=require("stream")},6224:e=>{"use strict";e.exports=require("tty")},7310:e=>{"use strict";e.exports=require("url")},3837:e=>{"use strict";e.exports=require("util")},9796:e=>{"use strict";e.exports=require("zlib")},4718:(e,t,s)=>{"use strict";s.r(t),s.d(t,{GlobalError:()=>n.a,__next_app__:()=>h,originalPathname:()=>u,pages:()=>c,routeModule:()=>p,tree:()=>d});var r=s(482),a=s(9108),i=s(2563),n=s.n(i),l=s(8300),o={};for(let e in l)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(o[e]=()=>l[e]);s.d(t,o);let d=["",{children:["dashboard",{children:["assessments",{children:["take",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(s.bind(s,4740)),"/home/ubuntu/app/pathfinders-client/src/app/dashboard/assessments/take/page.tsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(s.bind(s,3096)),"/home/ubuntu/app/pathfinders-client/src/app/dashboard/layout.tsx"]}]},{layout:[()=>Promise.resolve().then(s.bind(s,3625)),"/home/ubuntu/app/pathfinders-client/src/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(s.t.bind(s,9361,23)),"next/dist/client/components/not-found-error"]}],c=["/home/ubuntu/app/pathfinders-client/src/app/dashboard/assessments/take/page.tsx"],u="/dashboard/assessments/take/page",h={require:s,loadChunk:()=>Promise.resolve()},p=new r.AppPageRouteModule({definition:{kind:a.x.APP_PAGE,page:"/dashboard/assessments/take/page",pathname:"/dashboard/assessments/take",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},6730:(e,t,s)=>{Promise.resolve().then(s.bind(s,2952))},2952:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>u});var r=s(5344),a=s(3729),i=s(8428),n=s(4701),l=s(3673),o=s(5094),d=s(8378),c=s(4755);function u(){let e=(0,i.useRouter)(),[t,s]=(0,a.useState)(!0),[u,h]=(0,a.useState)(!1),[p,m]=(0,a.useState)([]),[x,g]=(0,a.useState)(0),[y,b]=(0,a.useState)({});(0,a.useEffect)(()=>{v()},[]);let v=async()=>{try{s(!0);let e=await n.A.getQuestions();if(Array.isArray(e))m(e);else throw Error("Invalid response format")}catch(t){let e=t instanceof Error?t.message:"Failed to load questions";console.error("Failed to load questions:",t),c.toast.error(e)}finally{s(!1)}},f=e=>{let t=p[x];b({...y,[t.id]:{question_id:t.id,answer:e,gift_correlation:t.gift_correlation}}),x<p.length-1&&g(x+1)},w=async()=>{if(Object.keys(y).length!==p.length){c.toast.error("Please answer all questions");return}h(!0);try{let t=Object.values(y).map(e=>({question_id:e.question_id,answer:e.answer,gift_correlation:Object.fromEntries(Object.entries(e.gift_correlation).map(([e,t])=>[e.toUpperCase(),t]))}));if(await n.A.submitAnswers(t))e.push("/dashboard/assessments/results");else throw Error("No result received from assessment")}catch(t){console.error("Failed to submit assessment:",t);let e=t?.response?.data?.error||t?.message||"Failed to submit assessment";c.toast.error(e)}finally{h(!1)}};if(t)return r.jsx("div",{className:"flex items-center justify-center min-h-[60vh]",children:r.jsx(d.g,{size:"large"})});if(!p.length)return(0,r.jsxs)("div",{className:"flex flex-col items-center justify-center min-h-[60vh]",children:[r.jsx("p",{className:"text-gray-600 mb-4",children:"No questions available"}),r.jsx(o.z,{onClick:()=>e.push("/dashboard/assessments"),children:"Back to Assessments"})]});let k=p[x];return(0,r.jsxs)("div",{className:"max-w-3xl mx-auto space-y-8 p-4",children:[r.jsx("div",{className:"w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-700",children:r.jsx("div",{className:"bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-in-out",style:{width:`${(x+1)/p.length*100}%`}})}),(0,r.jsxs)(l.Z,{className:"p-8 bg-white shadow-lg",children:[(0,r.jsxs)("div",{className:"mb-8",children:[(0,r.jsxs)("div",{className:"text-sm text-gray-500 mb-2",children:["Question ",x+1," of ",p.length]}),r.jsx("h2",{className:"text-xl font-semibold text-gray-900",children:k?.text})]}),r.jsx("div",{className:"space-y-3",children:[{value:0,label:"Never"},{value:1,label:"Occasionally"},{value:2,label:"Sometimes"},{value:3,label:"Usually"},{value:4,label:"Mostly"},{value:5,label:"Always"}].map(e=>(0,r.jsxs)("button",{onClick:()=>f(e.value),className:`w-full p-4 text-left rounded-lg border transition-all duration-200
                ${y[k?.id]?.answer===e.value?"border-indigo-500 bg-indigo-50 text-indigo-700":"border-gray-200 hover:border-indigo-200 hover:bg-gray-50 text-gray-700"}
                flex items-center justify-between group hover:text-gray-900
              `,children:[r.jsx("span",{className:`text-base font-medium ${y[k?.id]?.answer===e.value?"text-indigo-700":"text-gray-700 group-hover:text-gray-900"}`,children:e.label}),r.jsx("span",{className:`w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${y[k?.id]?.answer===e.value?"border-indigo-500 bg-indigo-500":"border-gray-400 group-hover:border-indigo-200"}`,children:y[k?.id]?.answer===e.value&&r.jsx("span",{className:"text-white text-sm",children:"✓"})})]},e.value))}),(0,r.jsxs)("div",{className:"mt-8 flex justify-between",children:[r.jsx(o.z,{variant:"outline",onClick:()=>g(Math.max(0,x-1)),disabled:0===x,className:"px-6",children:"Previous"}),x===p.length-1?r.jsx(o.z,{onClick:w,disabled:u||!y[k?.id],className:"px-6 bg-indigo-600 hover:bg-indigo-700",children:u?(0,r.jsxs)("div",{className:"flex items-center",children:[r.jsx(d.g,{size:"small"}),r.jsx("span",{className:"ml-2",children:"Submitting..."})]}):"Submit Assessment"}):r.jsx(o.z,{onClick:()=>g(x+1),disabled:!y[k?.id],className:"px-6 bg-indigo-600 hover:bg-indigo-700",children:"Next"})]})]}),(0,r.jsxs)("div",{className:"text-center text-sm text-gray-500",children:[Math.round((x+1)/p.length*100),"% Complete"]})]})}},4701:(e,t,s)=>{"use strict";s.d(t,{A:()=>a});var r=s(6548);let a={getQuestions:async()=>(await r.hi.get("/api/questions/list_all/")).data,submitAnswers:async e=>{try{let t=await r.hi.post("/api/assessments/submit/",{answers:e});if(!t.data)throw Error("No data received from server");return t.data}catch(e){if(e?.response?.data?.error)throw Error(e.response.data.error);throw e}},saveProgress:async e=>{await r.hi.post("/api/assessments/save-progress/",{current_answers:e})},getProgress:async()=>(await r.hi.get("/api/assessments/get-progress/")).data,getLatestResults:async()=>(await r.hi.get("/api/assessments/latest-results/")).data,getGiftDetails:async()=>(await r.hi.get("/api/assessments/latest-results/")).data}},4740:(e,t,s)=>{"use strict";s.r(t),s.d(t,{$$typeof:()=>i,__esModule:()=>a,default:()=>n});let r=(0,s(6843).createProxy)(String.raw`/home/ubuntu/app/pathfinders-client/src/app/dashboard/assessments/take/page.tsx`),{__esModule:a,$$typeof:i}=r,n=r.default},4109:(e,t,s)=>{"use strict";s.d(t,{Z:()=>o});var r=s(3729);/**
 * @license lucide-react v0.471.2 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),i=(...e)=>e.filter((e,t,s)=>!!e&&""!==e.trim()&&s.indexOf(e)===t).join(" ").trim();/**
 * @license lucide-react v0.471.2 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var n={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.471.2 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let l=(0,r.forwardRef)(({color:e="currentColor",size:t=24,strokeWidth:s=2,absoluteStrokeWidth:a,className:l="",children:o,iconNode:d,...c},u)=>(0,r.createElement)("svg",{ref:u,...n,width:t,height:t,stroke:e,strokeWidth:a?24*Number(s)/Number(t):s,className:i("lucide",l),...c},[...d.map(([e,t])=>(0,r.createElement)(e,t)),...Array.isArray(o)?o:[o]])),o=(e,t)=>{let s=(0,r.forwardRef)(({className:s,...n},o)=>(0,r.createElement)(l,{ref:o,iconNode:t,className:i(`lucide-${a(e)}`,s),...n}));return s.displayName=`${e}`,s}},6239:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});let r=(0,s(4109).Z)("Bell",[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]])},8477:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});let r=(0,s(4109).Z)("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]])},5426:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});let r=(0,s(4109).Z)("Book",[["path",{d:"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20",key:"k3hazp"}]])},8220:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});let r=(0,s(4109).Z)("CircleUser",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}],["path",{d:"M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662",key:"154egf"}]])},7232:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});let r=(0,s(4109).Z)("ClipboardCheck",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"m9 14 2 2 4-4",key:"df797q"}]])},6086:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});let r=(0,s(4109).Z)("House",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"1d0kgt"}]])},1031:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});let r=(0,s(4109).Z)("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]])},7737:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});let r=(0,s(4109).Z)("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]])}};var t=require("../../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[287,476,341,115],()=>s(4718));module.exports=r})();