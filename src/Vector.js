import propper from '@wonderlandlabs/propper';
import lGet from 'lodash.get';
import {filter, map, startWith} from 'rxjs/operators';
import uuid from 'uuid/v4';

export default (bottle) => {

    bottle.factory('Vector', ({UNSET, Update, Impulse, error, noop, isUnset}) => {
        /**
         * A channel is a named operation
         */
        class Vector {
            constructor(name, config = {}) {
                this.pool = lGet(config, 'pool');
                this.sender = lGet(config, 'sender');
                this.config = lGet(config, 'config', config);
                this.schema = lGet(config, 'schema');
                this._impulseFilter = lGet(config, 'impulseFilter', UNSET);
                this._impulseMap = lGet(config, 'impulseMap', UNSET);
                this._paramsToQuery = lGet(config, 'paramsToQuery', noop);
                this.idempotent = lGet(config, 'idempotent', false)
                this.name = name;
            }

            impulse(params = {}) {
                return new Impulse({
                    vector: this,
                    params
                })
            }

            paramsToQuery(impulse) {
                return this._paramsToQuery(impulse.params, impulse, this);
            }

            async send(signal) {
                try {
                    signal.response = await this.sender(signal.query, signal);
                    return Promise.resolve(signal);
                } catch (error) {
                    signal.error = error;
                    return Promise.reject(signal);
                }
            }

            impulseFilter(impulse) {
                const id = impulse.id;
                return isUnset(this._impulseFilter) ? (signal => signal.impulse.id === id)
                    : this._impulseFilter(impulse, this);
            }

            impulseMap(impulse) {
                return isUnset(this._impulseMap) ? noop
                    : this._impulseMap(impulse, this);
            }

            get signalStream() {
                if (!this._signalStream) {
                    this._signalStream = this.pool.signalStream
                        .pipe(filter(signal => signal.vector.name === this.name));
                }
                return this._signalStream;
            }

            subscribe(...params) {
                return this.signalStream.subscribe(...params);
            }
        };

        propper(Vector)
            .addProp('idempotent', {
                type: 'boolean',
                defaultValue: false
            })
            .addProp('pool', {
                required: true, type: 'object',
                onInvalid: (...params) => {
                    throw error('bad vector.pool', {
                        field: 'config',
                        object: 'Pool',
                        params
                    })
                }
            })
            .addProp('sender', {
                required: true, type: 'function',
                onInvalid: (...params) => {
                    throw error('bad vector.sender', {
                        field: 'config',
                        object: 'Pool',
                        params
                    })
                }
            })
            .addProp('schema')
            .addProp('config', {
                type: 'object',
                onInvalid: (...params) => {
                    throw error('bad vector.config', {
                        field: 'config',
                        object: 'Pool',
                        params
                    })
                }
            })
            .addProp('name', {
                required: true, type: 'string',
                onInvalid: (...params) => {
                    throw error('bad vector.name', {
                        field: 'config',
                        object: 'Pool',
                        params
                    })
                }
            })

        return Vector;
    });
}
