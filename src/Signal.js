import {Store} from '@wonderlandlabs/looking-glass-engine';
import {filter, map} from 'rxjs/operators';
import lget from 'lodash.get';
import uuid from 'uuid/v4';

export default (bottle) => {

    bottle.factory('Signal', ({UNSET, Pool, Update, Impulse, error, noop, isUnset}) => {
        /**
         * A channel is a named operation
         */
        return class Signal {
            constructor(impulse) {
                this._impulse = impulse;
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
