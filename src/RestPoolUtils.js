import lGet from 'lodash.get';
import axios from 'axios';
import {filter, map} from 'rxjs/operators';

export default (bottle) => {
    bottle.constant('REST_ACTIONS', 'get,put,post,delete,getAll'.split(','));

    bottle.factory('axios', () => axios);

    bottle.factory('observeSingle', ({restDataFromImpulse, isUnset, UNSET, DataMap, noop}) => {
        return noop;
    });

    bottle.factory('restVectors', () => {
        return {
            get: {
                sender(query, impulse) {
                    return this.pool.connection.get(query.url, {headers: query.headers})
                        .then(result => impulse.pool.responseToData(result));
                },
                paramsToQuery(impulse) {
                    const {pool} = impulse;
                    const query = pool.impulseParamsToQuery(impulse, true);
                    return Object.assign({}, query, {
                        url: pool.url(query.id, query.query)
                    });
                },
                idempotent: true,
            },
            getAll: {
                sender(query, impulse) {
                    return this.pool.connection.get(query.url, {headers: query.headers})
                        .then(result => impulse.pool.responseToData(result));
                },
                paramsToQuery(impulse) {
                    const {pool} = impulse;
                    const query = pool.impulseParamsToQuery(impulse, true);
                    return Object.assign({}, query, {
                        url: pool.url('', query.query)
                    });
                },
                idempotent: true,
            },

            put: {
                sender(query, impulse) {
                    return this.pool.connection.put(query.url, query.data, {headers: query.headers})
                        .then(result => impulse.pool.responseToData(result));
                },
                paramsToQuery(impulse) {
                    const {pool} = impulse;
                    const query = pool.impulseParamsToQuery(impulse, true);
                    return Object.assign({}, query, {
                        url: pool.url(query.id, query.query)
                    });
                },
                idempotent: false,
            },

            post: {
                sender(query, impulse) {
                    return this.pool.connection.post(query.url, query.data, {headers: query.headers})
                        .then(result => impulse.pool.responseToData(result));
                },
                paramsToQuery(impulse) {
                    const {pool} = impulse;
                    const query = pool.impulseParamsToQuery(impulse, true);
                    return Object.assign({}, query, {
                        url: pool.url('', query.query)
                    });
                },
                idempotent: false,
            },

            delete: {
                sender(query, impulse) {
                    return this.pool.connection.delete(query.url, {headers: query.headers})
                        .then(result => impulse.pool.responseToData(result));
                },
                paramsToQuery(impulse) {
                    const {pool} = impulse;
                    const query = impulseParamsToQuery(impulse, true);
                    return {
                        ...query,
                        url: pool.url(query.id, query.query)
                    }
                },
                idempotent: false,
            }
        }
    });

    bottle.factory('impulseParamsToQuery', ({UNSET, isUnset}) => {
        return (impulse, isSingle) => {
            const {pool} = impulse;

            let id = UNSET;
            let data = UNSET;
            let headers = UNSET;
            let query = UNSET;

            impulse.params.forEach((param) => {
                if (!isSingle && Array.isArray(param) && isUnset(data)) {
                    data = param;
                } else if (typeof param === 'object') {
                    if (isSingle && isUnset(data)) {
                        data = param;
                        if (pool.identityField in param) {
                            id = lGet(param, pool.identityField);
                        }
                    } else {
                        if ('headers' in param) {
                            headers = param.headers;
                        }
                        if ('query' in param) {
                            query = param.query;
                        }
                    }
                } else if (isSingle && isUnset(id)) {
                    id = param;
                }
            });

            return {
                id, data, headers, query
            };
        }
    });
}
