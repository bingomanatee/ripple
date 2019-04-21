# Ripple

Ripple is a stream-based REST api. It allows for rest actions to endpoints that 
can be sent and received from pools of information (endpoints). It uses RxJS under the hood
to track activity and stream and observe activity. 

Although it is superficially a stream-driven extension of Axios, it has one feature that distinguish it from
most REST APIS. Even after your response comes back, you can observe changes to the records returned
that other calls elicit, even before your initial return response. So for instance, if you try to get
one individual record by ID, and another response returns with that record in its response, the second response 
will satisfy the first request. 

## The Anatomy of Ripple.

### Pools

A Pool is a solution that reflects a specific data source. For REST this is a single end point but 
fundamentally it is any system for which actions operate on the same set of data, such that they might 
want to listen to each others' results. 

### Vectors

Each Pool has one or more named Vectors, which get and/or change data from the pool. 
Vectors are fundamentally wrappers for an action function but they can have much more
than that:

* (optionally) a function to filter the impulse parameters into a query that the
  pool understands
* a filter and map property that allows you to redirect data from other impulse responses
  (potentially even from other vectors) to update subscribers to an impulse with more recent
  information. 

### Impulse 

An impulse is a prepared request for a single vector. it might be a GET request with an 
ID, a PUT request for a record, a query, etc. It has a reference to a Vector ,
params, and a result stream. 
 
Impulses can be `.subscribe(..)`d to (with a RxJS subscribe pattern)
to listen to any results that come from it. If you want to do this, do it before
you send() signals to the pool.

To transmit an impulse, call `.send() <Promise>`. this is a promise that will return a 
signal with data from the result of the vector. 

### Signal

A signal is a record of the impulse, query, and response from the pool. 

```javascript
puppiesPool.impulse('addPuppy', {id: 1, name: 'Snuggles'})
.send()
.then((signal) => {
    console.log('signal: ', signal.toJSON());
})

/**
* 
* {
      id: this.id,
      pool: 'puppies',
      vector: 'addPuppy',
      query: {id: 1, name: 'Snuggles'},
      error: null,
      response: {
          status: 200,
          data: {id: 1, name: 'Snuggles', createdAt: '2019-10-10:12:00:00 GMT'}
      }
  }
* 
**/

```

Signals can be *mutated* -- to reflect that data is extruded from one signal 
and transmitted to another; in which case the original signal 
is attached as a baseSignal property.

## How Impulses differ from a standard request/response promise

Impulses can be send more than once. Vectors are marked specifically as *idempotent*
will return the same signal to different `send()ers`. (vectors not so marked will 
promise queue multiple sends).

Impulses stream related activity. You can subscribe to an impulse and get information 
about future state changes (at least those piped through client activity). 

# Responses and Errors

the `.response` property of a signal captures whatever feedback comes back from the
`.send()` method of a Vector. 

Any error in your sending method should be trapped and captured as 
an `.error` property of your Signal. These signals will be emitted through the 
error listener of any subscriptions, but will still be sent to the `.then()` 
/ `await` hook of `.send()`. 

# Streams and Subscriptions

Pools, Vectors and Impulses all have signalStreams. 

* All signals for all Vectors will travel through the Pools' signalStream and 
  listenable via `myPool.subscribe(onSignal, onError, onComplete)`.
* All signals originating from a Vector will travel through the vectors' 
  signalStream and are listenable via
  `myPool.vectors.get('vectorName').subscribe(onSignal, onError, onComplete)`
* All signals *satisfying* an Impulse will travel through the impulses' 
  signalStream and will be listenable via 
  
````javascript

const impulse = myPool.impulse('addBunny', {id: 1, name: 'Sally'});
const sub = impulse.subscribe((s) => {
    console.log('bunny:', s.response);
}, (s) => {
    console.log('error:', s.error);
}, () => {
    console.log('complete');
    sub.unsubscribe();
});

````

The last bit is the interesting catch. For instance, if you post a new record
with one impulse and subscribe to it, you will get updates every time someone 
gets a record with that ID (or gets all)
