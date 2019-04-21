const tap = require('tap');
const lGet = require('lodash.get');
const { bottle } = require('./../dist');
const { inspect } = require('util');

import { filter, map } from 'rxjs/operators';

tap.test('Pool', (suite) => {

  function beforeEach() {
    const b = bottle();

    let puppies = [];
    let myPool = new b.container.Pool('puppies')
      .addVector('makePuppy', async([ name ], signal) => {
        let maxId = puppies.reduce((max, p) => {
          return Math.max(max, p.id);
        }, 0) + 1;

        let { result } = await signal.pool.impulse('addPuppy', {
          'id': maxId,
          name
        }).send();

        return result;
      },
      {
        'idempotent': true
      })
      .addVector('makePuppyManyTimes', async([ name ], signal) => {
        let maxId = puppies.reduce((max, p) => {
          return Math.max(max, p.id);
        }, 0) + 1;

        let { result } = await myPool.impulse('addPuppy', {
          'id': maxId,
          name
        }).send();

        return result;
      }, {

        'idempotent': false
      }
      )
      .addVector('killPuppy', ([ id ]) => {
        let i = puppies.findIndex((p) => p.id === id);

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
      .addVector('addPuppy', ([ puppy ]) => {
        if (!puppy.id) {
          throw new Error('puppy without id');
        }
        let i = puppies.findIndex((p) => p.id === puppy.id);

        if (i >= 0) {
          puppies[ i ] = puppy;
        } else {
          puppies.push(puppy);
        }
        return puppies;
      },
      {
        makeImpulseStream(impulse) {
          const puppyId = impulse.params[ 0 ].id;

          return impulse.pool.signalStream
            .pipe(filter((signal) => {
              let show = false;

              switch (signal.vector.name) {
                case 'killPuppy':
                  show = signal.query[ 0 ] === puppyId;
                  break;

                case 'addPuppy':
                  show = signal.query[ 0 ].id === puppyId;
                  break;
                case 'makePuppy':
                  show = signal.query[ 0 ].id === puppyId;
                  break;
                case 'makePuppyManyTimes':
                  show = signal.query[ 0 ].id === puppyId;
                  break;
              }
              return show;
            }));

        }
      });

    let out = { 'Pool': b.container.Pool, myPool, puppies };

    return out;
  }

  suite.test('multiple streams', async(streamTest) => {

    const { myPool, puppies } = beforeEach();

    const poolSignals = [];
    const addPuppySignals = [];
    const addPuppy1Signals = [];
    const puppy1 = { 'id': 1, 'name': 'Bob' };
    const puppy2 = { 'id': 2, 'name': 'Sally' };

    const poolSub = myPool.subscribe((signal) => {
      poolSignals.push(signal);
    }, (err) => {
      console.log('error in ms pool sub: ', err);
    });

    const addPuppySub = myPool.vectors.get('addPuppy')
      .subscribe((signal) => {
        addPuppySignals.push(signal);
      }, (err) => console.log('err in addPuppySub ms', err));

    const puppy1impulse = myPool.impulse('addPuppy', puppy1);
    const p1sub = puppy1impulse.subscribe((signal) => addPuppy1Signals.push(signal));

    await puppy1impulse.send();
    await myPool.impulse('addPuppy', puppy2).send();
    await myPool.impulse('killPuppy', puppy1.id).send();

    streamTest.equal(poolSignals.length, 3);
    streamTest.equal(addPuppySignals.length, 2);
    streamTest.equal(addPuppy1Signals.length, 2); // one for add, one for kill
    streamTest.same(addPuppy1Signals.map((s) => s.vector.name), [ 'addPuppy', 'killPuppy' ]);

    streamTest.same(puppies, [ puppy2 ]);

    poolSub.unsubscribe();
    addPuppySub.unsubscribe();
    p1sub.unsubscribe();

    streamTest.end();
  });

  suite.test('multiple impulse calls', async(multiImpulseTest) => {

    const { myPool, puppies } = beforeEach();
    const poolSignals = [];
    const puppy1 = { 'id': 1, 'name': 'Bob' };
    const puppy2 = { 'id': 2, 'name': 'Sally' };
    const puppy3 = { 'id': 3, 'name': 'Sally' };

    const poolSub = myPool.subscribe((signal) => {
      poolSignals.push(signal);
    }, (error) => {
      poolSignals.push({ 'streamError': error });
    });

    await myPool.impulse('addPuppy', puppy1).send();
    await myPool.impulse('addPuppy', puppy2).send();
    await myPool.impulse('addPuppy', puppy3).send();

    const popper = myPool.impulse('popPuppy');

    const pop1 = await popper.send();
    const pop2 = await popper.send();
    const pop3 = await popper.send();
    let pop4;
    let error;

    pop4 = await popper.send();
    error = pop4.error;

    multiImpulseTest.same(error.message, 'no puppies to pop');

    poolSub.unsubscribe();

    multiImpulseTest.end();
  });

  suite.test('cross-impulse signaling', { 'buffered': true }, async(crossTest) => {
    const { myPool } = beforeEach();
    const puppy1 = { 'id': 1, 'name': 'Bob' };
    const puppy1v2 = { 'id': 1, 'name': 'Robert' };

    const updates = [];

    const puppy1impulse = myPool.impulse('addPuppy', puppy1);
    const impulse1sub = puppy1impulse.subscribe((signal) => {
      updates.push(signal.query);
    }, (err) => {
      console.log('puppy sub error:', err);
    });

    await puppy1impulse.send();
    await myPool.impulse('addPuppy', puppy1v2).send();

    impulse1sub.unsubscribe();

    crossTest.equal(updates.length, 2, 'has two updates');
    crossTest.same(updates[ 1 ], [ puppy1v2 ], 'has version 2 of puppy');

    crossTest.end();
  });

  suite.end();
});
