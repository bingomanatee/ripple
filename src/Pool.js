import {Store} from '@wonderlandlabs/looking-glass-engine';
import {Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import lGet from 'lodash.get';
import propper from '@wonderlandlabs/propper';

export default (bottle) => {

    bottle.factory('Pool', function ({Vector, error}) {
        class Pool {
            constructor(name, config = {}) {
                this.name = name;
                this.vectors = lGet(config, '_vectors', new Map());
                this.config = lGet(config, 'config', config);
            }

            addVector(name, config, force = false) {
                if (this.vectors.has(name) && !force) {
                    throw error('Attempt to redefine ' + name, {
                        config,
                        name,
                        pool: this
                    })
                }

                if (config instanceof Vector) {
                    config.pool = this;
                    this.vectors.set(name, config);
                } else if (typeof config === 'function') {
                    this.vectors.set(name, new Vector(name, {pool: this, sender: config}));
                } else {
                    this.vectors.set(name, new Vector(name, {...config, pool: this, ...config}))
                }
                return this;
            }

            impulse(name, ...params) {
                if (!this.vectors.has(name)) {
                    throw error('attempt to use an unregistered vector', {
                        pool: this,
                        name,
                        params
                    })
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
        };

        propper(Pool)
            .addProp('vectors', ({defaultValue: () => new Map}))
            .addProp('name', {type: 'string', required: true})
            .addProp('config', {
                type: 'object', defaultValue: () => {
                    return {};
                },
                onInvalid: (...params) => {
                    throw error('bad pool.config', {
                        field: 'config',
                        object: 'Pool',
                        params
                    })
                }
            });

        return Pool;
    });
}
