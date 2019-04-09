const tap = require('tap');
const {inspect} = require('util');
const {Subject} = require('rxjs');
const lGet = require('lodash.get');
const cloneDeep = require('lodash.clonedeep');
import {filter, map} from 'rxjs/operators';

import {bottle} from './../lib';

tap.test('Pool', (suite) => {

    suite.end();
});
