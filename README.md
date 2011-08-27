Readme and installation instructions will follow...

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