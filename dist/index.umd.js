!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("bottlejs"),require("@wonderlandlabs/propper"),require("rxjs"),require("@wonderlandlabs/looking-glass-engine"),require("url-join"),require("axios"),require("rxjs/operators"),require("lodash.get"),require("uuid/v4")):"function"==typeof define&&define.amd?define(["exports","bottlejs","@wonderlandlabs/propper","rxjs","@wonderlandlabs/looking-glass-engine","url-join","axios","rxjs/operators","lodash.get","uuid/v4"],e):e(t.ripple={},t.bottlejs,t.propper,t.rxjs,0,t.urlJoin,t.axios,t.operators,t.lGet,t.uuid)}(this,function(t,e,r,o,n,i,s,a,u,p){e=e&&e.hasOwnProperty("default")?e.default:e,r=r&&r.hasOwnProperty("default")?r.default:r,i=i&&i.hasOwnProperty("default")?i.default:i,s=s&&s.hasOwnProperty("default")?s.default:s,u=u&&u.hasOwnProperty("default")?u.default:u,p=p&&p.hasOwnProperty("default")?p.default:p;var c=function(){var t=new e;return function(t){t.factory("UNSET",function(t){return(0,t.Symbol)("UNSET")}),t.factory("ifUnset",function(t){var e=t.UNSET;return function(t,r){return t===e||void 0===t?r:t}}),t.factory("isUnset",function(t){var e=t.UNSET;return function(t){return t===e}}),t.factory("Symbol",function(t){return function(t){return{name:t}}}),t.factory("error",function(){return function(t,e){var r=new Error(t);return e?Object.assign(r,{info:e}):r}})}(t),function(t){t.factory("Vector",function(t){var e=t.UNSET,o=t.Impulse,n=t.error,i=t.noop,s=t.isUnset,p=function(t,r){void 0===r&&(r={}),this.pool=u(r,"pool"),this.sender=u(r,"sender"),this.config=u(r,"config",r),this.schema=u(r,"schema"),this._impulseFilter=u(r,"impulseFilter",e),this._impulseMap=u(r,"impulseMap",e),this._paramsToQuery=u(r,"paramsToQuery",i),this.idempotent=u(r,"idempotent",!1),this.name=t},c={signalStream:{configurable:!0}};return p.prototype.impulse=function(t){return void 0===t&&(t={}),new o({vector:this,params:t})},p.prototype.paramsToQuery=function(t){return this._paramsToQuery(t.params,t,this)},p.prototype.send=function(t){try{var e=this;return function(r,o){try{var n=Promise.resolve(e.sender(t.query,t)).then(function(e){return t.response=e,Promise.resolve(t)})}catch(t){return o(t)}return n&&n.then?n.then(void 0,o):n}(0,function(e){return t.error=e,Promise.reject(t)})}catch(t){return Promise.reject(t)}},p.prototype.impulseFilter=function(t){var e=t.id;return s(this._impulseFilter)?function(t){return t.impulse.id===e}:this._impulseFilter(t,this)},p.prototype.impulseMap=function(t){return s(this._impulseMap)?i:this._impulseMap(t,this)},c.signalStream.get=function(){var t=this;return this._signalStream||(this._signalStream=this.pool.signalStream.pipe(a.filter(function(e){return e.vector.name===t.name}))),this._signalStream},p.prototype.subscribe=function(){for(var t,e=[],r=arguments.length;r--;)e[r]=arguments[r];return(t=this.signalStream).subscribe.apply(t,e)},Object.defineProperties(p.prototype,c),r(p).addProp("idempotent",{type:"boolean",defaultValue:!1}).addProp("pool",{required:!0,type:"object",onInvalid:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];throw n("bad vector.pool",{field:"config",object:"Pool",params:t})}}).addProp("sender",{required:!0,type:"function",onInvalid:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];throw n("bad vector.sender",{field:"config",object:"Pool",params:t})}}).addProp("schema").addProp("config",{type:"object",onInvalid:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];throw n("bad vector.config",{field:"config",object:"Pool",params:t})}}).addProp("name",{required:!0,type:"string",onInvalid:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];throw n("bad vector.name",{field:"config",object:"Pool",params:t})}}),p})}(t),function(t){t.factory("Pool",function(t){var e=t.Vector,n=t.error,i=function(t,e){void 0===e&&(e={}),this.name=t,this.vectors=u(e,"_vectors",new Map),this.config=u(e,"config",e)},s={signalStream:{configurable:!0}};return i.prototype.addVector=function(t,r,o){if(void 0===o&&(o=!1),this.vectors.has(t)&&!o)throw n("Attempt to redefine "+t,{config:r,name:t,pool:this});return r instanceof e?(r.pool=this,this.vectors.set(t,r)):this.vectors.set(t,new e(t,"function"==typeof r?{pool:this,sender:r}:Object.assign({},r,{pool:this},r))),this},i.prototype.impulse=function(t){for(var e=[],r=arguments.length-1;r-- >0;)e[r]=arguments[r+1];if(!this.vectors.has(t))throw n("attempt to use an unregistered vector",{pool:this,name:t,params:e});return this.vectors.get(t).impulse(e)},s.signalStream.get=function(){return this._signalStream||(this._signalStream=new o.Subject),this._signalStream},i.prototype.subscribe=function(){for(var t,e=[],r=arguments.length;r--;)e[r]=arguments[r];return(t=this.signalStream).subscribe.apply(t,e)},Object.defineProperties(i.prototype,s),r(i).addProp("vectors",{defaultValue:function(){return new Map}}).addProp("name",{type:"string",required:!0}).addProp("config",{type:"object",defaultValue:function(){return{}},onInvalid:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];throw n("bad pool.config",{field:"config",object:"Pool",params:t})}}),i})}(t),function(t){t.constant("noop",function(t){return t});var e=function(t){return{error:t,defaultCatcher:!0}};t.factory("rxCatch",function(t){var r=t.noop;return function(t,n,i){return void 0===n&&(n=r),void 0===i&&(i=e),t.pipe(a.switchMap(function(t){return o.of(t).pipe(a.map(n),a.catchError(function(t){return o.of(i(t))}))}))}})}(t),function(t){t.factory("IMPULSE_STATE_NEW",function(t){return(0,t.Symbol)("IMPULSE_STATE_NEW")}),t.factory("IMPULSE_STATE_QUEUED",function(t){return(0,t.Symbol)("IMPULSE_STATE_QUEUED")}),t.factory("IMPULSE_STATE_SENT",function(t){return(0,t.Symbol)("IMPULSE_STATE_SENT")}),t.factory("IMPULSE_STATE_RESOLVED",function(t){return(0,t.Symbol)("IMPULSE_STATE_RESOLVED")}),t.factory("IMPULSE_STATE_UPDATED",function(t){return(0,t.Symbol)("IMPULSE_STATE_UPDATED")}),t.factory("IMPULSE_STATE_ERROR",function(t){return(0,t.Symbol)("IMPULSE_STATE_ERROR")}),t.factory("IMPULSE_STATE_COMPLETE",function(t){return(0,t.Symbol)("IMPULSE_STATE_COMPLETE")}),t.factory("Impulse",function(t){var e=t.error,o=t.Signal,n=function(t){void 0===t&&(t={}),this.id=p(),this.vector=u(t,"vector"),this.params=u(t,"params",t)},i={pool:{configurable:!0},signalStream:{configurable:!0},_subs:{configurable:!0}};return i.pool.get=function(){return this.vector.pool},n.prototype.send=function(){var t=this;if(this._pending)return this.vector.idempotent?this._pending:this._pending.then(function(){return t.send()}).catch(function(){return t.send()});var e=new o(this);return this._pending=this.vector.send(e).then(function(){return t._pending=!1,t.pool.signalStream.next(e),e}).catch(function(){return t._pending=!1,t.pool.signalStream.error(e),e}),this._pending},i.signalStream.get=function(){return this._signalStream||(this._signalStream=this.vector.signalStream.pipe(a.filter(this.vector.impulseFilter(this),a.map(this.vector.impulseMap(this))))),this._signalStream},n.prototype.subscribe=function(){for(var t,r=[],o=arguments.length;o--;)r[o]=arguments[o];if(this._completed)throw e("cannot subscribe to completed impulse",{impulse:this,params:r});var n=(t=this.signalStream).subscribe.apply(t,r);return this._subs.push(n),n},i._subs.get=function(){return this.__subs||(this.__subs=[]),this.__subs},n.prototype.complete=function(){this._completed=!0,this._signalStream&&this._signalStream.complete(),this.__subs&&this.__subs.forEach(function(t){return t.unsubscribe()}),delete this.__subs},Object.defineProperties(n.prototype,i),r(n).addProp("params",{type:"array",required:!0}).addProp("vector",{required:!0,type:"object",onInvalid:function(t){throw e("bad impulse.config",{field:"vector",object:"Impulse",err:t})}}),n})}(t),function(t){t.factory("Promiser",function(t){return function(){function t(){var t=this;this._resolved=!1,this.promise=new Promise(function(e,r){t._done=e,t._fail=r})}var e={resolved:{configurable:!0}};return e.resolved.get=function(){return this._resolved},t.prototype.resolve=function(t){return this.resolved?this.promise:(this.response=t,this._resolved=!0,this._done(t),this.promise)},t.prototype.reject=function(t){return this.resolved?this.promise:(this._resolved=!0,this.error=t,this._fail(this),this.promise)},t.prototype.then=function(){for(var t,e=[],r=arguments.length;r--;)e[r]=arguments[r];return(t=this.promise).then.apply(t,e)},t.prototype.catch=function(t){return this.promise.catch(t)},Object.defineProperties(t.prototype,e),t}()})}(t),function(t){t.factory("RestPool",function(t){return function(t){function e(){t.apply(this,arguments)}return t&&(e.__proto__=t),(e.prototype=Object.create(t&&t.prototype)).constructor=e,e}(t.Pool)})}(t),function(t){t.factory("DataMap",function(){return function(){function t(t,e){var r=this;this._map=new Map,this.pool=e,(Array.isArray(t)?t:[t]).forEach(function(t){r.set(t[e.idField],t)})}var e={size:{configurable:!0}};return e.size.get=function(){return this._map.size},t.prototype.entries=function(){return this._map.entries()},t.prototype.get=function(t){return this._map.get(t)},t.prototype.set=function(){for(var t,e=[],r=arguments.length;r--;)e[r]=arguments[r];return(t=this._map).set.apply(t,e)},t.prototype.has=function(t){return this._map.has(t)},t.prototype.keys=function(){return this._map.keys()},t.prototype.clear=function(){return this._map.clear()},t.prototype.delete=function(t){return this._map.delete(t)},t.prototype.values=function(){return this._map.values()},t.prototype.forEach=function(t){return this._map.forEach(t)},t.prototype.overlaps=function(e){if(!e instanceof t)return!1;if(e.size<this.size)return e.overlaps(this);for(var r=this.keys(),o=r.next();!o.done;){if(e.has(o.value))return!0;o=r.next()}return!1},t.prototype.sharedKeys=function(e){if(!e instanceof t)return!1;if(e.size<this.size)return e.sharedKeys(this);for(var r=this.keys(),o=[],n=r.next();!n.done;)e.has(n.value)&&o.push(n.value),n=r.next();return o},t.prototype.clone=function(){var e=new t([],this.pool);return e.updateFrom(this,!0),e},t.prototype.updateFrom=function(t,e,r){var o=this;return void 0===e&&(e=!1),void 0===r&&(r=!0),t.pool!==this.pool&&console.log(error("attempt to merge data from wrong pool",{map:this,otherMap:t})),t.forEach(function(t,n){if(o.has(n)){var i=r?Object.assign({},o.get(n),t):t;o.set(n,i)}else e&&o.set(n,t)}),this},Object.defineProperties(t.prototype,e),t}()})}(t),function(t){t.constant("REST_ACTIONS","get,put,post,delete,getAll".split(",")),t.factory("axios",function(){return s}),t.factory("observeSingle",function(t){return t.noop}),t.factory("restChannels",function(t){return t.noop}),t.factory("restDataFromImpulse",function(t){return t.noop})}(t),function(t){t.factory("Signal",function(t){var e=t.UNSET,r=t.isUnset;return function(){function t(t,r){void 0===r&&(r={}),this.id=p(),this.response=u(r,"response",null),this.error=u(r,"error",null),this._baseSignal=u(r,"baseSignal",e),this._impulse=t}var o={baseSignal:{configurable:!0},pool:{configurable:!0},impulse:{configurable:!0},vector:{configurable:!0},params:{configurable:!0},query:{configurable:!0}};return t.prototype.toJSON=function(){var t={id:this.id,pool:this.pool.name,vector:this.vector.name,query:JSON.stringify(this.query),error:u(this,"error",null),response:u(this,"response",null),impulseId:this.impulse.id};return r(this._baseSignal)||(t.baseSignal=this._baseSignal.toJSON()),t},t.prototype.mutate=function(e){return new t(this.impulse,Object.assign({},e,{baseSignal:this}))},o.baseSignal.get=function(){return this._baseSignal},o.pool.get=function(){return this.impulse.pool},o.impulse.get=function(){return this._impulse},o.vector.get=function(){return this.impulse.vector},o.params.get=function(){return this.impulse.params},o.query.get=function(){return this._query||(this._query=this.vector.paramsToQuery(this.impulse)),this._query},Object.defineProperties(t.prototype,o),t}()})}(t),t},l=c().container,f=l.Pool,h=l.RestPool,d=l.Vector,m=l.Impulse,y=l.DataMap,g=l.axios,v={Pool:f,RestPool:h,Vector:d,Impulse:m,DataMap:y,bottle:c,axios:g};t.Pool=f,t.RestPool=h,t.Vector=d,t.Impulse=m,t.bottle=c,t.DataMap=y,t.axios=g,t.default=v});
//# sourceMappingURL=index.umd.js.map
