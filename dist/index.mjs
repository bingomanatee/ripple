import e from"bottlejs";import{Subject as t,of as r}from"rxjs";import n from"url-join";import o from"@wonderlandlabs/propper";import i from"axios";import s from"lodash.isequal";import{filter as a,catchError as u,map as c,switchMap as l,distinctUntilChanged as p}from"rxjs/operators";import f from"lodash.get";import d from"uuid/v4";var m=function(e){return encodeURIComponent(e).replace(/[!'()*]/g,function(e){return"%"+e.charCodeAt(0).toString(16).toUpperCase()})},h=Object.getOwnPropertySymbols,y=Object.prototype.hasOwnProperty,g=Object.prototype.propertyIsEnumerable,b=function(){try{if(!Object.assign)return!1;var e=new String("abc");if(e[5]="de","5"===Object.getOwnPropertyNames(e)[0])return!1;for(var t={},r=0;r<10;r++)t["_"+String.fromCharCode(r)]=r;if("0123456789"!==Object.getOwnPropertyNames(t).map(function(e){return t[e]}).join(""))return!1;var n={};return"abcdefghijklmnopqrst".split("").forEach(function(e){n[e]=e}),"abcdefghijklmnopqrst"===Object.keys(Object.assign({},n)).join("")}catch(e){return!1}}()?Object.assign:function(e,t){for(var r,n,o=function(e){if(null==e)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(e)}(e),i=1;i<arguments.length;i++){for(var s in r=Object(arguments[i]))y.call(r,s)&&(o[s]=r[s]);if(h){n=h(r);for(var a=0;a<n.length;a++)g.call(r,n[a])&&(o[n[a]]=r[n[a]])}}return o};function v(e,t){return t.encode?t.strict?m(e):encodeURIComponent(e):e}new RegExp("%[a-f0-9]{2}","gi"),new RegExp("(%[a-f0-9]{2})+","gi");var S=function(){var m=new e;return function(e){e.factory("UNSET",function(e){return(0,e.Symbol)("UNSET")}),e.factory("ifUnset",function(e){var t=e.UNSET;return function(e,r){return e===t||void 0===e?r:e}}),e.factory("isUnset",function(e){var t=e.UNSET;return function(e){return e===t}}),e.factory("Symbol",function(){return function(e){return{name:e}}}),e.factory("error",function(){return function(e,t){var r=new Error(e);return t?Object.assign(r,{info:t}):r}})}(m),function(e){e.factory("Vector",function(e){var t=e.UNSET,r=e.Impulse,n=e.error,i=e.noop,s=e.isUnset,u=function(e,r,n,o){void 0===o&&(o={}),this.sender=r,this.pool=n,this.config=f(o,"config",o),this.schema=f(o,"schema"),this._makeImpulseStream=f(o,"makeImpulseStream",t),this._paramsToQuery=f(o,"paramsToQuery",i),this.idempotent=f(o,"idempotent",!1),this.name=e},c={signalStream:{configurable:!0}};return u.prototype.impulse=function(e){return void 0===e&&(e={}),new r({vector:this,params:e})},u.prototype.paramsToQuery=function(e){return this._paramsToQuery(e.params,e,this)},u.prototype.send=function(e){try{var t=this;return function(r,n){try{var o=Promise.resolve(t.sender(e.query,e)).then(function(t){return e.response=t,s(e.impulse.response)||(e.impulse.response=e.response),Promise.resolve(e)})}catch(e){return n(e)}return o&&o.then?o.then(void 0,n):o}(0,function(t){return e.error=t,Promise.reject(e)})}catch(e){return Promise.reject(e)}},u.prototype.makeImpulseStream=function(e){return s(this._makeImpulseStream)?e.pool.signalStream.pipe(a(function(t){return t.impulse.id===e.id})):this._makeImpulseStream(e,this)},c.signalStream.get=function(){var e=this;return this._signalStream||(this._signalStream=this.pool.signalStream.pipe(a(function(t){return t.vector.name===e.name}))),this._signalStream},u.prototype.subscribe=function(){for(var e,t=[],r=arguments.length;r--;)t[r]=arguments[r];return(e=this.signalStream).subscribe.apply(e,t)},Object.defineProperties(u.prototype,c),o(u).addProp("idempotent",{type:"boolean",defaultValue:!1}).addProp("pool",{required:!0,type:"object",onInvalid:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];throw n("bad vector.pool",{field:"config",object:"Pool",params:e})}}).addProp("sender",{required:!0,type:"function",onInvalid:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];throw n("bad vector.sender",{field:"config",object:"Pool",params:e})}}).addProp("schema").addProp("config",{type:"object",onInvalid:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];throw n("bad vector.config",{field:"config",object:"Pool",params:e})}}).addProp("name",{required:!0,type:"string",onInvalid:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];throw n("bad vector.name",{field:"config",object:"Pool",params:e})}}),u})}(m),function(e){e.factory("Pool",function(e){var r=e.Vector,n=e.error,i=function(e,t){var r=this;void 0===t&&(t={}),this.name=e,this.vectors=f(t,"_vectors",new Map),this.vectors.forEach(function(e){e.pool=r}),this.config=f(t,"config",t)},s={signalStream:{configurable:!0}};return i.prototype.addVector=function(e,t,o,i){if(void 0===i&&(i=!1),this.vectors.has(e)&&!i)throw n("Attempt to redefine "+e,{config:o,name:e,pool:this});return t instanceof r?(t.pool=this,this.vectors.set(e,t)):this.vectors.set(e,new r(e,t,this,o)),this},i.prototype.impulse=function(e){for(var t=[],r=arguments.length-1;r-- >0;)t[r]=arguments[r+1];if(!this.vectors.has(e))throw n("attempt to use an unregistered vector",{pool:this,name:e,params:t});return this.vectors.get(e).impulse(t)},s.signalStream.get=function(){return this._signalStream||(this._signalStream=new t),this._signalStream},i.prototype.subscribe=function(){for(var e,t=[],r=arguments.length;r--;)t[r]=arguments[r];return(e=this.signalStream).subscribe.apply(e,t)},i.prototype.toJSON=function(){return{name:this.name,TYPE:"POOL",vectors:Array.from(this.vectors.keys())}},Object.defineProperties(i.prototype,s),o(i).addProp("vectors",{defaultValue:function(){return new Map}}).addProp("name",{type:"string",required:!0}).addProp("config",{type:"object",defaultValue:function(){return{}},onInvalid:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];throw n("bad pool.config",{field:"config",object:"Pool",params:e})}}),i})}(m),function(e){e.constant("noop",function(e){return e});var t=function(e){return{error:e,defaultCatcher:!0}};e.factory("rxCatch",function(e){var n=e.noop;return function(e,o,i){return void 0===o&&(o=n),void 0===i&&(i=t),e.pipe(l(function(e){return r(e).pipe(c(o),u(function(e){return r(i(e))}))}))}})}(m),function(e){e.factory("IMPULSE_STATE_NEW",function(e){return(0,e.Symbol)("IMPULSE_STATE_NEW")}),e.factory("IMPULSE_STATE_QUEUED",function(e){return(0,e.Symbol)("IMPULSE_STATE_QUEUED")}),e.factory("IMPULSE_STATE_SENT",function(e){return(0,e.Symbol)("IMPULSE_STATE_SENT")}),e.factory("IMPULSE_STATE_RESOLVED",function(e){return(0,e.Symbol)("IMPULSE_STATE_RESOLVED")}),e.factory("IMPULSE_STATE_UPDATED",function(e){return(0,e.Symbol)("IMPULSE_STATE_UPDATED")}),e.factory("IMPULSE_STATE_ERROR",function(e){return(0,e.Symbol)("IMPULSE_STATE_ERROR")}),e.factory("IMPULSE_STATE_COMPLETE",function(e){return(0,e.Symbol)("IMPULSE_STATE_COMPLETE")}),e.factory("Impulse",function(e){var t=e.UNSET,r=e.error,n=e.Signal,i=e.isUnset,s=function(e){void 0===e&&(e={}),this.id=d(),this.vector=f(e,"vector"),this.params=f(e,"params",e)},a={pool:{configurable:!0},signalStream:{configurable:!0},_subs:{configurable:!0}};return a.pool.get=function(){return this.vector.pool},s.prototype.toJSON=function(){return{id:this.id,TYPE:"Impulse",vector:this.vector.name,params:this.params,sent:this.sent,response:this.response}},s.prototype.send=function(){var e=this;if(this._pending)return this.vector.idempotent?this._pending:this._pending.then(function(){return e.send()}).catch(function(){return e.send()});var t=new n(this);return this._pending=this.vector.send(t).then(function(t){return e._pending=!1,i(e.response)&&(e.response=t.response),e.pool.signalStream.next(t),t}).catch(function(){return e._pending=!1,e.pool.signalStream.error(t),t}),this.sent=!0,this._pending},a.signalStream.get=function(){return this._signalStream||(this._signalStream=this.vector.makeImpulseStream(this)),this._signalStream},s.prototype.subscribe=function(){for(var e,t=[],n=arguments.length;n--;)t[n]=arguments[n];if(this._completed)throw r("cannot subscribe to completed impulse",{impulse:this,params:t});var o=(e=this.signalStream).subscribe.apply(e,t);return this._subs.push(o),o},a._subs.get=function(){return this.__subs||(this.__subs=[]),this.__subs},s.prototype.complete=function(){this._completed=!0,this._signalStream&&this._signalStream.complete(),this.__subs&&this.__subs.forEach(function(e){return e.unsubscribe()}),delete this.__subs},s.prototype.paramsToID=function(){if(/(get|post|delete)/.test(this.vector.name)){var e=this.pool.impulseParamsToQuery(this);i(e.id||""===e.id)||(this.identity=e.id)}},s.prototype.signalToID=function(e){e.impulse.id===this.id&&e.response&&"object"==typeof e.response&&(this.identity=e.response[this.pool.identityField])},Object.defineProperties(s.prototype,a),o(s).addProp("params",{type:"array",required:!0}).addProp("response",{defaultValue:function(){return t}}).addProp("sent",{type:"boolean",defaultValue:!1}).addProp("vector",{required:!0,type:"object",onInvalid:function(e){throw r("bad impulse.config",{field:"vector",object:"Impulse",err:e})}}),s})}(m),function(e){e.factory("RestPool",function(e){var t=e.error,r=e.isUnset,i=e.noop,s=e.axios,a=e.UNSET,u=e.REST_ACTIONS,c=e.restVectors,l=e.impulseParamsToQuery,p=function(e){function o(n,o){var p=this;e.call(this,n,o),this.baseURL=f(o,"baseURL","/"),this.prepQuery=f(o,"prepQuery",null),this.identityField=f(o,"identityField","id"),this.responseToData=f(o,"responseToData",i),this.connection=f(o,"connection",s),this.impulseParamsToQuery=f(o,"impulseParamsToQuery",l);var d=f(o,"restActions",a);r(d)?u.forEach(function(e){var t=Object.assign({},c[e]),r=t.sender;delete t.sender,p.addVector(e,r,t)}):d.forEach(function(e){var r;if("string"==typeof e){var i=Object.assign({},c[e]),s=o.sender;delete i.sender,p.addVector(e,s,i)}else{if(!Array.isArray(actionConfig))throw t("strange action for pool "+n,{action:actionConfig});(r=p).addVector.apply(r,actionConfig)}})}return e&&(o.__proto__=e),(o.prototype=Object.create(e&&e.prototype)).constructor=o,o.prototype.toJSON=function(){return{name:this.name,TYPE:"RestPool",baseURL:this.baseURL,vectors:Array.from(this.vectors.keys())}},o.prototype.url=function(e,t){var o=""===e||r(e)?this.baseURL:n(this.baseURL,e),i=function(e,t){!1===(t=b({encode:!0,strict:!0,arrayFormat:"none"},t)).sort&&(t.sort=function(){});var r=function(e){switch(e.arrayFormat){case"index":return function(t,r,n){return null===r?[v(t,e),"[",n,"]"].join(""):[v(t,e),"[",v(n,e),"]=",v(r,e)].join("")};case"bracket":return function(t,r){return null===r?v(t,e):[v(t,e),"[]=",v(r,e)].join("")};default:return function(t,r){return null===r?v(t,e):[v(t,e),"=",v(r,e)].join("")}}}(t);return e?Object.keys(e).sort(t.sort).map(function(n){var o=e[n];if(void 0===o)return"";if(null===o)return v(n,t);if(Array.isArray(o)){var i=[];return o.slice().forEach(function(e){void 0!==e&&i.push(r(n,e,i.length))}),i.join("&")}return v(n,t)+"="+v(o,t)}).filter(function(e){return e.length>0}).join("&"):""}(t);return i&&(o+="?"+i),o},o}(e.Pool);return o(p).addProp("identityField",{type:"string",required:!0,defaultValue:"id"}).addProp("connection",{required:!0,defaultValue:function(){return s}}).addProp("responseToData",{type:"function",defaultValue:function(){return i},required:!0}).addProp("prepQuery",{type:"function",defaultValue:function(){return i},required:!1}).addProp("baseURL",{type:"string",defaultValue:"/",required:!0,test:[function(e){return"/"===e||/$http(s)?:\/\/.+/.test(e)},!1,"badly formed URL"]}),p})}(m),function(e){e.constant("REST_ACTIONS","get,put,post,delete,getAll".split(",")),e.factory("axios",function(){return i}),e.factory("mapForId",function(e){var t=e.impulseRecordId;return function(e){var r=e.id,n=e.pool.identityField;return function(o){if(!o)return console.log("!!!!!!!!!!!!!! mapForId -- no signal"),null;var i,s=t(e),a=o;if(r===a.impulse.id)return a;switch(o.vector.name){case"put":case"get":break;case"delete":a=o.mutate({response:null});break;case"post":break;case"getAll":if(!Array.isArray(o.response))return console.log("!!!!! signal not array response"),null;i=o.response.map(function(e){return e&&"object"==typeof e&&e[n]===s}),a=o.mutate({response:i[0]||null})}return a}}}),e.factory("impulseRecordId",function(e){var t=e.UNSET,r=e.isUnset;return function(e){try{var n=t,o=e.pool.identityField;if("post"===e.vector.name){if(r(e.response))return!1;n=e.response[o]}else n=e.pool.impulseParamsToQuery(e.params,e).id;return n}catch(e){return console.log("!!!!!!!!! impulseRecordId -- error:",e),t}}}),e.factory("filterForId",function(e){var t=e.isUnset,r=e.impulseRecordId;return function(e){var n=e.id;return function(o){if(!o)return console.log("!!!!!!!!!!!!!! filterForId -- no signal"),!1;if(o.impulse.id===n)return!0;var i,s=r(e),a=e.pool.identityField,u=!1;switch(o.vector.name){case"put":case"get":case"delete":i=e.pool.impulseParamsToQuery(o.impulse.params,o.impulse),u=!t(s)&&i.id===s;break;case"post":u=!1;break;case"getAll":u=o.response.filter(function(e){return e[a]===s}).length;break;default:u=!1}return u}}}),e.factory("compareResponse",function(e){return function(e,t){return s(e.response,t.response)}}),e.factory("restVectors",function(e){var t=e.mapForId,r=e.filterForId,n=e.compareResponse;return{get:{sender:function(e,t){var r=t.pool,n=Object.assign({},e);return delete n.url,delete n.query,delete n.id,r.connection.get(e.url,n).then(function(e){return r.responseToData(e,t)})},paramsToQuery:function(e,t){var r=t.pool,n=r.impulseParamsToQuery(e,t,!0);return Object.assign({},n,{url:r.url(n.id,n.query)})},makeImpulseStream:function(e){return e.pool.signalStream.pipe(a(r(e)),c(t(e)),p(n))},idempotent:!0},getAll:{sender:function(e,t){var r=t.pool,n=Object.assign({},e);return delete n.url,delete n.query,delete n.id,r.connection.get(e.url,n).then(function(e){return r.responseToData(e,t)})},paramsToQuery:function(e,t){var r=t.pool,n=r.impulseParamsToQuery(e,t,!1);return Object.assign({},n,{url:r.url("",n.query)})},makeImpulseStream:function(e){return e.pool.signalStream.pipe(a(function(t){return"getAll"===t.vector.name&&s(t.impulse.params,e.params)}))},idempotent:!0},put:{sender:function(e,t){var r=t.pool,n=Object.assign({},e),o=f(e,"body",{});return delete n.url,delete n.query,delete n.id,delete n.body,r.connection.put(e.url,o,n).then(function(e){return r.responseToData(e,t)})},paramsToQuery:function(e,t){var r=t.pool,n=r.impulseParamsToQuery(e,t,!0);return Object.assign({},n,{url:r.url(n.id,n.query)})},makeImpulseStream:function(e){return e.pool.signalStream.pipe(a(r(e)),c(t(e)),p(n))},idempotent:!1},post:{sender:function(e,t){var r=t.pool,n=Object.assign({},e),o=f(e,"body",{});return delete n.url,delete n.query,delete n.id,delete n.body,r.connection.post(e.url,o,n).then(function(e){return r.responseToData(e,t)})},paramsToQuery:function(e,t){var r=t.pool,n=r.impulseParamsToQuery(e,t,!0);return Object.assign({},n,{url:r.url("",n.query)})},makeImpulseStream:function(e){return e.pool.signalStream.pipe(a(r(e)),c(t(e)),p(n))},idempotent:!1},delete:{sender:function(e,t){var r=t.pool,n=Object.assign({},e);return delete n.url,delete n.query,delete n.id,delete n.body,r.connection.delete(e.url,n).then(function(e){return r.responseToData(e,t)})},paramsToQuery:function(e,t){var r=t.pool,n=r.impulseParamsToQuery(e,t,!0);return Object.assign({},n,{url:r.url(n.id,n.query)})},idempotent:!1}}}),e.factory("impulseParamsToQuery",function(){return function(e,t){var r={};if(e.length>0){var n=e[0],o=e[1],i=e[2];n&&"object"==typeof n?Object.assign(r,n):(i&&"object"==typeof i&&Object.assign(r,i),null!==o&&o&&(r.body=o),null!==n&&""!==n&&(r.id=n))}return console.log(">>>>> transformed ",query,"to",r,"<<<<<"),r}})}(m),function(e){e.factory("Signal",function(e){var t=e.UNSET,r=e.isUnset;return function(){function e(e,r){void 0===r&&(r={}),this.id=d(),this.response=f(r,"response",null),this.error=f(r,"error",null),this._baseSignal=f(r,"baseSignal",t),this._impulse=e}var n={baseSignal:{configurable:!0},pool:{configurable:!0},impulse:{configurable:!0},vector:{configurable:!0},params:{configurable:!0},query:{configurable:!0}};return e.prototype.toJSON=function(){var e={id:this.id,TYPE:"SIGNAL",pool:this.pool.name,vector:this.vector.name,query:JSON.stringify(this.query),error:f(this,"error",null),response:f(this,"response",null),impulseId:this.impulse.id};return r(this._baseSignal)||(e.baseSignal=this._baseSignal.toJSON()),e},e.prototype.mutate=function(t){return new e(this.impulse,Object.assign({},t,{baseSignal:this}))},n.baseSignal.get=function(){return this._baseSignal},n.pool.get=function(){return this.impulse.pool},n.impulse.get=function(){return this._impulse},n.vector.get=function(){return this.impulse.vector},n.params.get=function(){return this.impulse.params},n.query.get=function(){return this._query||(this._query=this.vector.paramsToQuery(this.impulse)),this._query},Object.defineProperties(e.prototype,n),e}()})}(m),m},_=S().container;export default{Pool:_.Pool,RestPool:_.RestPool,Vector:_.Vector,Impulse:_.Impulse,DataMap:_.DataMap,bottle:S,axios:_.axios};
//# sourceMappingURL=index.mjs.map
