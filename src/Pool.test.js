const tap = require('tap');
const { bottle } = require('./../dist');
const { inspect } = require('util');

tap.test('Pool', (suite) => {

  function beforeEach() {
    const b = bottle();

    const puppies = [];
    let myPool = new b.container.Pool('puppies')
      .addVector('addPuppy', ([ puppy ]) => {
        if (!puppy.id) {
          throw new Error('puppy without id');
        }
        puppies.push(puppy);
        return puppies;
      });

    let out = { 'Pool': b.container.Pool, myPool, puppies };

    return out;
  }

  suite.test('vectors', (vectorTest) => {
    const { myPool } = beforeEach();

    vectorTest.ok(myPool.vectors.has('addPuppy'));

    vectorTest.end();
  });

  suite.test('stream', async(streamTest) => {

    const { myPool } = beforeEach();

    const signals = [];
    const puppy = { 'id': 1, 'name': 'bob' };
    const sub = myPool.subscribe((signal) => {
      signals.push(signal);
    });

    await myPool.impulse('addPuppy', puppy).send();

    streamTest.equal(signals.length, 1);
    streamTest.same(signals[ 0 ].response, [ puppy ]);

    sub.unsubscribe();

    streamTest.end();
  });

  suite.test('stream with error', async(streamTest) => {

    const { myPool } = beforeEach();

    const signals = [];
    const puppy = { 'name': 'sparkles' };
    const sub = myPool.subscribe((signal) => {
      signals.push(signal);
    }, (signal) => {
      signals.push({ 'badSignal': signal });
    });

    try {
      await myPool.impulse('addPuppy', puppy).send();
    } catch (fail) {
    }

    streamTest.equal(signals.length, 1);
    streamTest.equal(signals[ 0 ].badSignal.error.message, 'puppy without id');

    sub.unsubscribe();

    streamTest.end();
  });
  suite.end();
});
