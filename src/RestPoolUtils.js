import lGet from 'lodash.get';
import axios from 'axios';
import lEqual from 'lodash.isequal';
import { filter, map, distinctUntilChanged } from 'rxjs/operators';

export default (bottle) => {
  bottle.constant('REST_ACTIONS', 'get,put,post,delete,getAll'.split(','));

  bottle.factory('axios', () => axios);

  bottle.factory('mapForId', ({ impulseRecordId }) => {
    return (impulse) => {
      const impulseId = impulse.id;
      const ID = impulse.pool.identityField;

      return (signal) => {
        if (!signal) {
          console.log('!!!!!!!!!!!!!! mapForId -- no signal');
          return null;
        }
        const recordId = impulseRecordId(impulse);
        let responses; let response; let resultSignal = signal;

        if (impulseId === resultSignal.impulse.id) {
          return resultSignal;
        }

        switch (signal.vector.name) {
          case 'put':
            break;

          case 'get':
            break;

          case 'delete':
            resultSignal = signal.mutate({ 'response': null });
            break;

          case 'post':
            break;

          case 'getAll':
            if (!Array.isArray(signal.response)) {
              console.log('!!!!! signal not array response');
              return null;
            }
            responses = signal.response.map((r) => {
              return r && (typeof r === 'object') && r[ ID ] === recordId;
            });
            response = responses[ 0 ] || null;

            resultSignal = signal.mutate({ response });
            break;

          default:
        }

        return resultSignal;
      };
    };
  });

  bottle.factory('impulseRecordId', ({ UNSET, isUnset }) => {
    return function impulseRecordId(impulse) {
      try {
        let recordId = UNSET;
        const ID = impulse.pool.identityField;

        if (impulse.vector.name === 'post') {
          if (isUnset(impulse.response)) {
            return false;
          }
          recordId = impulse.response[ ID ];
        } else {
          const query = impulse.pool.impulseParamsToQuery(impulse.params, impulse);
          // the identity of the source impulse

          recordId = query.id;
        }

        return recordId;
      } catch (err) {
        console.log('!!!!!!!!! impulseRecordId -- error:', err);
        return UNSET;
      }
    };
  });

  bottle.factory('filterForId', ({ isUnset, impulseRecordId }) => {

    return (impulse) => {
      const impulseId = impulse.id;

      return (signal) => {
        if (!signal) {
          console.log('!!!!!!!!!!!!!! filterForId -- no signal');
          return false;
        }
        if (signal.impulse.id === impulseId) {
          return true;
        }

        let targetId = impulseRecordId(impulse);
        let ID = impulse.pool.identityField;

        let show = false;
        let signalQuery;

        switch (signal.vector.name) {
          case 'put':
            signalQuery = impulse.pool.impulseParamsToQuery(signal.impulse.params, signal.impulse, true);
            show = !isUnset(targetId) && (signalQuery.id === targetId);
            break;

          case 'get':
            signalQuery = impulse.pool.impulseParamsToQuery(signal.impulse.params, signal.impulse, true);
            show = !isUnset(targetId) && (signalQuery.id === targetId);
            break;

          case 'delete':
            signalQuery = impulse.pool.impulseParamsToQuery(signal.impulse.params, signal.impulse, true);
            show = !isUnset(targetId) && (signalQuery.id === targetId);
            break;

          case 'post':
            show = false;
            break;

          case 'getAll':
            show = signal.response.filter((r) => r[ ID ] === targetId).length;
            break;

          default:
            show = false;

        }
        return show;
      };
    };
  });

  bottle.factory('compareResponse', ({}) => {
    /**
         * this is a factory that returns a function suitable for use in distinctUntilChanged.
         * note the comparator returns true if the elements are equal
         * and false if they are not -- and false is when the record will be emitted.
         */
    return (s1, s2) => {
      const response1 = s1.response;
      const response2 = s2.response;

      return lEqual(response1, response2);
    };
  });

  bottle.factory('restVectors', ({ mapForId, filterForId, compareResponse }) => {

    return {
      'get': {
        sender(query, impulse) {
          const { pool } = impulse;

          return pool.connection.get(query.url, { 'headers': query.headers })
            .then((result) => pool.responseToData(result, impulse));
        },
        paramsToQuery(params, impulse) {
          const { pool } = impulse;
          const query = pool.impulseParamsToQuery(params, impulse, true);

          return Object.assign({}, query, {
            'url': pool.url(query.id, query.query)
          });
        },
        makeImpulseStream(impulse) {
          return impulse.pool.signalStream
            .pipe(
              filter(filterForId(impulse)),
              map(mapForId(impulse)),
              distinctUntilChanged(compareResponse)
            );
        },
        'idempotent': true
      },
      'getAll': {
        sender(query, impulse) {
          const { pool } = impulse;

          return pool.connection.get(query.url, { 'headers': query.headers })
            .then((result) => pool.responseToData(result, impulse));
        },
        paramsToQuery(params, impulse) {
          const { pool } = impulse;
          //  console.log('----------------paramsToQuery: impulse', impulse.toJSON(), '-------------pool:', pool.toJSON(), '------------ ');
          const query = pool.impulseParamsToQuery(params, impulse, false);

          return Object.assign({}, query, {
            'url': pool.url('', query.query)
          });
        },
        makeImpulseStream(impulse) {
          return impulse.pool.signalStream
            .pipe(
              filter((signal) => {
                return signal.vector.name === 'getAll' && lEqual(signal.impulse.params, impulse.params);
                // @TODO - integrate sub-updates
              })
            );
          // note - NO distinctUntilChanged - too expensive to compare large arrays, always returning.
        },
        'idempotent': true
      },

      'put': {
        sender(query, impulse) {
          const { pool } = impulse;

          return pool.connection.put(query.url, query.data, { 'headers': query.headers })
            .then((result) => pool.responseToData(result, impulse));
        },
        paramsToQuery(params, impulse) {
          const { pool } = impulse;
          const query = pool.impulseParamsToQuery(params, impulse, true);

          return Object.assign({}, query, {
            'url': pool.url(query.id, query.query)
          });
        },
        makeImpulseStream(impulse) {
          return impulse.pool.signalStream
            .pipe(
              filter(filterForId(impulse)),
              map(mapForId(impulse)),
              distinctUntilChanged(compareResponse)
            );
        },

        'idempotent': false
      },

      'post': {
        sender(query, impulse) {
          const { pool } = impulse;

          return pool.connection.post(query.url, query.data, { 'headers': query.headers })
            .then((result) => pool.responseToData(result, impulse));
        },
        paramsToQuery(params, impulse) {
          const { pool } = impulse;
          const query = pool.impulseParamsToQuery(params, impulse, true);

          return Object.assign({}, query, {
            'url': pool.url('', query.query)
          });
        },
        makeImpulseStream(impulse) {
          return impulse.pool.signalStream
            .pipe(
              filter(filterForId(impulse)),
              map(mapForId(impulse)),
              distinctUntilChanged(compareResponse)
            );
        },

        'idempotent': false
      },

      'delete': {
        sender(query, impulse) {
          const { pool } = impulse;

          return pool.connection.delete(query.url, { 'headers': query.headers })
            .then((result) => pool.responseToData(result, impulse));
        },
        paramsToQuery(params, impulse) {
          const { pool } = impulse;
          const query = pool.impulseParamsToQuery(params, impulse, true);

          return Object.assign({}, query,
            { 'url': pool.url(query.id, query.query) });
        },
        // the default impulse stream -- only listens to itself -- is fine.
        'idempotent': false
      }
    };
  });

  bottle.factory('impulseParamsToQuery', ({ UNSET, isUnset }) => {
    return (params, impulse, isSingle) => {
      const { pool } = impulse;

      let id = UNSET;
      let data = UNSET;
      let headers = {};
      let query = {};

      params.forEach((param) => {
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

      const out = {
        'id': (isUnset(id) ? '' : id), 'data': (isUnset(data) ? {} : data), headers, query
      };

      // console.log('impulseParamsToQuery, params:', params, 'single:', isSingle, 'impulse:', impulse.toJSON());
      // console.log('----------------impulseParamsToQuery-result:', out);

      return out;
    };
  });
};
