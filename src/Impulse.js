import lGet from 'lodash.get';
import propper from '@wonderlandlabs/propper';
import {filter, map, startWith} from 'rxjs/operators';

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

                get pool() {
                    return this.vector.pool;
                }

                send() {
                    if (this._pending) {
                        if (this.vector.idempotent) {
                            return this._pending;
                        } else {
                            return this._pending
                                .then(() => this.send())
                                .catch(() => this.send());
                        }
                    } else {
                        const signal = new Signal(this);
                        this._pending = this.vector.send(signal)
                            .then(() => {
                                this._pending = false;
                                this.pool.signalStream.next(signal);
                                return signal;
                            })
                            .catch(() => {
                                this._pending = false;
                                this.pool.signalStream.error(signal);
                                return signal;
                            })
                    }

                    return this._pending;
                }

                get signalStream() {
                    if (!this._signalStream) {
                        this._signalStream = this.vector.signalStream
                            .pipe(
                                filter(this.vector.impulseFilter(this),
                                    map(this.vector.impulseMap(this))
                                ));
                    }
                    return this._signalStream;
                }

                subscribe(...params) {
                    if (this._completed) {
                        throw error('cannot subscribe to completed impulse', {
                            impulse: this, params
                        });
                    }
                    const sub = this.signalStream.subscribe(...params);
                    this._subs.push(sub);
                    return sub;
                }

                get _subs() {
                    if (!this.__subs) {
                        this.__subs = [];
                    }
                    return this.__subs;
                }

                complete() {
                    this._completed = true;
                    if (this._signalStream) {
                        this._signalStream.complete();
                    }

                    if (this.__subs) {
                        this.__subs.forEach(s => s.unsubscribe());
                    }

                    delete this.__subs;
                }
            }

            propper(Impulse)
                .addProp('params', {
                    type: 'array',
                    required: true
                })
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
    );
}
