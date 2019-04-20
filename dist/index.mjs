import t from"bottlejs";import e from"@wonderlandlabs/propper";import{Subject as r,of as o}from"rxjs";import"@wonderlandlabs/looking-glass-engine";import"url-join";import n from"axios";import{filter as i,map as s,catchError as a,switchMap as u}from"rxjs/operators";import p from"lodash.get";import c from"uuid/v4";var f=function(){var f=new t;return function(t){t.factory("UNSET",function(t){return(0,t.Symbol)("UNSET")}),t.factory("ifUnset",function(t){var e=t.UNSET;return function(t,r){return t===e||void 0===t?r:t}}),t.factory("isUnset",function(t){var e=t.UNSET;return function(t){return t===e}}),t.factory("Symbol",function(t){return function(t){return{name:t}}}),t.factory("error",function(){return function(t,e){var r=new Error(t);return e?Object.assign(r,{info:e}):r}})}(f),function(t){t.factory("Vector",function(t){var r=t.UNSET,o=t.Impulse,n=t.error,s=t.noop,a=t.isUnset,u=function(t,e){void 0===e&&(e={}),this.pool=p(e,"pool"),this.sender=p(e,"sender"),this.config=p(e,"config",e),this.schema=p(e,"schema"),this._impulseFilter=p(e,"impulseFilter",r),this._impulseMap=p(e,"impulseMap",r),this._paramsToQuery=p(e,"paramsToQuery",s),this.idempotent=p(e,"idempotent",!1),this.name=t},c={signalStream:{configurable:!0}};return u.prototype.impulse=function(t){return void 0===t&&(t={}),new o({vector:this,params:t})},u.prototype.paramsToQuery=function(t){return this._paramsToQuery(t.params,t,this)},u.prototype.send=function(t){try{var e=this;return function(r,o){try{var n=Promise.resolve(e.sender(t.query,t)).then(function(e){return t.response=e,Promise.resolve(t)})}catch(t){return o(t)}return n&&n.then?n.then(void 0,o):n}(0,function(e){return t.error=e,Promise.reject(t)})}catch(t){return Promise.reject(t)}},u.prototype.impulseFilter=function(t){var e=t.id;return a(this._impulseFilter)?function(t){return t.impulse.id===e}:this._impulseFilter(t,this)},u.prototype.impulseMap=function(t){return a(this._impulseMap)?s:this._impulseMap(t,this)},c.signalStream.get=function(){var t=this;return this._signalStream||(this._signalStream=this.pool.signalStream.pipe(i(function(e){return e.vector.name===t.name}))),this._signalStream},u.prototype.subscribe=function(){for(var t,e=[],r=arguments.length;r--;)e[r]=arguments[r];return(t=this.signalStream).subscribe.apply(t,e)},Object.defineProperties(u.prototype,c),e(u).addProp("idempotent",{type:"boolean",defaultValue:!1}).addProp("pool",{required:!0,type:"object",onInvalid:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];throw n("bad vector.pool",{field:"config",object:"Pool",params:t})}}).addProp("sender",{required:!0,type:"function",onInvalid:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];throw n("bad vector.sender",{field:"config",object:"Pool",params:t})}}).addProp("schema").addProp("config",{type:"object",onInvalid:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];throw n("bad vector.config",{field:"config",object:"Pool",params:t})}}).addProp("name",{required:!0,type:"string",onInvalid:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];throw n("bad vector.name",{field:"config",object:"Pool",params:t})}}),u})}(f),function(t){t.factory("Pool",function(t){var o=t.Vector,n=t.error,i=function(t,e){void 0===e&&(e={}),this.name=t,this.vectors=p(e,"_vectors",new Map),this.config=p(e,"config",e)},s={signalStream:{configurable:!0}};return i.prototype.addVector=function(t,e,r){if(void 0===r&&(r=!1),this.vectors.has(t)&&!r)throw n("Attempt to redefine "+t,{config:e,name:t,pool:this});return e instanceof o?(e.pool=this,this.vectors.set(t,e)):this.vectors.set(t,new o(t,"function"==typeof e?{pool:this,sender:e}:Object.assign({},e,{pool:this},e))),this},i.prototype.impulse=function(t,e){if(!this.vectors.has(t))throw n("attempt to use an unregistered vector",{pool:this,name:t,params:e});return this.vectors.get(t).impulse(e)},s.signalStream.get=function(){return this._signalStream||(this._signalStream=new r),this._signalStream},i.prototype.subscribe=function(){for(var t,e=[],r=arguments.length;r--;)e[r]=arguments[r];return(t=this.signalStream).subscribe.apply(t,e)},Object.defineProperties(i.prototype,s),e(i).addProp("vectors",{defaultValue:function(){return new Map}}).addProp("name",{type:"string",required:!0}).addProp("config",{type:"object",defaultValue:function(){return{}},onInvalid:function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];throw n("bad pool.config",{field:"config",object:"Pool",params:t})}}),i})}(f),function(t){t.constant("noop",function(t){return t});var e=function(t){return{error:t,defaultCatcher:!0}};t.factory("rxCatch",function(t){var r=t.noop;return function(t,n,i){return void 0===n&&(n=r),void 0===i&&(i=e),t.pipe(u(function(t){return o(t).pipe(s(n),a(function(t){return o(i(t))}))}))}})}(f),function(t){t.factory("IMPULSE_STATE_NEW",function(t){return(0,t.Symbol)("IMPULSE_STATE_NEW")}),t.factory("IMPULSE_STATE_QUEUED",function(t){return(0,t.Symbol)("IMPULSE_STATE_QUEUED")}),t.factory("IMPULSE_STATE_SENT",function(t){return(0,t.Symbol)("IMPULSE_STATE_SENT")}),t.factory("IMPULSE_STATE_RESOLVED",function(t){return(0,t.Symbol)("IMPULSE_STATE_RESOLVED")}),t.factory("IMPULSE_STATE_UPDATED",function(t){return(0,t.Symbol)("IMPULSE_STATE_UPDATED")}),t.factory("IMPULSE_STATE_ERROR",function(t){return(0,t.Symbol)("IMPULSE_STATE_ERROR")}),t.factory("IMPULSE_STATE_COMPLETE",function(t){return(0,t.Symbol)("IMPULSE_STATE_COMPLETE")}),t.factory("Impulse",function(t){var r=t.error,o=t.Signal,n=function(t){void 0===t&&(t={}),this.vector=p(t,"vector"),this._params=p(t,"params",t)},a={pool:{configurable:!0},signalStream:{configurable:!0},_subs:{configurable:!0}};return a.pool.get=function(){return this.vector.pool},n.prototype.send=function(){var t=this;if(this._pending)return this.vector.idempotent?this._pending:this._pending.then(function(){return t.send()}).catch(function(){return t.send()});var e=new o(this);return this._pending=this.vector.send(e).then(function(){return t._pending=!1,t.pool.signalStream.next(e),e}).catch(function(){return t._pending=!1,t.pool.signalStream.error(e),e}),this._pending},a.signalStream.get=function(){return this._signalStream||(this._signalStream=this.vector.signalStream.pipe(i(this.vector.impulseFilter(this),s(this.vector.impulseMap(this))))),this._signalStream},n.prototype.subscribe=function(){for(var t,e=[],o=arguments.length;o--;)e[o]=arguments[o];if(this._completed)throw r("cannot subscribe to completed impulse",{impulse:this,params:e});var n=(t=this.signalStream).subscribe.apply(t,e);return this._subs.push(n),n},a._subs.get=function(){return this.__subs||(this.__subs=[]),this.__subs},n.prototype.complete=function(){this._completed=!0,this._signalStream&&this._signalStream.complete(),this.__subs&&this.__subs.forEach(function(t){return t.unsubscribe()}),delete this.__subs},Object.defineProperties(n.prototype,a),e(n).addProp("params",{}).addProp("vector",{required:!0,type:"object",onInvalid:function(t){throw r("bad impulse.config",{field:"vector",object:"Impulse",err:t})}}),n})}(f),function(t){t.factory("Promiser",function(t){return function(){function t(){var t=this;this._resolved=!1,this.promise=new Promise(function(e,r){t._done=e,t._fail=r})}var e={resolved:{configurable:!0}};return e.resolved.get=function(){return this._resolved},t.prototype.resolve=function(t){return this.resolved?this.promise:(this.response=t,this._resolved=!0,this._done(t),this.promise)},t.prototype.reject=function(t){return this.resolved?this.promise:(this._resolved=!0,this.error=t,this._fail(this),this.promise)},t.prototype.then=function(){for(var t,e=[],r=arguments.length;r--;)e[r]=arguments[r];return(t=this.promise).then.apply(t,e)},t.prototype.catch=function(t){return this.promise.catch(t)},Object.defineProperties(t.prototype,e),t}()})}(f),function(t){t.factory("RestPool",function(t){return function(t){function e(){t.apply(this,arguments)}return t&&(e.__proto__=t),(e.prototype=Object.create(t&&t.prototype)).constructor=e,e}(t.Pool)})}(f),function(t){t.factory("DataMap",function(){return function(){function t(t,e){var r=this;this._map=new Map,this.pool=e,(Array.isArray(t)?t:[t]).forEach(function(t){r.set(t[e.idField],t)})}var e={size:{configurable:!0}};return e.size.get=function(){return this._map.size},t.prototype.entries=function(){return this._map.entries()},t.prototype.get=function(t){return this._map.get(t)},t.prototype.set=function(){for(var t,e=[],r=arguments.length;r--;)e[r]=arguments[r];return(t=this._map).set.apply(t,e)},t.prototype.has=function(t){return this._map.has(t)},t.prototype.keys=function(){return this._map.keys()},t.prototype.clear=function(){return this._map.clear()},t.prototype.delete=function(t){return this._map.delete(t)},t.prototype.values=function(){return this._map.values()},t.prototype.forEach=function(t){return this._map.forEach(t)},t.prototype.overlaps=function(e){if(!e instanceof t)return!1;if(e.size<this.size)return e.overlaps(this);for(var r=this.keys(),o=r.next();!o.done;){if(e.has(o.value))return!0;o=r.next()}return!1},t.prototype.sharedKeys=function(e){if(!e instanceof t)return!1;if(e.size<this.size)return e.sharedKeys(this);for(var r=this.keys(),o=[],n=r.next();!n.done;)e.has(n.value)&&o.push(n.value),n=r.next();return o},t.prototype.clone=function(){var e=new t([],this.pool);return e.updateFrom(this,!0),e},t.prototype.updateFrom=function(t,e,r){var o=this;return void 0===e&&(e=!1),void 0===r&&(r=!0),t.pool!==this.pool&&console.log(error("attempt to merge data from wrong pool",{map:this,otherMap:t})),t.forEach(function(t,n){if(o.has(n)){var i=r?Object.assign({},o.get(n),t):t;o.set(n,i)}else e&&o.set(n,t)}),this},Object.defineProperties(t.prototype,e),t}()})}(f),function(t){t.constant("REST_ACTIONS","get,put,post,delete,getAll".split(",")),t.factory("axios",function(){return n}),t.factory("observeSingle",function(t){return t.noop}),t.factory("restChannels",function(t){return t.noop}),t.factory("restDataFromImpulse",function(t){return t.noop})}(f),function(t){t.factory("Signal",function(t){var e=t.UNSET,r=t.isUnset;return function(){function t(t,r){void 0===r&&(r={}),this.id=c(),this.response=p(r,"response",null),this.error=p(r,"error",null),this._baseSignal=p(r,"baseSignal",e),this._impulse=t}var o={baseSignal:{configurable:!0},pool:{configurable:!0},impulse:{configurable:!0},vector:{configurable:!0},params:{configurable:!0},query:{configurable:!0}};return t.prototype.toJSON=function(){var t={id:this.id,pool:this.pool.name,vector:this.vector.name,query:JSON.stringify(this.query),error:p(this,"error",null),response:p(this,"response",null)};return r(this._baseSignal)||(t.baseSignal=this._baseSignal.toJSON()),t},t.prototype.mutate=function(e){return new t(this.impulse,Object.assign({},e,{baseSignal:this}))},o.baseSignal.get=function(){return this._baseSignal},o.pool.get=function(){return this.impulse.pool},o.impulse.get=function(){return this._impulse},o.vector.get=function(){return this.impulse.vector},o.params.get=function(){return this.impulse.params},o.query.get=function(){return this._query||(this._query=this.vector.paramsToQuery(this.impulse)),this._query},Object.defineProperties(t.prototype,o),t}()})}(f),f},l=f().container,h=l.Pool,m=l.RestPool,d=l.Vector,g=l.Impulse,y=l.DataMap,v=l.axios;export default{Pool:h,RestPool:m,Vector:d,Impulse:g,DataMap:y,bottle:f,axios:v};export{h as Pool,m as RestPool,d as Vector,g as Impulse,f as bottle,y as DataMap,v as axios};
//# sourceMappingURL=index.mjs.map
