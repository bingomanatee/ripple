import lGet from 'lodash.get';
import axios from 'axios';
import {filter, map} from 'rxjs/operators';

export default (bottle) => {
    bottle.constant('REST_ACTIONS', 'get,put,post,delete,getAll'.split(','));

    bottle.factory('axios', () => axios);

    bottle.factory('observeSingle', ({restDataFromImpulse, isUnset, UNSET, DataMap, noop}) => {
        return noop;
    });

    bottle.factory('restChannels', ({UNSET, observeSingle, noop, error, restDataFromImpulse, DataMap, isUnset}) => {
        return noop;
    });

    bottle.factory('restDataFromImpulse', ({UNSET, noop}) => {
        return noop;
    });
}
