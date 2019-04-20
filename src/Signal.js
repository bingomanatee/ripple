import lGet from 'lodash.get';
import uuid from 'uuid/v4';

export default (bottle) => {

    bottle.factory('Signal', ({UNSET, Update, error, noop, isUnset}) => {
        /**
         * A channel is a named operation
         */
        return class Signal {
            constructor(impulse, config = {}) {
                this.id = uuid();
                this.response = lGet(config, 'response', null);
                this.error = lGet(config, 'error', null);
                this._baseSignal = lGet(config, 'baseSignal', UNSET);
                this._impulse = impulse;
            }

            toJSON() {
                const out = {
                    id: this.id,
                    pool: this.pool.name,
                    vector: this.vector.name,
                    query: JSON.stringify(this.query),
                    error: lGet(this, 'error', null),
                    response: lGet(this, 'response', null),
                    impulseId: this.impulse.id
                }

                if (!isUnset(this._baseSignal)){
                    out.baseSignal = this._baseSignal.toJSON();
                }

                return out;
            }

            mutate(config) {
                return new Signal(this.impulse, {
                    ...config,
                    baseSignal: this
                });
            }

            get baseSignal() {
                return this._baseSignal;
            }

            get pool() {
                return this.impulse.pool;
            }

            get impulse() {
                return this._impulse;
            }

            get vector() {
                return this.impulse.vector;
            }

            get params() {
                return this.impulse.params;
            }

            get query() {
                if (!this._query) {
                    this._query = this.vector.paramsToQuery(this.impulse);
                }
                return this._query;
            }
        };
    });
}
