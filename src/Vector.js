import propper from '@wonderlandlabs/propper';
import lGet from 'lodash.get';
import { filter } from 'rxjs/operators';

export default (bottle) => {

  bottle.factory('Vector', ({ UNSET, Impulse, error, noop, isUnset }) => {
    /**
         * A channel is a named operation
         */
    class Vector {
      constructor(name, sender, pool, config = {}) {
        this.sender = sender;
        this.pool = pool;
        this.config = lGet(config, 'config', config);
        this.schema = lGet(config, 'schema');
        this._makeImpulseStream = lGet(config, 'makeImpulseStream', UNSET);
        this._paramsToQuery = lGet(config, 'paramsToQuery', noop);
        this.idempotent = lGet(config, 'idempotent', false);
        this.name = name;
      }

      impulse(params = {}) {
        return new Impulse({
          'vector': this,
          params
        });
      }

      paramsToQuery(impulse) {
        return this._paramsToQuery(impulse.params, impulse, this);
      }

      async send(signal) {
        try {
          signal.response = await this.sender(signal.query, signal);
          if (!(isUnset(signal.impulse.response))) {
            signal.impulse.response = signal.response;
          }
          return Promise.resolve(signal);
        } catch (err) {
          signal.error = err;
          return Promise.reject(signal);
        }
      }

      makeImpulseStream(impulse) {
        if (!isUnset(this._makeImpulseStream)) {
          return this._makeImpulseStream(impulse, this);
        }
        const pool = impulse.pool;

        return pool.signalStream.pipe(filter((signal) => signal.impulse.id === impulse.id));
      }

      get signalStream() {
        if (!this._signalStream) {
          this._signalStream = this.pool.signalStream
            .pipe(filter((signal) => signal.vector.name === this.name));
        }
        return this._signalStream;
      }

      subscribe(...params) {
        return this.signalStream.subscribe(...params);
      }
    }

    propper(Vector)
      .addProp('idempotent', {
        'type': 'boolean',
        'defaultValue': false
      })
      .addProp('pool', {
        'required': true, 'type': 'object',
        'onInvalid': (...params) => {
          throw error('bad vector.pool', {
            'field': 'config',
            'object': 'Pool',
            params
          });
        }
      })
      .addProp('sender', {
        'required': true, 'type': 'function',
        'onInvalid': (...params) => {
          throw error('bad vector.sender', {
            'field': 'config',
            'object': 'Pool',
            params
          });
        }
      })
      .addProp('schema')
      .addProp('config', {
        'type': 'object',
        'onInvalid': (...params) => {
          throw error('bad vector.config', {
            'field': 'config',
            'object': 'Pool',
            params
          });
        }
      })
      .addProp('name', {
        'required': true, 'type': 'string',
        'onInvalid': (...params) => {
          throw error('bad vector.name', {
            'field': 'config',
            'object': 'Pool',
            params
          });
        }
      });

    return Vector;
  });
};
