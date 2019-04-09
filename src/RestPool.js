import {Store} from '@wonderlandlabs/looking-glass-engine';
import lGet from 'lodash.get';
import axios from 'axios';
import urlJoin from 'url-join';

export default (bottle) => {

    bottle.factory('RestPool', ({
                                    Pool, noop, error, axios, Vector, isUnset,
                                    REST_ACTIONS, UNSET, restChannels, DataMap
                                }) => {

        function isIterable(obj) {
            // checks for null and undefined
            if (obj == null) {
                return false;
            }
            return typeof obj[Symbol.iterator] === 'function';
        }

        class RestPool extends Pool {
        };

        return RestPool;
    })
}
