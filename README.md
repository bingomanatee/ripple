# Ripple

Ripple is a stream-based REST api. It allows for rest actions to endpoints that 
can be sent and received from pools of information (endpoints). It uses RxJS under the hood
to track activity and stream and observe activity. 

Although it is at heart a stream-driven extension of Axios, it has update features between impulses.
You can observe changes to the response that other calls elicit, even before your initial return response. 
So for instance, if you try to get one individual record by ID, 
and another response returns with that record in its response, the second response 
will satisfy the first request and emit a signal from the impulses' signalStream. 

Also, unlike Axios, you can send() the same impulse more than once. So, if you want to poll a record,
you can put impulse.send() on a loop to get updates to it. 

The subscribe will only emit a message for unique data -- when the data changes from one poll to another.:

```javascript

const userPool = new RestPool('users', {
    baseUrl: 'http://mysite.com/apis/user'
});

const impulse = userPool.impulse('get', userId, {header: {bearerToken: 'xcb....'}});

const sub = impulse.subscribe((signal) => {
    console.log('my user has been updated: ', signal.response);
    if (!signal.response) {
        stop();
    }
}, (err) => {
    console.log('error getting user: ', err);
    stop();
});

let i = setInterval(() => impulse.send(), 10000); // get the user data every 10 seconds.

function stop() {
    console.log('--terminating--');
    sub.unsubscribe();
    if (i) {
        clearInterval(i);
        i = null;
    }
}

setTimeout(() => userPool.impulse('delete', userId).send(), 20000);

/**
* 
* returns:
* 
* {id: 100, name: 'Bob Woodward'}
* null
* '--terminating---'
* 
**/

```

## The Anatomy of Ripple.

### Pools

A Pool is a solution that reflects a specific data source. For REST this is a single end point but 
fundamentally it is any system for which actions operate on the same set of data, such that they might 
want to listen to each others' results. 

### Vectors

Each Pool has one or mor;e named Vectors, which get and/or change data from the pool. 
Vectors are fundamentally wrappers for an action function. The fundamental function
is included in the 'sender' property of configs. 

They have two optional configurations for tuning their abiities:

* `makeImpulseStream(impulse)` - returns a RxJS stream. 
  By default the impulse signalStream returns a stream that listens to its' own `.send()` responses. 
  Customizing this method allows you to listen to other signals. For instance, the RestPool
  vectors are tuned to listen to other signals that affect the record with the same identity
  as the one the impulse creates.
* `paramsToQuery(impulse)` - does any transformations to the impulse parameters required
  before the send is called on the signal.
* `idempotent` {boolean} - whether or not multiple send()'s are allowed. If true, 
  then calling send() more than once returns the same promise but doesn't trigger 
  multiple executions of vector.sender(). 
  
#### Adding Vectors to Pools

To add a vector to a Pool call `myPool.addVector(name, sender, config)`. You can also
pass vectors directly in the pool's 'vectors' configuration. Note the vectors' pool
method will be updated to point to the pool so don't try to share vectors between
multiple pools. 
  
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

## Calling Impulses

To get data from a Pool you generate an impulse and then send() it, 
which returns a promise that results in a signal. 

If you just want the result once you can one-line the process as in,

```javascript

const signal = await myPool.impulse('post', {id: 1, value: 'cabbage'}).send();

```

note -- errors will be present in signal.error so in most cases you don't need the 
try/catch wrapper around the await. 

If you want to subscribe to the output you have to create, subscribe, then send the impulse:

```javascript

const impulse = myPool.impulse('post', {id: 1, value: 'cabbage'});

const sub = impulse.subscribe((signal) =>{
    console.log('signal response: ', signal.response);
}, (signal) => {
    if (signal && signal.error) {
        console.log('signal error: ', signal.error);
    } else {
        console.log('error:', signal);
    }
}, () => {
    console.log('done');
    sub.unsubscribe();
});

impulse.send();

```

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

The upshot of this is, if you want to filter out errors, use the 
`.subscribe` method to get input, not the promise/await form. (or if you do, 
check the error property of the signal that's returned.)

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

However, RestPool impulse subscriptions have a caveat: there is a `distinctUntiChanged`
filter on the response valuee that suppress redundant signals.

## RestPool

The RestPool is optimized for request/response through HTTP. 

They have several configurations that define their interoperation with 
a data source:

* `baseURL` {String} -- **required** the complete http root of the endpoint -- 
  'http://www.mysite.com/users'
* `identityField` {String} the key of the record; i.e., '_id' for mongo (default: 'id')
* `restActions` {[String...]} If your endpoint doesn't support the full suite of methods (below)
  a subset of the method names it does support. (i.e., ['get', 'put', 'delete'])
  
There are a few other config options for advanced functionality:
    
* `connection` {object} -- by default it is axios -- if you want to mock the data connection for testing,
  replace it with your own connector. 
* `responseToData` {function} -- post-transforms any query response; it has the signature `(response, impulse)`.
  If for instance your rest data is in a sub-property of the response, you can deconstruct it here. 
  
They have five built-in vectors:

* `get(id, {query, headers})` - returns a single record
* `getAll({query, headers})` - returns a set of records -- potentially all of them.
* `put(id, data, {query, headers])` - inserts a new record
* `post(data, {query, headers})` - creates a record
* `delete(data, id, {query, headers})` - removes a record

You can add additional vectors for custom actions through the `myPool.addVector(name, configs)` method. 

```javascript

myPool.addVector('recentActivity', () => {
    return myPool.connection.get('http://mysite.com/api/activity?limit=4')
      .then(result => {
          if (result.data && result.data.activity){
              return result.data.activity;
          } else {
              return [];
          }
      });
});

```



## Keeping state from a RestPool

Ripple and RestPool are by design *stateless*. They don't keep the data that flows through them.
The thinking is, that by definition the only truthful thing that is known is that *at the time that
the data was queried, the data state is that which is shown in the result.* 

Any assumption that the data *is still in that state* is made by the application designer. 
Also, given the potential volume of data that can flow through these requests, the bloat that results
from storing all that data is again, on the application designer. 

If you want to create a mirror of the data from all the data from a pool, `.subscribe(..)` to the pool
and mirror the results into a Map or Hash.  
