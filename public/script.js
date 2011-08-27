var conn;
var container = 'procLogger';
var curHash = '';

function checkTime(i) {
  if (i < 10) {
    i = "0" + i; }
    
  return i;
}

function checkMS(i) {
  var newI = i;
  if (i < 10) {
    newI = "0" + i; }
  if (i < 100) {
    newI = "0" + newI; }
    
  return newI;
}

var connect = function () {
  if (window["WebSocket"]) {
    conn = new WebSocket("ws://" + window.location.hostname + ":8004");
    conn.onclose = function (evt) {
      connect();
    };

    conn.onmessage = function (evt) {
      data = JSON.parse(evt.data);

      if (data.app && (curHash == 'all' || curHash == data.app)) {
        var styleString = 'style="display: block;"'; }
      else {
        var styleString = 'style="display: none;"'; }

      if (data.category == 'process') {
        if (data.action == 'start') {
          $('#' + container).prepend('<div class="event process start app' + data.app + ' appIcon appall" ' + styleString + '><span class="date">' + data.date + '</span><a href="#' + data.app + '">' + data.app + '</a> <span class="label">startProcess</span> ' + data.value + '</div>'); }
        if (data.action == 'stop') {
          $('#' + container).prepend('<div class="event process stop app' + data.app + ' appIcon appall" ' + styleString + '><span class="date">' + data.date + '</span><a href="#' + data.app + '">' + data.app + '</a> <span class="label">stopProcess</span> ' + data.value + '</div>'); }
      } else {
        $('#' + container).prepend('<div class="event app' + data.app + ' appIcon appall" ' + styleString + '><span class="date">' + data.date + '</span><a href="#' + data.app + '">' + data.app + '</a> <span class="label">category</span> ' + data.category + ' <span class="label">action</span> ' + data.action + ' <span class="label">label</span> ' + data.label + ' <span class="label">value</span> ' + data.value + '</div>'); }
    };
  }
};

function hashChanged(hash) {
  if (hash.substr(1) == 'all') {
    curHash = 'all';}
  else {
    curHash = hash.substr(1); }

  $('.appIcon').css('display', 'none');
  $('.app' + hash.substr(1)).css('display', 'block');
}

hashChanged(window.location.hash);

if ("onhashchange" in window) {
  window.onhashchange = function () {
    hashChanged(window.location.hash); }
} else { // event not supported:
  var storedHash = window.location.hash;
  window.setInterval(function () {
    if (window.location.hash != storedHash) {
      storedHash = window.location.hash;
      hashChanged(storedHash);
    }
  }, 100);
}

$(document).ready(function () {
  $('<a href="#all" id="viewAll">view all</a><div id="procLogger"></div>').appendTo('#container');
  connect();
});