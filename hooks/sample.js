var proccStop_function = function(eventDetails, req, res) { 
  req.params.category = 'hook';
  req.params.action   = 'caught';
  req.params.label    = 'file';
  req.params.value    = 'sample.js';
  
  req.fireEvent(req, res); 
}

exports.registerHooks = function(proc) {
  proc.add('process', 'stop', proccStop_function);
}
