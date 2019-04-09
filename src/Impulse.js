import uuid from 'uuid/v4';
import {Subject} from 'rxjs';
import {inspect} from 'util';
import cloneDeep from 'lodash.clonedeep';
import {filter, map, startWith} from 'rxjs/operators';
import lGet from 'lodash.get';

export default (bottle) => {

    bottle.factory('IMPULSE_STATE_NEW', ({Symbol}) => Symbol('IMPULSE_STATE_NEW'));
    bottle.factory('IMPULSE_STATE_QUEUED', ({Symbol}) => Symbol('IMPULSE_STATE_QUEUED'));
    bottle.factory('IMPULSE_STATE_SENT', ({Symbol}) => Symbol('IMPULSE_STATE_SENT'));
    bottle.factory('IMPULSE_STATE_RESOLVED', ({Symbol}) => Symbol('IMPULSE_STATE_RESOLVED'));
    bottle.factory('IMPULSE_STATE_UPDATED', ({Symbol}) => Symbol('IMPULSE_STATE_UPDATED'));
    bottle.factory('IMPULSE_STATE_ERROR', ({Symbol}) => Symbol('IMPULSE_STATE_ERROR'));
    bottle.factory('IMPULSE_STATE_COMPLETE', ({Symbol}) => Symbol('IMPULSE_STATE_COMPLETE'));

    bottle.factory('Impulse', ({
                                   UNSET, ifUnset, noop, Promiser, error,
                                   isUnset,
                                   IMPULSE_STATE_NEW,
                                   IMPULSE_STATE_QUEUED,
                                   IMPULSE_STATE_SENT,
                                   IMPULSE_STATE_RESOLVED,
                                   IMPULSE_STATE_ERROR,
                                   IMPULSE_STATE_COMPLETE,
                                   IMPULSE_STATE_UPDATED,
                                   DataMap,
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

        }

        return Impulse;
    });
}
