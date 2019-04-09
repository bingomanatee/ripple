import {Store} from '@wonderlandlabs/looking-glass-engine';
import {Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import lGet from 'lodash.get';

export default (bottle) => {

    bottle.factory('poolRunner', ({PoolRunner}) => {
        return new PoolRunner;
    });

    bottle.factory('PoolRunner', ({}) => {
        /**
         * PoolRunner schedules the flushing of all pools.
         * By default all pools share the same runner;
         * if you need to coordinate the flushing of pools,
         * you can grant a set of pools their own runner.
         *
         * By default the runner will flush as often as possible
         * based on requestAnimationFrame. If you want to manage or throttle
         * the scheduling, you can call setManual() on the runner,
         * and then you are responsible for scheduling the flushing yourself.
         */
        class PoolRunner {

        }

        return PoolRunner;
    });

    bottle.factory('Pool', function ({Vector, poolRunner, error, noop}) {
        return class Pool {
            constructor(config = {}) {
                this.vectors = lGet(config, '_vectors', new Map());
                this.config = lGet(config, 'config', config);
            }

            get vectors() {
                if (!this._vectors) {
                    this._vectors = new Map();
                }
                return this._vectors;
            }

            set vectors(value) {
                this._vectors = value;
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
                } else {
                    this.vectors.set(name, new Vector({pool: this, ...config}))
                }
                return this;
            }

            impulse(name, params) {
                if (!this.vectors.has(name)) {
                    throw error('attempt to use an unregistered vector', {
                        pool: this,
                        name,
                        params
                    })
                }

                this.vectors.get(name).impulse(params);
            }
        };
    });
}
