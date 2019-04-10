const tap = require('tap');
const {bottle} = require('./../dist');
const {inspect} = require('util');

tap.test('Pool', (suite) => {

    function beforeEach() {
        const b = bottle();

        let puppies = [];
        let myPool = new b.container.Pool('puppies')
            .addVector('killPuppy', (id) => {
                let i = puppies.findIndex(p => p.id === id);
                if (i >= 0) {
                    delete puppies.splice(i, 1);
                }
                return puppies;
            })
            .addVector('popPuppy', () => {
                if (!puppies.length) {
                    throw new Error('no puppies to pop');
                }
                return puppies.pop();
            })
            .addVector('addPuppy', (puppy) => {
                if (!puppy.id) {
                    throw new Error('puppy without id');
                }
                let i = puppies.findIndex(p => p.id === puppy.id);
                if (i >= 0) {
                    puppies[i] = puppy;
                } else {
                    puppies.push(puppy);
                }
                return puppies;
            });

        let out = {Pool: b.container.Pool, myPool, puppies};
        return out;
    }

    suite.test('multiple streams', async (streamTest) => {

        const {myPool, puppies} = beforeEach();

        const poolSignals = [];
        const addPuppySignals = [];
        const addPuppy1Signals = [];
        const puppy1 = {id: 1, name: 'Bob'};
        const puppy2 = {id: 2, name: 'Sally'};

        const poolSub = myPool.subscribe((signal) => {
            poolSignals.push(signal);
        });

        const addPuppySub = myPool.vectors.get('addPuppy')
            .subscribe((signal) => {
                addPuppySignals.push(signal);
            });

        const puppy1impulse = myPool.impulse('addPuppy', puppy1);
        const p1sub = puppy1impulse.subscribe(signal => addPuppy1Signals.push(signal))

        await puppy1impulse.send();
        await myPool.impulse('addPuppy', puppy2).send();
        await myPool.impulse('killPuppy', puppy1.id).send();

        streamTest.equal(poolSignals.length, 3);
        streamTest.equal(addPuppySignals.length, 2);
        streamTest.equal(addPuppy1Signals.length, 1);

        streamTest.same(puppies, [puppy2]);

        poolSub.unsubscribe();
        addPuppySub.unsubscribe();
        p1sub.unsubscribe();

        streamTest.end();
    });

    suite.test('multiple impulse calls', async (multiImpulseTest) => {

        const {myPool, puppies} = beforeEach();
        const poolSignals = [];
        const puppy1 = {id: 1, name: 'Bob'};
        const puppy2 = {id: 2, name: 'Sally'};
        const puppy3 = {id: 3, name: 'Sally'};

        const poolSub = myPool.subscribe((signal) => {
            poolSignals.push(signal);
        });

        await myPool.impulse('addPuppy', puppy1).send();
        await myPool.impulse('addPuppy', puppy2).send();
        await myPool.impulse('addPuppy', puppy3).send();

        const popper = myPool.impulse('popPuppy');

        const pop1 = await popper.send();
        const pop2 = await popper.send();
        const pop3 = await popper.send();
        let pop4;

        try {
            pop4 = await popper.vector.sender({});
            console.log('pop 4 sent', pop4);
        } catch (err) {
            console.log('error of sender:', err);
        }

        // multiImpulseTest.same(pop4.error.message, 'no puppies to pop');

        // poolSub.unsubscribe();

        multiImpulseTest.end();
    });

    suite.end();
});
