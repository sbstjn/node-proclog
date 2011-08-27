var express = require('express')
, Db = require('mongodb').Db
, Connection = require('mongodb').Connection
, Server = require('mongodb').Server
, BSON = require('mongodb').BSONPure
, registeredHooks = {};

var dbConfig = {
  "host"  : '127.0.0.1'
, "name"  : 'proclog'
, "port"  : 27017
, "user"  : {}};

/**
 * WebSocket for Monitoring 
 */
var ws    = require("websocket-server");
var sck   = ws.createServer();
sck.addListener("close", function(conn) {
  console.log('drop');
  conn.broadcast(JSON.stringify({'id': conn.id, 'action': 'close'}));
});

/**
 * Eventlistener and monitoring
 */
var app = express.createServer();
var web = express.createServer();
web.configure(function(){
  web.use(express.static(__dirname + '/public', { maxAge: 1 }));
  web.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
web.get('/', function(req, res) {
  res.send('<html><head><script src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.js"></script><script src="/script.js"></script><script src="http://omnipotent.net/jquery.sparkline/1.6/jquery.sparkline.js"></script><link rel="stylesheet" href="/style.css"></head><body><div id="container"></div></body></html>');
});
/**
 * Load available hooks
 */
var proc = { add: function(category, action, callback) {
  if (registeredHooks[category] == null) {
    registeredHooks[category] = {}; }

  if (registeredHooks[category][action] == null) {
    registeredHooks[category][action] = new Array(); } 

  registeredHooks[category][action].push(callback);
}};

var availableHooks = require('fs').readdirSync(__dirname + '/hooks');
for (var i = 0; i < availableHooks.length; i++) {
  currentHook = require(__dirname + '/hooks/' + availableHooks[i]);
  if (currentHook.registerHooks) {
    currentHook.registerHooks(proc); }
}

/**
 * Check if application id is known and run callback 
 */
function checkApplication(appKey, res, req, callback) {
  var db = new Db(dbConfig.name, new Server(dbConfig.host, dbConfig.port, dbConfig.user, {native_parser:true}));
  db.open(function(err, db) {
    db.collection('Client', function(err, c) {
      c.find({'_id': new BSON.ObjectID(appKey)}).toArray(function(err, result) {
        db.close();
        if (result && result[0]) {
          callback(res, req); }
      });
    });
  });
}

/**
 * Fire event. called by /fire/ and /start/ 
 */
var funcFireEvent = function(req, res) {
  var eventDetails = {
    "app"       : req.params.appID
  , "user"      : req.params.userID
  , "date"      : new Date()
  , "ip"        : req.headers['x-forwarded-for']
  , "process"   : (req.params.proc == 'null' ? null : req.params.proc)
  , "category"  : req.params.category
  , "action"    : req.params.action};

  if (req.params.label) {
    eventDetails.label = req.params.label; }
  if (req.params.value) {
    eventDetails.value = req.params.value; }    
  
  checkApplication(eventDetails.app, res, req, function(res, req) {
    var db = new Db(dbConfig.name, new Server(dbConfig.host, dbConfig.port, dbConfig.user, {native_parser:true}));
    db.open(function(err, db) {
      db.collection('Event', function(err, c) { 
        if (err) {
          console.log(err); }
        c.insert(eventDetails, function(err, result) {
          if (!err) {
            sck.broadcast(JSON.stringify(eventDetails));
            eventDetails._id  = result[0]._id;
            eventDetails.date = result[0].date;
            db.close(); 
            
            if (registeredHooks[eventDetails.category] && registeredHooks[eventDetails.category][eventDetails.action]) {
              for (var i = 0; i < registeredHooks[eventDetails.category][eventDetails.action].length; i++) {
                registeredHooks[eventDetails.category][eventDetails.action][i](eventDetails, req, res); }
            }
          }
        });
      });
    });
  });
};

/**
 * ProcServ add fireEvent() to request
 */
app.get('*', function(req, res, next) {
  req.fireEvent = funcFireEvent;
  next();
});

/**
 * ProcServ start process
 */
app.get('/start/:appID/:userID/:category/:action/:label?/:value?', function(req, res) {
  var processDetails = {
    "app"       : req.params.appID
  , "user"      : req.params.userID
  , "ip"        : req.headers['x-forwarded-for']
  , "started"   : new Date()
  , "finished"  : null
  , "category"  : req.params.category
  , "action"    : req.params.action};  
  
  if (req.params.label) {
    processDetails.label = req.params.label; }
  if (req.params.value) {
    processDetails.value = req.params.value; }  
    
  checkApplication(processDetails.app, res, req, function(res, req) {
    var db = new Db(dbConfig.name, new Server(dbConfig.host, dbConfig.port, dbConfig.user, {native_parser:true}));
    db.open(function(err, db) {
      db.collection('Process', function(err, c) { 
        if (err) {
          console.log(err); }
        c.insert(processDetails, function(err, doc) {
          res.send('' + doc[0]._id + '');
          req.params.category = 'process';
          req.params.action   = 'start';
          req.params.label    = 'id';
          req.params.value    = doc[0]._id;
          db.close(); 
          
  	      req.fireEvent(req, res);
        });
      });
    });
  });
});

/**
 * ProcServ fire event
 */
app.get('/fire/:appID/:userID/:proc/:category/:action/:label?/:value?', function(req, res) {
  req.fireEvent(req, res);
  res.send('done.');
});

/**
 * ProcServ stop process
 */
app.get('/stop/:proc', function(req, res){  
  var db = new Db(dbConfig.name, new Server(dbConfig.host, dbConfig.port, dbConfig.user, {native_parser:true}));
  db.open(function(err, db) {
    db.collection('Process', function(err, c) { 
      c.find({'_id': new BSON.ObjectID(req.params.proc), 'finished': null}).toArray(function(err, result) {
        if (result && result[0]) {
          var processDetails = result[0];
          
          req.params.category = 'process';
          req.params.action   = 'stop';
          req.params.label    = 'process';
          req.params.value    = req.params.proc;
          req.params.userID   = processDetails.user;
          req.params.appID    = processDetails.app;
          db.close(); 
          
          req.fireEvent(req, res);
          c.update({'_id': new BSON.ObjectID(req.params.proc)}, {$set: {'finished': new Date()}}, {safe:true}, function(err) { db.close(); });
        }
      });
    });
  });
  
  res.send('stopping process');
});

console.log('Monitor on port 8005');
console.log('Logger on port 8003');

app.listen(8003);
sck.listen(8004);
web.listen(8005);