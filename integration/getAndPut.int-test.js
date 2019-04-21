const tap = require('tap');
import beforeEach from './beforeEach';
import {inspect} from 'util';

tap.test('RestPool:integration', (suite) => {

    suite.test('post/get', async (postGetTest) => {
        const {userPool} = await beforeEach();

        // initial post
        const impulse = userPool.impulse('post', {
            email: 'fred@foo.com',
            name: 'Fred',
            password: '12345235'
        });

        let signal = await impulse.send();
        postGetTest.equal(signal.response.email, 'fred@foo.com');
        postGetTest.equal(signal.response.name, 'Fred');

        // validating independent get
        let getImpulse = userPool.impulse('get', signal.response._id);
        let getSignal = await getImpulse.send();

        postGetTest.equal(getSignal.response.email, 'fred@foo.com');
        postGetTest.equal(getSignal.response.name, 'Fred');

        postGetTest.end();
    });

    suite.test('observing', async (obsTest) => {
        const {userPool} = await beforeEach();

        const postImpulse = await userPool.impulse('post', {
            email: 'fred@foo.com',
            name: 'Fred',
            password: '12345235'
        });

        let subSignals = [];

        postImpulse.subscribe((s) => subSignals.push(s),
            err => {
                console.log('>>>>>>> observing error: ', err)
            });
        const signal = await postImpulse.send();
        const record = signal.response;

        obsTest.equal(record.email, 'fred@foo.com');
        obsTest.equal(record.name, 'Fred');

        // putting a new value into the same id should trigger tihe impulse stream
        await userPool.impulse('put', record._id, {email: 'fred@foo.com', name: 'Fred Smith'})
            .send();

        obsTest.equal(subSignals.length, 2);
        obsTest.equal(subSignals[1].response.email, 'fred@foo.com');
        obsTest.equal(subSignals[1].response.name, 'Fred Smith');

        obsTest.end();
    });

    suite.test('observing distinct', async (obsTest) => {
        const {userPool} = await beforeEach();

        const postImpulse = await userPool.impulse('post', {
            email: 'fred@foo.com',
            name: 'Fred',
            password: '12345235'
        });

        let subSignals = [];

        postImpulse.subscribe((s) => subSignals.push(s),
            err => {
                console.log('>>>>>>> observing error: ', err)
            });
        const signal = await postImpulse.send();
        const record = signal.response;

        // getting the same data is not distinct, should be ignored.
        await userPool.impulse('get', record._id).send();

        // putting a new value into the same id should trigger tihe impulse stream
        await userPool.impulse('put', record._id, {email: 'fred@foo.com', name: 'Fred Smith'})
            .send();

        obsTest.equal(subSignals.length, 2);
        obsTest.equal(subSignals[1].response.email, 'fred@foo.com');
        obsTest.equal(subSignals[1].response.name, 'Fred Smith');

        obsTest.end();
    });

    suite.end();
});
