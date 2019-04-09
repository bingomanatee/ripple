import uuid from 'uuid/v4';
import {Subject} from 'rxjs';
import {inspect} from 'util';
import cloneDeep from 'lodash.clonedeep';
import {filter, map, startWith} from 'rxjs/operators';
import lGet from 'lodash.get';
import propper from '@wonderlandlabs/propper';

export default (bottle) => {

    bottle.factory('IMPULSE_STATE_NEW', ({Symbol}) => Symbol('IMPULSE_STATE_NEW'));
    bottle.factory('IMPULSE_STATE_QUEUED', ({Symbol}) => Symbol('IMPULSE_STATE_QUEUED'));
    bottle.factory('IMPULSE_STATE_SENT', ({Symbol}) => Symbol('IMPULSE_STATE_SENT'));
    bottle.factory('IMPULSE_STATE_RESOLVED', ({Symbol}) => Symbol('IMPULSE_STATE_RESOLVED'));
    bottle.factory('IMPULSE_STATE_UPDATED', ({Symbol}) => Symbol('IMPULSE_STATE_UPDATED'));
    bottle.factory('IMPULSE_STATE_ERROR', ({Symbol}) => Symbol('IMPULSE_STATE_ERROR'));
    bottle.factory('IMPULSE_STATE_COMPLETE', ({Symbol}) => Symbol('IMPULSE_STATE_COMPLETE'));

    bottle.factory('Impulse', ({
                                   UNSET, error, Signal
                               }) => {

            /**
             * An impulse is a single call to a channel.
             * It exists for an indefinate period before it is performed,
             * so it can be used as a "draft" or prepared query that you
             * build up and send.
             *
             * Once set, its response subscribes to the pools updates
             * stream so that it can change (or present warnings) when
             * the pool's other impulse updates are relevant to the response.
             */
            class Impulse {
                constructor(config = {}) {
                    this.vector = lGet(config, 'vector');
                    this._params = lGet(config, 'params', config);
                }

                get params() {
                    // @TODO: Immutable?
                    return this._params;
                }

                get pool() {
                    return this.vector.pool;
                }

                send() {
                    const signal = new Signal(this);
                    let promise = this.vector.send(signal);
                    promise.then()
                    return promise;
                }

                get signalStream() {
                    if (!this._signalStream) {
                        this._signalStream = this.vector.signalStream
                            .pipe(this.vector.impulseFilter(this));
                    }
                    return this._signalStream;
                }

                subscribe(...params) {
                    return this.signalStream.subscribe(...params);
                }

            }

            propper(Impulse)
                .addProp('vector', {
                    required: true,
                    type: 'object',
                    onInvalid:
                        (err) => {
                            throw error('bad impulse.config', {
                                field: 'vector',
                                object: 'Impulse',
                                err
                            })
                        }
                });

            return Impulse;
        }
    )
    ;
}
