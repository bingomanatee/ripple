const tap = require('tap');
const lGet = require('lodash.get');
const {bottle} = require('./../dist');
const {inspect} = require('util');

tap.test('Pool', (suite) => {

    function beforeEach() {
        const b = bottle();

        let puppies = [];
        let myPool = new b.container.Pool('puppies')
            .addVector('makePuppy', {
                sender: async (name, signal) => {
                    let maxId = puppies.reduce((max, p) => {
                        return Math.max(max, p.id);
                    }, 0) + 1;

                    let {result} = await signal.pool.impulse('addPuppy', {
                        id: maxId,
                        name
                    }).send();
                    return result;
                },
                idempotent: true
            })
            .addVector('makePuppyManyTimes', {
                sender: async (name, signal) => {
                    let maxId = puppies.reduce((max, p) => {
                        return Math.max(max, p.id);
                    }, 0) + 1;

                    let {result} = await signal.pool.impulse('addPuppy', {
                        id: maxId,
                        name
                    }).send();
                    return result;
                },
                idempotent: false
            })
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
            .addVector('addPuppy', {
                sender: (puppy) => {
                    if (!puppy.id) {
                        throw new Error('puppy without id');
                    }
                    let i = puppies.findIndex(p => p.id === puppy.id);
                    if (i >= 0) {
                        puppies[i] = puppy;
                    } else {
                        puppies.push(puppy);
                    }
                    return puppy;
                },
                impulseFilter: (impulse, vector) => {
                    const {UNSET, isUnset} = b.container;
                    const id = lGet(impulse, 'params.id', UNSET);
                    if (isUnset(id)) {
                        return () => false;
                    }

                    return (signal) => {
                        // listen to any other addPuppy
                        if (!(signal.vector.name === vector.name)) {
                            return false;
                        }
                        const signalId = lGet(signal, 'query.id', UNSET);
                        if (isUnset(signalId)) {
                            return false;
                        }
                        return signalId === id;
                    }
                }
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

    suite.test('idempotence', (iTest) => {

        iTest.test('making clones', async(singleTest) => {
            const {myPool, puppies} = beforeEach();

            const signals = [];

            const poolSub = myPool.subscribe((signal) => {
                signals.push(signal);
            }, (signal) => {signals.push({badSignal: signal})});

            const makeBobImpulse = myPool.impulse('makePuppyManyTimes', 'Bob');

            await Promise.all(
                [
                    makeBobImpulse.send(),
                    makeBobImpulse.send(),
                    makeBobImpulse.send(),
                    makeBobImpulse.send(),
                ]
            );

            singleTest.equal(puppies.length, 4);
            singleTest.equal(puppies[0].name, 'Bob');
            singleTest.equal(puppies[1].name, 'Bob');
            singleTest.equal(puppies[2].name, 'Bob');
            singleTest.equal(puppies[3].name, 'Bob');
            singleTest.equal(signals.length, 8);
            // four for addPuppy, 4 for all the makeBobs

            poolSub.unsubscribe();

            singleTest.end();
        });

        iTest.test('re-making the same puppy', async(singleTest) => {
            const {myPool, puppies} = beforeEach();

            const signals = [];

            const poolSub = myPool.subscribe((signal) => {
                signals.push(signal);
            }, (signal) => {signals.push({badSignal: signal})});

            const makeBobImpulse = myPool.impulse('makePuppy', 'Bob');

            await Promise.all(
                [
                    makeBobImpulse.send(),
                    makeBobImpulse.send(),
                    makeBobImpulse.send(),
                    makeBobImpulse.send(),
                ]
            );

            singleTest.equal(puppies.length, 1);
            singleTest.equal(puppies[0].name, 'Bob');
            singleTest.equal(signals.length, 2);
            // one for addPuppy, another for all the makeBobs

            poolSub.unsubscribe();
            singleTest.end();
        })
        iTest.end();
    });

    suite.test('multiple impulse calls', {buffered: true}, async (multiImpulseTest) => {

        const {myPool, puppies} = beforeEach();
        const poolSignals = [];
        const puppy1 = {id: 1, name: 'Bob'};
        const puppy2 = {id: 2, name: 'Sally'};
        const puppy3 = {id: 3, name: 'Sally'};

        const poolSub = myPool.subscribe((signal) => {
            poolSignals.push(signal);
        }, (error) => {
            poolSignals.push({streamError: error})
        });

        await myPool.impulse('addPuppy', puppy1).send();
        await myPool.impulse('addPuppy', puppy2).send();
        await myPool.impulse('addPuppy', puppy3).send();

        const popper = myPool.impulse('popPuppy');

        const pop1 = await popper.send();
        const pop2 = await popper.send();
        const pop3 = await popper.send();
        const pop4 = await popper.send();

        multiImpulseTest.same(puppies, []);
        multiImpulseTest.same(lGet(pop4, 'error.message'), 'no puppies to pop', 'comparing errors');

        poolSub.unsubscribe();

        multiImpulseTest.end();
    });

    suite.test('cross-impulse signaling', {buffered: true}, async (crossTest) => {
        const {myPool} = beforeEach();
        const puppy1 = {id: 1, name: 'Bob'};
        const puppy1v2 = {id: 1, name: 'Bobby'};

        const updates = [];

        const puppy1impulse = myPool.impulse('addPuppy', puppy1);
        const impulse1sub = puppy1impulse.subscribe((signal) => {
            updates.push(signal.response);
        }, (err) => {console.log('puppy sub error:', err)});

        await puppy1impulse.send();
        await myPool.impulse('addPuppy', puppy1v2).send();

        impulse1sub.unsubscribe();
        crossTest.equal(updates.length, 2);
        crossTest.same(updates[1], puppy1v2);

        crossTest.end();
    });

    suite.end();
});
