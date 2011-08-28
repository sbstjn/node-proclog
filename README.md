`proclog` is a flexible small remote event logger written in Node with flexible support for custom hooks and actions. Events can be logged over a simple HTTP interface with addresses for starting and stopping processes and firing events. Every event and process needs the mandatory keys `category` and `action`, properties `key` and `value` are optional. Events and processes will be assigned to an application id and user. Events can be grouped in processes, buts that's optional…

## Usage
### Starting proclog
For keeping proclog up running I prefer using forever, bit in general just fire up proclog with `node app.js` and all services are started
    
    $ [sudo] node app.js
    proclog monitor on port 8005
    proclog listener on port 8003

Opening http://hostname:8005 with Google Chrome will show you currently happening events and process. `proclog` listens on port 8003 for new events.

### Log events and processes
Events can be logged with simple HTTP GET requests. You can start and stop processes and fire events, processes are completly optional but enable more detailed logging if needed.

    http://hostname:8003/start/:appID/:userID/:category/:action/:label?/:value?
    http://hostname:8003/fire/:appID/:userID/:proc/:category/:action/:label?/:value?
    http://hostname:8003/stop/:proc

Starting an event is the only request you have to wait for its response. The request will return the process id you need for firing events in that process and of course for stopping it. Requests for stopping processes and firing events can be done in background. Do not expect any useful response. 

### Wrappers for easy access
Wrappers for remote logging are available for

 * [NodeJS](http://google.de)
 * [PHP](http://google.de)

Feel free to fork them or create your own ones. Please let know about new loggers so I can add them to the list :)

### Monitoring events

A clean web console is available using web sockets for near-real-time monitoring. Web sockets allow `proclog` to update the monitoring without a JavaScript fetch-loop on the client. New events are pushed to the monitoring tool as soon as they are stored in the database. See events and processes as they occur on the server, web sockets requires a modern browser like Google Chrome.

![Proclog web socket monitoring](http://img.hazelco.de/proclog-20110828-093621.png)

### Custom Hooks

`proclog` supports to hook custom actions on events. Starting the application will scan the directory `hooks/` for valid hooks and the defined action will be called on matching events. An example hook for creating a custom event after a process is stopped is included:

    var proccStop_function = function(eventDetails, req, res) { 
      req.params.category = 'hook';
      req.params.action   = 'caught';
      req.params.label    = 'file';
      req.params.value    = 'sample.js';
      
      req.fireEvent(req, res); 
    };
    
    exports.registerHooks = function(proc) {
      proc.add('process', 'stop', proccStop_function);
    };

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

Use `npm` to install needed modules. 

    $ npm install express websocket-server fs
    $ npm install mongodb --mongodb:native

Future versions of `proclog` will be compatible with the non-native version of mongodb.
