import {Store} from '@wonderlandlabs/looking-glass-engine';
import {filter, map} from 'rxjs/operators';
import lget from 'lodash.get';
import uuid from 'uuid/v4';

export default (bottle) => {

    bottle.factory('Vector', ({UNSET, Pool, Update, Impulse, error, noop, isUnset}) => {
        /**
         * A channel is a named operation
         */
        return class Vector {
            constructor(name, config = {}) {
                this.pool = lGet(config, 'pool');
                this.sender = lGet(config, 'sender');
                this.config = lGet(config, 'config', config);
                this.schema = lGet(config, 'schema');
                this._paramsToQuery = lGet(config, 'paramsToQuery', noop);
                this.name = name;
            }

            get name() {
                return this._name;
            }

            set name(value) {
                if (!(value && typeof value === 'string')) {
                    throw error('Attempt to set name to invalid value', {
                        vector: this,
                        origin: 'set name',
                        value
                    })
                }
                this._name = value;
            }

            get pool() {
                return this._pool;
            }

            set pool(value) {
                if (!(value instanceof Pool)) {
                    throw error('Attempt to set pool to invalid value', {
                        value,
                        vector: this,
                        origin: 'set pool'
                    });
                }
                this._pool = value;
            }

            get schema() {
                return this._schema;
            }

            set schema(value) {
                this._schema = value;
            }

            impulse(params = {}) {
                return new Impulse({
                    vector: this,
                    pool: this._pool,
                    params
                })
            }

            get sender() {
                return this._sender;
            }

            set sender(value) {
                if (!(value && typeof value === 'function')) {
                    throw error('Attempt to set sender to non function', {
                        value,
                        origin: 'set sender',
                        vector: this
                    })
                }
                this._sender = value;
            }

            paramsToQuery(impulse) {
                return this._paramsToQuery(impulse.props, impulse, this);
            }

            send(signal) {
                const promise = new Promise(async (succeed, fail) => {
                    try {
                        const response = await this.sender(signal);
                        signal.response = response;
                        succeed(signal);
                    } catch (error) {
                        signal.error = error;
                        fail(signal);
                    }
                });

                return promise;
            }
        };
    });
}
