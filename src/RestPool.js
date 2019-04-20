import {Store} from '@wonderlandlabs/looking-glass-engine';
import lGet from 'lodash.get';
import axios from 'axios';
import urlJoin from 'url-join';
import querystring from 'query-string';
import propper from "@wonderlandlabs/propper";

export default (bottle) => {

    bottle.factory('RestPool', ({
                                    Pool, error, isUnset, noop, axios,
                                    REST_ACTIONS, UNSET, restVectors, impulseParamsToQuery
                                }) => {

        class RestPool extends Pool {
            constructor(name, config) {
                super(name, config);
                this.baseURL = lGet(config, 'baseURL', '/');
                this.prepQuery = lGet(config, 'prepQuery', null);
                this.identityField = lGet(config, 'identityField', 'id');
                this.responseToData = lGet(config, 'responseToData', noop);
                this.dataToClass = lGet(config, 'dataToClass', noop);
                this.connection = lGet(config, 'connection', axios);
                this.impulseParamsToQuery = lGet(config, 'impulseParamsToQuery', impulseParamsToQuery);

                let restActions = lGet(config, 'restActions', UNSET);
                if (isUnset(restActions)) {
                    REST_ACTIONS.forEach((action) => {
                        this.addVector(action, restVectors[action]);
                    });
                } else {
                    restActions.forEach((action) => {
                        if (typeof action === 'string') {
                            this.addVector(action, restVectors[action]);
                        } else if (Array.isArray(action)) {
                            const [name, config] = action;
                            this.addVector(name, config);
                        } else {
                            throw error('strange action for pool ' + name, {action});
                        }
                    });
                }
            }

            url(id, query) {
                let str = urlJoin(this.baseURL, id);
                if (query) {
                    str += '?' + querystring.stringify(query);
                }
                return str;
            }
        };

        propper(RestPool)
            .addProp('identityField', {
                type: 'string',
                required: true,
                defaultValue: 'id'
            })
            .addProp('connection', {
                type: 'object',
                required: true,
                defaultValue: () => axios
            })
            .addProp('responseToData', {
                type: 'function',
                defaultValue() {
                    return noop
                },
                required: true
            })
            .addProp('prepQuery', {
                type: 'function',
                defaultValue() {
                    return noop
                },
                required: false
            })
            .addProp('dataToClass', {
                type: 'function',
                defaultValue() {
                    return noop
                },
            })
            .addProp('baseURL', {
                type: 'string',
                defaultValue: '/',
                required: true,
                test: [
                    (value) => {
                        if (value === '/') {
                            return true;
                        }
                        return /$http(s)?:\/\/.+/.test(value);
                    },
                    false,
                    'badly formed URL'
                ]
            });

        return RestPool;
    })
}
