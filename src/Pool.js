import { Subject } from 'rxjs';
import lGet from 'lodash.get';
import propper from '@wonderlandlabs/propper';

export default (bottle) => {

  bottle.factory('Pool', ({ Vector, error }) => {
    class Pool {
      constructor(name, config = {}) {
        this.name = name;
        this.vectors = lGet(config, '_vectors', new Map());
        this.vectors.forEach((v) => {
          v.pool = this;
        });
        this.config = lGet(config, 'config', config);
      }

      addVector(name, sender, config, force = false) {
        if (this.vectors.has(name) && !force) {
          throw error(`Attempt to redefine ${name}`, {
            config,
            name,
            'pool': this
          });
        }

        if (sender instanceof Vector) {
          sender.pool = this;
          this.vectors.set(name, sender);
        } else {
          this.vectors.set(name, new Vector(name, sender, this, config));
        }
        return this;
      }

      impulse(name, ...params) {
        if (!this.vectors.has(name)) {
          throw error('attempt to use an unregistered vector', {
            'pool': this,
            name,
            params
          });
        }

        return this.vectors.get(name).impulse(params);
      }

      get signalStream() {
        if (!this._signalStream) {
          this._signalStream = new Subject();
        }
        return this._signalStream;
      }

      subscribe(...params) {
        return this.signalStream.subscribe(...params);
      }

      toJSON() {
        return {
          'name': this.name,
          'TYPE': 'POOL',
          'vectors': Array.from(this.vectors.keys())
        };
      }
    }

    propper(Pool)
      .addProp('vectors', ({ 'defaultValue': () => new Map() }))
      .addProp('name', { 'type': 'string', 'required': true })
      .addProp('config', {
        'type': 'object', 'defaultValue': () => {
          return {};
        },
        'onInvalid': (...params) => {
          throw error('bad pool.config', {
            'field': 'config',
            'object': 'Pool',
            params
          });
        }
      });

    return Pool;
  });
};
