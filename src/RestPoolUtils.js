import lGet from 'lodash.get';
import axios from 'axios';
import {filter, map} from 'rxjs/operators';

export default (bottle) => {
    bottle.constant('REST_ACTIONS', 'get,put,post,delete,getAll'.split(','));

    bottle.factory('axios', () => axios);

    bottle.factory('observeSingle', ({restDataFromImpulse, isUnset, UNSET, DataMap}) => {

        };
    });

    bottle.factory('restChannels', ({UNSET, observeSingle, error, restDataFromImpulse, DataMap, isUnset}) => {

    );

    bottle.factory('restDataFromImpulse', ({UNSET}) => {
    });
}
