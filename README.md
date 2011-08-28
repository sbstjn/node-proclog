`proclog` is a flexible small event logger written in NodeJS. Events can be logged over a simple HTTP interface. Every event has the mandatory fields `category` and `action`, properties `key` and  `value` are optional and can be set on events and processes as well.

For live monitoring an clean web interface is available using web socket for enabling near-real-time monitoring. Events and processes will be assigned to an application id and user. Events can be grouped in processes, buts that's optional…

#### Running proclog
For keeping proclogmup running I am using forever, fire up proclog and all services are started:

    $ node app.js

#### Log events and processes
Events can be logged with simple HTTP GET requests. You can start and stop processes and store events, processes are completly optional but enable more detailed logging if needed.

    http://hostname:8003/
    http://hostname:8003/
    http://hostname:8003/

Starting an event is the only request you have to wait for its response. Requests for stopping processes and firing events can be done in background. Do not expect any useful response.

## Installation

### Prepare MongoDB

Proclog uses MongoDB for storing events, processes and registered client applications. Per default `proclog` uses MongoDB database `proclog`, registered clients are stored in `Client` collection.

    $ mongo
    > use proclog
    > var newClient = {'_id': new ObjectId(), 'name': 'proclog-tester'};
    > db.Client.save(newClient);
    > db.Client.find();
    { "_id" : ObjectId("4e594a27b062e2c07aefd63d"), "name" : "proclog-tester" }

### Node modules

Use `npm` to install needed modules. Missing modules will stop `proclog` from loading, error messages indicate which module is missing. You should run fine with:

    $ npm install express websocket-server fs
    $ npm install mongodb --mongodb:native

Future versions of `proclog` will be compatible with the non-native version of mongodb.

## Use proclog

Start up `proclog` with:

    $ node app.js

Default address for adding events is `http://hostname:8003` and the websocket monitoring tool is available at `http://hostname:8005`. 