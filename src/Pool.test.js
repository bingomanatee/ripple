const tap = require('tap');
const {inspect} = require('util');
const {Subject} = require('rxjs');
const lGet = require('lodash.get');
const cloneDeep = require('lodash.clonedeep');
const {bottle} = require('./../lib');

tap.test('Pool', (suite) => {

    function beforeEach() {
        const b = bottle();

        const puppies = [];
        let myPool = new b.container.Pool('puppies')
            .addVector('addPuppy', (puppy) => {
                if (!puppy.id) {
                    console.log('---- no id puppy', JSON.stringify(puppy));
                    throw new Error('puppy without id');
                }
                puppies.push(puppy);
                return puppies;
            });

        let out = {Pool: b.container.Pool, myPool, puppies};
        return out;
    }

    suite.test('vectors', (vectorTest) => {
        const {myPool} = beforeEach();

        vectorTest.ok(myPool.vectors.has('addPuppy'));

        vectorTest.end();
    })

    suite.test('stream', async (streamTest) => {

        const {myPool} = beforeEach();

        const signals = [];
        const puppy = {id: 1, name: 'bob'};
        const sub = myPool.subscribe((signal) => {
            signals.push(signal);
        });

        await myPool.impulse('addPuppy', puppy).send();

        streamTest.equal(signals.length, 1);
        streamTest.same(signals[0].response, [puppy]);

        sub.unsubscribe();

        streamTest.end();
    });

    suite.test('stream with error', async (streamTest) => {

        const {myPool} = beforeEach();

        const signals = [];
        const puppy = {name: 'sparkles'};
        const sub = myPool.subscribe((signal) => {
            signals.push(signal);
        }, (signal) => {
            signals.push({badSignal: signal})
        });

        try {
            await myPool.impulse('addPuppy', puppy).send();
        } catch (err) {
            console.log('error with signal send:', err.toJSON())
        }
        streamTest.equal(signals.length, 1);
        //console.log('signals:', inspect(signals, {depth: 1}))

        sub.unsubscribe();

        streamTest.end();
        console.log('----- done')
    });
    suite.end();
});
