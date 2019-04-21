function e(e){return e&&"object"==typeof e&&"default"in e?e.default:e}var t=e(require("bottlejs")),r=require("rxjs");require("@wonderlandlabs/looking-glass-engine");var n=e(require("url-join")),o=e(require("@wonderlandlabs/propper")),i=e(require("axios")),s=require("rxjs/operators"),a=e(require("lodash.get")),u=e(require("uuid/v4")),c=function(e){return encodeURIComponent(e).replace(/[!'()*]/g,function(e){return"%"+e.charCodeAt(0).toString(16).toUpperCase()})},p=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,f=Object.prototype.propertyIsEnumerable,d=function(){try{if(!Object.assign)return!1;var e=new String("abc");if(e[5]="de","5"===Object.getOwnPropertyNames(e)[0])return!1;for(var t={},r=0;r<10;r++)t["_"+String.fromCharCode(r)]=r;if("0123456789"!==Object.getOwnPropertyNames(t).map(function(e){return t[e]}).join(""))return!1;var n={};return"abcdefghijklmnopqrst".split("").forEach(function(e){n[e]=e}),"abcdefghijklmnopqrst"===Object.keys(Object.assign({},n)).join("")}catch(e){return!1}}()?Object.assign:function(e,t){for(var r,n,o=function(e){if(null==e)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(e)}(e),i=1;i<arguments.length;i++){for(var s in r=Object(arguments[i]))l.call(r,s)&&(o[s]=r[s]);if(p){n=p(r);for(var a=0;a<n.length;a++)f.call(r,n[a])&&(o[n[a]]=r[n[a]])}}return o};function h(e,t){return t.encode?t.strict?c(e):encodeURIComponent(e):e}new RegExp("%[a-f0-9]{2}","gi"),new RegExp("(%[a-f0-9]{2})+","gi");var m=function(){var e=new t;return function(e){e.factory("UNSET",function(e){return(0,e.Symbol)("UNSET")}),e.factory("ifUnset",function(e){var t=e.UNSET;return function(e,r){return e===t||void 0===e?r:e}}),e.factory("isUnset",function(e){var t=e.UNSET;return function(e){return e===t}}),e.factory("Symbol",function(e){return function(e){return{name:e}}}),e.factory("error",function(){return function(e,t){var r=new Error(e);return t?Object.assign(r,{info:t}):r}})}(e),function(e){e.factory("Vector",function(e){var t=e.UNSET,r=e.Impulse,n=e.error,i=e.noop,u=e.isUnset,c=function(e,r){void 0===r&&(r={}),this.TYPE="VECTOR",this.pool=a(r,"pool"),this.sender=a(r,"sender"),this.config=a(r,"config",r),this.schema=a(r,"schema"),this._makeImpulseStream=a(r,"makeImpulseStream",t),this._paramsToQuery=a(r,"paramsToQuery",i),this.idempotent=a(r,"idempotent",!1),this.name=e},p={signalStream:{configurable:!0}};return c.prototype.impulse=function(e){return void 0===e&&(e={}),new r({vector:this,params:e})},c.prototype.paramsToQuery=function(e){return this._paramsToQuery(e.params,e,this)},c.prototype.send=function(e){try{var t=this;return function(r,n){try{var o=Promise.resolve(t.sender(e.query,e)).then(function(t){return e.response=t,u(e.impulse.response)||(e.impulse.response=e.response),Promise.resolve(e)})}catch(e){return n(e)}return o&&o.then?o.then(void 0,n):o}(0,function(t){return e.error=t,Promise.reject(e)})}catch(e){return Promise.reject(e)}},c.prototype.makeImpulseStream=function(e){return u(this._makeImpulseStream)?e.pool.signalStream.pipe(s.filter(function(t){return t.impulse.id===e.id})):this._makeImpulseStream(e,this)},p.signalStream.get=function(){var e=this;return this._signalStream||(this._signalStream=this.pool.signalStream.pipe(s.filter(function(t){return t.vector.name===e.name}))),this._signalStream},c.prototype.subscribe=function(){for(var e,t=[],r=arguments.length;r--;)t[r]=arguments[r];return(e=this.signalStream).subscribe.apply(e,t)},Object.defineProperties(c.prototype,p),o(c).addProp("idempotent",{type:"boolean",defaultValue:!1}).addProp("pool",{required:!0,type:"object",onInvalid:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];throw n("bad vector.pool",{field:"config",object:"Pool",params:e})}}).addProp("sender",{required:!0,type:"function",onInvalid:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];throw n("bad vector.sender",{field:"config",object:"Pool",params:e})}}).addProp("schema").addProp("config",{type:"object",onInvalid:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];throw n("bad vector.config",{field:"config",object:"Pool",params:e})}}).addProp("name",{required:!0,type:"string",onInvalid:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];throw n("bad vector.name",{field:"config",object:"Pool",params:e})}}),c})}(e),function(e){e.factory("Pool",function(e){var t=e.Vector,n=e.error,i=function(e,t){void 0===t&&(t={}),this.name=e,this.vectors=a(t,"_vectors",new Map),this.config=a(t,"config",t)},s={signalStream:{configurable:!0}};return i.prototype.addVector=function(e,r,o){if(void 0===o&&(o=!1),this.vectors.has(e)&&!o)throw n("Attempt to redefine "+e,{config:r,name:e,pool:this});return r instanceof t?(r.pool=this,this.vectors.set(e,r)):this.vectors.set(e,new t(e,"function"==typeof r?{pool:this,sender:r}:Object.assign({},r,{pool:this},r))),this},i.prototype.impulse=function(e){for(var t=[],r=arguments.length-1;r-- >0;)t[r]=arguments[r+1];if(!this.vectors.has(e))throw n("attempt to use an unregistered vector",{pool:this,name:e,params:t});return this.vectors.get(e).impulse(t)},s.signalStream.get=function(){return this._signalStream||(this._signalStream=new r.Subject),this._signalStream},i.prototype.subscribe=function(){for(var e,t=[],r=arguments.length;r--;)t[r]=arguments[r];return(e=this.signalStream).subscribe.apply(e,t)},i.prototype.toJSON=function(){return{name:this.name,TYPE:"POOL",vectors:Array.from(this.vectors.keys())}},Object.defineProperties(i.prototype,s),o(i).addProp("vectors",{defaultValue:function(){return new Map}}).addProp("name",{type:"string",required:!0}).addProp("config",{type:"object",defaultValue:function(){return{}},onInvalid:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];throw n("bad pool.config",{field:"config",object:"Pool",params:e})}}),i})}(e),function(e){e.constant("noop",function(e){return e});var t=function(e){return{error:e,defaultCatcher:!0}};e.factory("rxCatch",function(e){var n=e.noop;return function(e,o,i){return void 0===o&&(o=n),void 0===i&&(i=t),e.pipe(s.switchMap(function(e){return r.of(e).pipe(s.map(o),s.catchError(function(e){return r.of(i(e))}))}))}})}(e),function(e){e.factory("IMPULSE_STATE_NEW",function(e){return(0,e.Symbol)("IMPULSE_STATE_NEW")}),e.factory("IMPULSE_STATE_QUEUED",function(e){return(0,e.Symbol)("IMPULSE_STATE_QUEUED")}),e.factory("IMPULSE_STATE_SENT",function(e){return(0,e.Symbol)("IMPULSE_STATE_SENT")}),e.factory("IMPULSE_STATE_RESOLVED",function(e){return(0,e.Symbol)("IMPULSE_STATE_RESOLVED")}),e.factory("IMPULSE_STATE_UPDATED",function(e){return(0,e.Symbol)("IMPULSE_STATE_UPDATED")}),e.factory("IMPULSE_STATE_ERROR",function(e){return(0,e.Symbol)("IMPULSE_STATE_ERROR")}),e.factory("IMPULSE_STATE_COMPLETE",function(e){return(0,e.Symbol)("IMPULSE_STATE_COMPLETE")}),e.factory("Impulse",function(e){var t=e.UNSET,r=e.error,n=e.Signal,i=e.isUnset,s=function(e){void 0===e&&(e={}),this.id=u(),this.vector=a(e,"vector"),this.params=a(e,"params",e)},c={pool:{configurable:!0},signalStream:{configurable:!0},_subs:{configurable:!0}};return c.pool.get=function(){return this.vector.pool},s.prototype.toJSON=function(){return{id:this.id,TYPE:"Impulse",vector:this.vector.name,params:this.params,sent:this.sent,response:this.response}},s.prototype.send=function(){var e=this;if(this._pending)return this.vector.idempotent?this._pending:this._pending.then(function(){return e.send()}).catch(function(){return e.send()});var t=new n(this);return this._pending=this.vector.send(t).then(function(t){return e._pending=!1,i(e.response)&&(e.response=t.response),e.pool.signalStream.next(t),t}).catch(function(){return e._pending=!1,e.pool.signalStream.error(t),t}),this.sent=!0,this._pending},c.signalStream.get=function(){return this._signalStream||(this._signalStream=this.vector.makeImpulseStream(this)),this._signalStream},s.prototype.subscribe=function(){for(var e,t=[],n=arguments.length;n--;)t[n]=arguments[n];if(this._completed)throw r("cannot subscribe to completed impulse",{impulse:this,params:t});var o=(e=this.signalStream).subscribe.apply(e,t);return this._subs.push(o),o},c._subs.get=function(){return this.__subs||(this.__subs=[]),this.__subs},s.prototype.complete=function(){this._completed=!0,this._signalStream&&this._signalStream.complete(),this.__subs&&this.__subs.forEach(function(e){return e.unsubscribe()}),delete this.__subs},s.prototype.paramsToID=function(){if(/(get|post|delete)/.test(this.vector.name)){var e=this.pool.impulseParamsToQuery(this);i(e.id||""===e.id)||(this.identity=e.id)}},s.prototype.signalToID=function(e){e.impulse.id===this.id&&e.response&&"object"==typeof e.response&&(this.identity=e.response[this.pool.identityField])},Object.defineProperties(s.prototype,c),o(s).addProp("params",{type:"array",required:!0}).addProp("response",{defaultValue:function(){return t}}).addProp("sent",{type:"boolean",defaultValue:!1}).addProp("vector",{required:!0,type:"object",onInvalid:function(e){throw r("bad impulse.config",{field:"vector",object:"Impulse",err:e})}}),s})}(e),function(e){e.factory("Promiser",function(e){return function(){function e(){var e=this;this._resolved=!1,this.promise=new Promise(function(t,r){e._done=t,e._fail=r})}var t={resolved:{configurable:!0}};return t.resolved.get=function(){return this._resolved},e.prototype.resolve=function(e){return this.resolved?this.promise:(this.response=e,this._resolved=!0,this._done(e),this.promise)},e.prototype.reject=function(e){return this.resolved?this.promise:(this._resolved=!0,this.error=e,this._fail(this),this.promise)},e.prototype.then=function(){for(var e,t=[],r=arguments.length;r--;)t[r]=arguments[r];return(e=this.promise).then.apply(e,t)},e.prototype.catch=function(e){return this.promise.catch(e)},Object.defineProperties(e.prototype,t),e}()})}(e),function(e){e.factory("RestPool",function(e){var t=e.error,r=e.isUnset,i=e.noop,s=e.axios,u=e.UNSET,c=e.REST_ACTIONS,p=e.restVectors,l=e.impulseParamsToQuery,f=function(e){function o(n,o){var f=this;e.call(this,n,o),this.baseURL=a(o,"baseURL","/"),this.prepQuery=a(o,"prepQuery",null),this.identityField=a(o,"identityField","id"),this.responseToData=a(o,"responseToData",i),this.dataToClass=a(o,"dataToClass",i),this.connection=a(o,"connection",s),this.impulseParamsToQuery=a(o,"impulseParamsToQuery",l);var d=a(o,"restActions",u);r(d)?c.forEach(function(e){f.addVector(e,p[e])}):d.forEach(function(e){if("string"==typeof e)f.addVector(e,p[e]);else{if(!Array.isArray(e))throw t("strange action for pool "+n,{action:e});f.addVector(e[0],e[1])}})}return e&&(o.__proto__=e),(o.prototype=Object.create(e&&e.prototype)).constructor=o,o.prototype.toJSON=function(){return{name:this.name,TYPE:"RestPool",baseURL:this.baseURL,vectors:Array.from(this.vectors.keys())}},o.prototype.url=function(e,t){var o=""===e||r(e)?this.baseURL:n(this.baseURL,e),i=function(e,t){!1===(t=d({encode:!0,strict:!0,arrayFormat:"none"},t)).sort&&(t.sort=function(){});var r=function(e){switch(e.arrayFormat){case"index":return function(t,r,n){return null===r?[h(t,e),"[",n,"]"].join(""):[h(t,e),"[",h(n,e),"]=",h(r,e)].join("")};case"bracket":return function(t,r){return null===r?h(t,e):[h(t,e),"[]=",h(r,e)].join("")};default:return function(t,r){return null===r?h(t,e):[h(t,e),"=",h(r,e)].join("")}}}(t);return e?Object.keys(e).sort(t.sort).map(function(n){var o=e[n];if(void 0===o)return"";if(null===o)return h(n,t);if(Array.isArray(o)){var i=[];return o.slice().forEach(function(e){void 0!==e&&i.push(r(n,e,i.length))}),i.join("&")}return h(n,t)+"="+h(o,t)}).filter(function(e){return e.length>0}).join("&"):""}(t);return i&&(o+="?"+i),o},o}(e.Pool);return o(f).addProp("identityField",{type:"string",required:!0,defaultValue:"id"}).addProp("connection",{required:!0,defaultValue:function(){return s}}).addProp("responseToData",{type:"function",defaultValue:function(){return i},required:!0}).addProp("prepQuery",{type:"function",defaultValue:function(){return i},required:!1}).addProp("dataToClass",{type:"function",defaultValue:function(){return i}}).addProp("baseURL",{type:"string",defaultValue:"/",required:!0,test:[function(e){return"/"===e||/$http(s)?:\/\/.+/.test(e)},!1,"badly formed URL"]}),f})}(e),function(e){e.factory("DataMap",function(){return function(){function e(e,t){var r=this;this._map=new Map,this.pool=t,(Array.isArray(e)?e:[e]).forEach(function(e){r.set(e[t.idField],e)})}var t={size:{configurable:!0}};return t.size.get=function(){return this._map.size},e.prototype.entries=function(){return this._map.entries()},e.prototype.get=function(e){return this._map.get(e)},e.prototype.set=function(){for(var e,t=[],r=arguments.length;r--;)t[r]=arguments[r];return(e=this._map).set.apply(e,t)},e.prototype.has=function(e){return this._map.has(e)},e.prototype.keys=function(){return this._map.keys()},e.prototype.clear=function(){return this._map.clear()},e.prototype.delete=function(e){return this._map.delete(e)},e.prototype.values=function(){return this._map.values()},e.prototype.forEach=function(e){return this._map.forEach(e)},e.prototype.overlaps=function(t){if(!t instanceof e)return!1;if(t.size<this.size)return t.overlaps(this);for(var r=this.keys(),n=r.next();!n.done;){if(t.has(n.value))return!0;n=r.next()}return!1},e.prototype.sharedKeys=function(t){if(!t instanceof e)return!1;if(t.size<this.size)return t.sharedKeys(this);for(var r=this.keys(),n=[],o=r.next();!o.done;)t.has(o.value)&&n.push(o.value),o=r.next();return n},e.prototype.clone=function(){var t=new e([],this.pool);return t.updateFrom(this,!0),t},e.prototype.updateFrom=function(e,t,r){var n=this;return void 0===t&&(t=!1),void 0===r&&(r=!0),e.pool!==this.pool&&console.log(error("attempt to merge data from wrong pool",{map:this,otherMap:e})),e.forEach(function(e,o){if(n.has(o)){var i=r?Object.assign({},n.get(o),e):e;n.set(o,i)}else t&&n.set(o,e)}),this},Object.defineProperties(e.prototype,t),e}()})}(e),function(e){e.constant("REST_ACTIONS","get,put,post,delete,getAll".split(",")),e.factory("axios",function(){return i}),e.factory("mapForId",function(e){var t=e.impulseRecordId;return function(e){var r=e.id,n=e.pool.identityField;return function(o){if(!o)return console.log("!!!!!!!!!!!!!! mapForId -- no signal"),null;var i=t(e),s=o;if(r===s.impulse.id)return s;switch(o.vector.name){case"put":case"get":break;case"delete":s=o.mutate({response:null});break;case"post":break;case"getAll":if(!Array.isArray(o.response))return console.log("!!!!! signal not array response"),null;var a=o.response.map(function(e){return e&&"object"==typeof e&&e[n]===i});s=o.mutate({response:a[0]||null})}return s}}}),e.factory("impulseRecordId",function(e){var t=e.UNSET,r=e.isUnset;return function(e){try{var n=t,o=e.pool.identityField;if("post"===e.vector.name){if(r(e.response))return!1;n=e.response[o]}else n=e.pool.impulseParamsToQuery(e.params,e).id;return n}catch(e){return console.log("!!!!!!!!! impulseRecordId -- error:",e),t}}}),e.factory("filterForId",function(e){var t=e.isUnset,r=e.impulseRecordId;return function(e){var n=e.id;return function(o){if(!o)return console.log("!!!!!!!!!!!!!! filterForId -- no signal"),!1;if(o.impulse.id===n)return!0;var i,s=r(e),a=!1;switch(o.vector.name){case"put":case"get":case"delete":i=e.pool.impulseParamsToQuery(o.impulse.params,o.impulse,!0),a=!t(s)&&i.id===s;break;case"post":a=!1;break;case"getAll":a=!0;break;default:a=!1}return a}}}),e.factory("restVectors",function(e){var t=e.mapForId,r=e.filterForId;return{get:{sender:function(e,t){var r=t.pool;return r.connection.get(e.url,{headers:e.headers}).then(function(e){return r.responseToData(e,t)})},paramsToQuery:function(e,t){var r=t.pool,n=r.impulseParamsToQuery(e,t,!0);return Object.assign({},n,{url:r.url(n.id,n.query)})},makeImpulseStream:function(e){return e.pool.signalStream.pipe(s.filter(r(e)),s.map(t(e)))},idempotent:!0},getAll:{sender:function(e,t){var r=t.pool;return r.connection.get(e.url,{headers:e.headers}).then(function(e){return r.responseToData(e,t)})},paramsToQuery:function(e,t){var r=t.pool,n=r.impulseParamsToQuery(e,t,!0);return Object.assign({},n,{url:r.url("",n.query)})},makeImpulseStream:function(e){return e.pool.signalStream.pipe(s.filter(function(e){return"getAll"===e.vector.name}))},idempotent:!0},put:{sender:function(e,t){var r=t.pool;return r.connection.put(e.url,e.data,{headers:e.headers}).then(function(e){return r.responseToData(e,t)})},paramsToQuery:function(e,t){var r=t.pool,n=r.impulseParamsToQuery(e,t,!0);return Object.assign({},n,{url:r.url(n.id,n.query)})},makeImpulseStream:function(e){return e.pool.signalStream.pipe(s.filter(r(e)),s.map(t(e)))},idempotent:!1},post:{sender:function(e,t){var r=t.pool;return r.connection.post(e.url,e.data,{headers:e.headers}).then(function(e){return r.responseToData(e,t)})},paramsToQuery:function(e,t){var r=t.pool,n=r.impulseParamsToQuery(e,t,!0);return Object.assign({},n,{url:r.url("",n.query)})},makeImpulseStream:function(e){return e.pool.signalStream.pipe(s.filter(r(e)),s.map(t(e)))},idempotent:!1},delete:{sender:function(e,t){var r=t.pool;return r.connection.delete(e.url,{headers:e.headers}).then(function(e){return r.responseToData(e,t)})},paramsToQuery:function(e,t){var r=t.pool,n=r.impulseParamsToQuery(e,t,!0);return Object.assign({},n,{url:r.url(n.id,n.query)})},idempotent:!1}}}),e.factory("impulseParamsToQuery",function(e){var t=e.UNSET,r=e.isUnset;return function(e,n,o){var i=n.pool,s=t,u=t,c={},p={};return e.forEach(function(e){!o&&Array.isArray(e)&&r(u)?u=e:"object"==typeof e?o&&r(u)?(u=e,i.identityField in e&&(s=a(e,i.identityField))):("headers"in e&&(c=e.headers),"query"in e&&(p=e.query)):o&&r(s)&&(s=e)}),{id:r(s)?"":s,data:r(u)?{}:u,headers:c,query:p}}})}(e),function(e){e.factory("Signal",function(e){var t=e.UNSET,r=e.isUnset;return function(){function e(e,r){void 0===r&&(r={}),this.id=u(),this.response=a(r,"response",null),this.error=a(r,"error",null),this._baseSignal=a(r,"baseSignal",t),this._impulse=e}var n={baseSignal:{configurable:!0},pool:{configurable:!0},impulse:{configurable:!0},vector:{configurable:!0},params:{configurable:!0},query:{configurable:!0}};return e.prototype.toJSON=function(){var e={id:this.id,TYPE:"SIGNAL",pool:this.pool.name,vector:this.vector.name,query:JSON.stringify(this.query),error:a(this,"error",null),response:a(this,"response",null),impulseId:this.impulse.id};return r(this._baseSignal)||(e.baseSignal=this._baseSignal.toJSON()),e},e.prototype.mutate=function(t){return new e(this.impulse,Object.assign({},t,{baseSignal:this}))},n.baseSignal.get=function(){return this._baseSignal},n.pool.get=function(){return this.impulse.pool},n.impulse.get=function(){return this._impulse},n.vector.get=function(){return this.impulse.vector},n.params.get=function(){return this.impulse.params},n.query.get=function(){return this._query||(this._query=this.vector.paramsToQuery(this.impulse)),this._query},Object.defineProperties(e.prototype,n),e}()})}(e),e},y=m().container;module.exports={Pool:y.Pool,RestPool:y.RestPool,Vector:y.Vector,Impulse:y.Impulse,DataMap:y.DataMap,bottle:m,axios:y.axios};
//# sourceMappingURL=index.js.map
