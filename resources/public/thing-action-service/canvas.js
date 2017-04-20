RED = "#ef3340";
BLUE = "##3eb1c8";
LIGHT = "#d8d2c4";
YELLOW = "#";
DARK = "#4f5858";

// Colours for various transition modes.
MODE_NORMAL = "#ffc72c";
MODE_OK = "#33ef40";
MODE_ERROR = "#ef3340";

window.input = {
  ignore: [
    "event-bus/event/received",
    "live-demo/event/received",
    "live-demo/heartbeat/tick",
    "percolator/input-bundle-working/queue-length",
    "percolator/input-bundle/queue-length",
    "percolator/input/ok",
    "percolator/input/process",
    "percolator/input/received",
    "percolator/output-bundle-working/queue-length",
    "percolator/output-bundle/queue-length",
    "percolator/output-bundle/queue-processed",
    "percolator/queue-heartbeat/tick",
    "query/heartbeat/tick",
    "query/ingest/event",
    "reddit-agent/input-bundle/occurred",
    "status/heartbeat/ping",
    "status/heartbeat/replace",
    "wikipedia-agent/input-bundle/occurred"
  ],

  columns:
  [
    // External services
    [
      {
        id: "doi",
        caption: "DOI System",
        actions: [{trigger: "percolator/doi-api/match", caption: "DOI matched", colour: MODE_OK},
                  {trigger: "percolator/doi-api/no-match", caption: "DOI not matched", colour: MODE_ERROR}]
      },
      {
        id: "crossref-rest-api",
        caption: "Crossref REST API",
        actions: [{trigger: "percolator/metadata-api/ok", caption: "Query matched", colour: MODE_OK},
                  {trigger: "percolator/metadata-api/fail", caption: "Query not matched", colour: MODE_ERROR}]
      },
      {
        id: "web",
        caption: "Web",
        actions: [{trigger: "percolator/web-fetch/ok", caption: "Request OK", colour: MODE_OK},
                  {trigger: "percolator/web-fetch/fail", caption: "Request Fail", colour: MODE_ERROR},
                  {trigger: "percolator/robot/allowed", caption: "Robots.txt check OK", colour: MODE_OK},
                  {trigger: "percolator/robot/not-allowed", caption: "Robots.txt check block", colour: MODE_ERROR}]
      },
      {
        id: "artifact-registry",
        caption: "Artifact Registry",
        actions: []
      },
      {
        id: "twitter",
        caption: "Twitter.com",
        spacer: 70,
        actions: []
      },
      {
        id: "wikipedia",
        caption: "Wikipedia.org",
        spacer: 0,
        actions: []
      },
      {
        id: "newsfeed",
        caption: "Newsfeeds",
        actions: []
      },
      {
        id: "reddit",
        caption: "Reddit.com",
        spacer: 0,
        actions: [{trigger: "reddit-agent/heartbeat/tick", caption: "Heartbeat", colour: MODE_OK},
                  {trigger: "reddit-agent/process/scan-domains", caption: "Scan", colour: MODE_OK}]
      },
      {
        id: "hypothesis",
        caption: "Hypothes.is",
        spacer: 0,
        actions: []
      },
      {
        id: "stackexchange",
        caption: "StackExchange.com",
        spacer: 0,
        actions: []
      }
    ],
    // Agents
    [
      {
        id: "twitter-agent",
        caption: "Twitter Agent",
        actions: [{trigger: "twitter-agent/heartbeat/tick", caption: "Heartbeat", colour: MODE_OK}],
        spacer: 200
      },
      {
        id: "wikipedia-agent",
        caption: "Wikipedia Agent",
        actions: [{trigger: "wikipedia-agent/heartbeat/tick", caption: "Heartbeat", colour: MODE_OK}]
      },
      {
        id: "newsfeed-agent",
        caption: "Newsfeed Agent",
        actions: [{trigger: "newsfeed-agent/heartbeat/tick", caption: "Heartbeat", colour: MODE_OK},
                  {trigger: "newsfeed-agent/process/scan-newsfeeds", caption: "Scan", colour: MODE_NORMAL}]
      },
      {
        id: "reddit-agent",
        caption: "Reddit Agent",
        actions: []
      },
      {
        id: "reddit-links-agent",
        caption: "Reddit Links Agent",
        actions: [{trigger: "reddit-links-agent/heartbeat/tick", caption: "Heartbeat", colour: MODE_OK}]
      },
      {
        id: "hypothesis-agent",
        caption: "Hypothesis Agent",
        actions: [{trigger: "hypothesis-agent/heartbeat/tick", caption: "Heartbeat", colour: MODE_OK},
                  {trigger: "hypothesis-agent/process/scan", caption: "Scan", colour: MODE_NORMAL}]
      },
      {
        id: "stackexchange-agent",
        caption: "StackExchange Agent",
        actions: [{trigger: "stackexchange-agent/heartbeat/tick", caption: "Heartbeat", colour: MODE_OK}]
      }
    ],
    // Internal processing
    [
      {
        id: "percolator",
        caption: "Percolator",
        actions: [{trigger: "percolator/heartbeat/tick", caption: "Heartbeat", colour: MODE_OK},
                  {trigger: "percolator/input-bundle/queue-enqueue", caption: "incoming", colour: MODE_NORMAL},
                  {trigger: "percolator/input-bundle/queue-processed", caption: "processed", colour: MODE_OK}],
        spacer: 200
      }
    ],
    // More internal processing
    [
      {
        id: "event-bus",
        caption: "Event Bus",
        spacer: 120,
        actions: [
          {trigger: "event-bus/heartbeat/tick", caption: "Heartbeat", colour: MODE_OK},
          {trigger: "event-bus/event-by-source/wikipedia", caption: "Wikipedia", colour: MODE_NORMAL},
          {trigger: "event-bus/event-by-source/twitter", caption: "Twitter", colour: MODE_NORMAL},
          {trigger: "event-bus/event-by-source/newsfeed", caption: "Newsfeed", colour: MODE_NORMAL},
          {trigger: "event-bus/event-by-source/reddit", caption: "Reddit", colour: MODE_NORMAL},
          {trigger: "event-bus/event-by-source/hypothesis", caption: "Hypothes.is", colour: MODE_NORMAL},
          {trigger: "event-bus/event-by-source/reddit-links", caption: "Reddit Links", colour: MODE_NORMAL},
          {trigger: "event-bus/event-by-source/stackexchange", caption: "StackExchange", colour: MODE_NORMAL},
          {trigger: "event-bus/event-by-source/crossref", caption: "Crossref", colour: MODE_NORMAL},
          {trigger: "event-bus/event-by-source/datacite", caption: "Datacite", colour: MODE_NORMAL}]},
      {
        id: "evidence-registry",
        caption: "Evidence Registry",
        spacer: 0,
        actions: []
      }
    ]
  ],
  // trigger => info
  connections : {
    "percolator/output/sent": {from: "percolator", to: "evidence-registry", caption: "evidence", colour: MODE_OK},
    "percolator/output-event/sent": {from: "percolator", to: "event-bus", caption: "event", colour: MODE_OK},
    "percolator/artifact/fetch": {from: "artifact-registry", to: "percolator", caption: "artifact", colour: MODE_NORMAL},
    "percolator/doi-api/request": {from: "doi", to: "percolator", caption: "Lookup", colour: MODE_NORMAL, reverse: true},
    "percolator/metadata-api/request": {from: "crossref-rest-api", to: "percolator", caption: "Lookup", colour: MODE_NORMAL, reverse: true},
    "percolator/web-fetch/request": {from: "web", to: "percolator", caption: "Fetch", colour: MODE_NORMAL, reverse: true},
    "wikipedia-agent/input-bundle/sent": {from: "wikipedia-agent", to: "percolator", caption: "Bundle", colour: MODE_NORMAL},
    "stackexchange-agent/input-bundle/sent": {from: "stackexchange-agent", to: "percolator", caption: "Bundle", colour: MODE_NORMAL},
    "stackexchange-agent/stackexchange/fetch-page": {from: "stackexchange", to: "stackexchange-agent", caption: "Fetch", colour: MODE_NORMAL, reverse: true},
    "twitter-agent/input-bundle/sent": {from: "twitter-agent", to: "percolator", caption: "Bundle", colour: MODE_NORMAL},
    "newsfeed-agent/input-bundle/occurred": {from: "stackexchange-agent", to: "percolator", caption: "Bundle", colour: MODE_NORMAL},
    "hypothesis-agent/hypothesis/fetch-page": {from: "hypothesis", to: "hypothesis-agent", caption: "Fetch", colour: MODE_NORMAL},
    "hypothesis-agent/input-bundle/sent": {from: "hypothesis-agent", to: "percolator", caption: "Bundle", colour: MODE_NORMAL},
    "reddit-agent/input-bundle/sent": {from: "reddit-agent", to: "percolator", caption: "Bundle", colour: MODE_NORMAL},
    "reddit-agent/reddit/authenticate": {from: "reddit", to: "reddit-agent", caption: "Authenticate", colour: MODE_NORMAL},
    "reddit-agent/reddit/fetch-page": {from: "reddit", to: "reddit-agent", caption: "Fetch", colour: MODE_NORMAL},
    "reddit-links-agent/reddit/fetch-page": {from: "reddit", to: "reddit-links-agent", caption: "Fetch", colour: MODE_NORMAL},
    "reddit-links-agent/input-bundle/sent": {from: "reddit-links-agent", to: "percolator", caption: "Bundle", colour: MODE_NORMAL}
  }
};

// All values in 'pixels'.
window.config = {
  columnWidth: 250,
  columnPadding: 50,

  boxHeight: 80,
  boxPaddingTop: 10,
  boxPaddingBottom: 0,
  boxPaddingLeft: 10,
  boxPaddingRight: 10,
  boxMarginBottom: 10,
  spacerUnit: 1,

  paddingLeft: 20,
  paddingTop: 2,

  boxCaptionTextHeight: 12,
  boxCaptionTextPaddingTop: 8,
  boxCaptionTextPaddingLeft: 15,
  boxCaptionTextPaddingBottom: 0,

  actionCaptionTextHeight: 10,
  actionCaptionTextPaddingTop: 8,
  actionCaptionTextPaddingLeft: 8,

  connectionSpacing: 10,
  ballSize: 10,
  ballAnnotationTextHeight: 15,

  actionBallSize: 10
};

// 2 on retina, 1 normal.
var ratio = window.devicePixelRatio;

// Foreground and background canvas.
var canvasF = document.getElementById("canvas-f");
var canvasB = document.getElementById("canvas-b");
var contextF = canvasF.getContext("2d");
var contextB = canvasB.getContext("2d");

var header = document.getElementById("header");
var width = (document.body.clientWidth);
var height = (document.body.clientHeight - header.clientHeight);

contextF.scale(ratio,ratio);
canvasF.width = width * ratio;
canvasF.height = height * ratio;
canvasF.style.width = width + "px";
canvasF.style.height = height + "px";

contextB.scale(ratio,ratio);
canvasB.width = width * ratio;
canvasB.height = height * ratio;
canvasB.style.width = width + "px";
canvasB.style.height = height + "px";


// Scale all config values, then add pre-calculated strings.
for (var key in window.config) {
  if (window.config.hasOwnProperty(key)) {
    window.config[key] *= ratio;
  }
}

window.config.boxCaptionTextHeightS = config.boxCaptionTextHeight + "px Helvetica Neue";
window.config.actionCaptionTextHeightS = config.actionCaptionTextHeight + "px Helvetica Neue";
window.config.ballAnnotationTextHeightS = config.ballAnnotationTextHeight + "px Helvetica Neue";

// There can be one transition per action / connection. 
// Represent float status [0,1] of transition.
var actionTransitions = {};
var connectionTransitions = {};

// Queue per action / connection. Number of events in the queue.
var actionTransitionQueue = {};
var connectionTransitionQueue = {};


// Return entities keyed by triggers.
// Will later hold layout information.
function buildEntities(inputData) {
  var entities = {
    // connection trigger => info
    connections : {},

    // component id => component
    components: {},

    // action trigger => info
    actions: {},

    // ignored twitter => nothing
    ignore: {}
  };

  // Index box by id and actions by triggers.
  for (let stage of inputData.columns) {
    for (let column of stage) {
      for (let component of stage) {
        // Assign used here for only 1-deep copying.
        entities.components[component.id] = Object.assign(component);

        for (let action of component.actions || []) {
          entities.actions[action.trigger] = Object.assign(action);
        }
      }
    }
  }

  for (let trigger in inputData.connections) {
    if (inputData.connections.hasOwnProperty(trigger)) {
      entities.connections[trigger] = Object.assign(inputData.connections[trigger]);
    }
  }

  for (let trigger of inputData.ignore) {
    entities.ignore[trigger] = {};
  }

  return entities;
}

// Assign connections to boxes.
// Takes input config and mutable 'entities' object. Modify 'entities' in-place.
function connectAll(inputData, entities) {
  for (let trigger in inputData.connections) {
    if (inputData.connections.hasOwnProperty(trigger)) {
      var connection = inputData.connections[trigger];

      var from = entities.components[connection.from];
      var to = entities.components[connection.to];
      from.outboundConnections = (from.outboundConnections || 0) + 1;
      to.inboundConnections = (to.inboundConnections || 0) + 1;
  
      connection.fromConnectionI = from.outboundConnections;
      connection.toConnectionI = to.inboundConnections;
    }
  }
}

// Give co-ordinates to everything.
// Take input data structure and mutate 'entities' in place.
function layoutAll(inputData, entities) {
  // Boxes and their actions.
  var columnX = config.paddingLeft;
  for (let column of input.columns) {
    var boxY = config.paddingTop;
    for (let box of column) {
      // The mutable object for this box.
      var b = entities.components[box.id];

      // Optional spacer to align things.
      boxY += (b.spacer || 0) * config.spacerUnit;

      b.x = columnX;
      b.y = boxY;
      b.width = config.columnWidth;
      b.height = config.boxPaddingTop + config.boxPaddingBottom +
                   config.boxCaptionTextHeight + config.boxCaptionTextPaddingTop +
                   (box.actions || []).length * (config.actionCaptionTextHeight + config.actionCaptionTextPaddingTop);

      var actionY = b.y + config.boxCaptionTextHeight + config.boxCaptionTextPaddingTop + config.boxCaptionTextPaddingBottom;
      for (let action of box.actions || []) {
        var a = entities.actions[action.trigger];

        a.x = b.x + config.boxCaptionTextPaddingLeft;
        a.y = actionY;

        actionY += config.actionCaptionTextHeight + config.actionCaptionTextPaddingTop;
      }

      boxY += b.height + config.boxMarginBottom;

      
    }

    columnX += config.columnWidth + config.columnPadding;
  }

  // Connections.
  for (let trigger in input.connections) {
    if (input.connections.hasOwnProperty(trigger)) {
      var connection = input.connections[trigger];
      // mutable connection
      var c = entities.connections[trigger];

      let from = entities.components[connection.from];
      let to = entities.components[connection.to];

      c.x = from.x + config.columnWidth;
      c.y = from.y + config.connectionSpacing * connection.fromConnectionI;

      c.xx = to.x;
      c.yy = to.y + config.connectionSpacing * connection.toConnectionI;
    }
  }
}


// https://gist.github.com/gre/1650294
function easeInOutQuart(t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t };

function drawAllBackground(entities) {
  canvasB.width = canvasB.width;

  for (let componentId in entities.components) {
    if (entities.components.hasOwnProperty(componentId)) {
      let component = entities.components[componentId];

      // Draw component box.
      contextB.fillStyle = LIGHT;
      contextB.strokeStyle = DARK;
      contextB.fillRect(component.x, component.y, component.width, component.height);
      contextB.strokeRect(component.x, component.y, component.width, component.height);

      contextB.fillStyle = DARK;

      contextB.font = config.boxCaptionTextHeightS;
      contextB.fillText(component.caption,
                       component.x + config.boxCaptionTextPaddingLeft,
                       component.y + config.boxCaptionTextHeight + config.boxCaptionTextPaddingTop);
    }
  }
}

function drawAllForeground(entities) {
  canvasF.width = canvasF.width;
  
  for (let actionTrigger in entities.actions) {
    if (entities.actions.hasOwnProperty(actionTrigger)) {
      let action = entities.actions[actionTrigger];

      // If the action is undergoing a transition this will be [0-9] else undefined.
      var transition = actionTransitions[actionTrigger];

      // Draw text and ball same colour if we're in a transition.
      if (transition != undefined) {
        contextF.fillStyle = action.colour;
      } else {
        contextF.fillStyle = DARK;
      }

      contextF.font = config.actionCaptionTextHeightS;
      contextF.fillText(action.caption,
                       action.x + config.actionCaptionTextPaddingLeft,
                       action.y + config.actionCaptionTextPaddingTop + config.actionCaptionTextHeight);

      if (transition != undefined) {
        transition = Math.sin(Math.PI * transition);
        contextF.beginPath();
        contextF.arc(action.x + config.actionCaptionTextPaddingLeft / 2,
                    action.y + config.actionCaptionTextPaddingTop + config.actionCaptionTextHeight / 2,
                    transition * config.actionBallSize, 0, 2 * Math.PI, false);
        contextF.fill();
      }
    }
  }

  // Draw connections
  for (let connectionTrigger in entities.connections) {
    if (entities.connections.hasOwnProperty(connectionTrigger)) {
      var connection = entities.connections[connectionTrigger];

      if (connectionTransitions[connectionTrigger] != undefined) {
        var value = connectionTransitions[connectionTrigger];

        var progress = Math.sin(Math.PI / 2 * value);
        var scale = Math.sin(Math.PI * value);

        var x;
        var y; 

        if (connection.reverse) {
          x = (connection.x - connection.xx) * progress + connection.xx;
          y = (connection.y - connection.yy) * progress + connection.yy;
        } else {
          x = (connection.xx - connection.x) * progress + connection.x;
          y = (connection.yy - connection.y) * progress + connection.y;
        }
        
        // Draw ball
        contextF.beginPath();
        contextF.arc(x, y, scale * config.ballSize, 0, 2 * Math.PI, false);
        contextF.fillStyle = connection.colour;
        contextF.fill();

        contextF.fillStyle = DARK;
        contextF.font = config.ballAnnotationTextHeightS;
        contextF.fillText(connection.caption, x, y);

      }
    }
  }  
}

// If there's no backlog, do it nice and leisurely.
// If there's a queue, speed up proportional to the queue.
var MAX_SPEED_INCREMENT = 0.05;
var MIN_SPEED_INCREMENT = 0.005;
var MAX_SPEED_THRESHOLD = 100;

// Advance transitions and cue from the queue.
function tickTransitions(entities) {
  // Connections
  for (let trigger in entities.connections) {
    if (entities.connections.hasOwnProperty(trigger)) {

      // Tick all transitions.
      if (connectionTransitions[trigger] != undefined) {
        var increment = Math.max((connectionTransitionQueue[trigger] / MAX_SPEED_THRESHOLD) * MAX_SPEED_INCREMENT, MIN_SPEED_INCREMENT);
        connectionTransitions[trigger] += increment;
      }
     
      // Finish those that are over.
      if (connectionTransitions[trigger] > 1) {
        connectionTransitions[trigger] = undefined;
      }

      // Cue transitions from the queue if the transition has finished.
      // Undefined not > 0.
      if (connectionTransitions[trigger] == undefined && connectionTransitionQueue[trigger] > 0) {
        connectionTransitions[trigger] = 0;
        connectionTransitionQueue[trigger] --;
      }
    }
  }

  // Actions
  for (let trigger in entities.actions) {
    if (entities.actions.hasOwnProperty(trigger)) {

      // Tick all transitions.
      if (actionTransitions[trigger] != undefined) {
        actionTransitions[trigger] += 0.01;
      }

      // Finish those that are over.
      if (actionTransitions[trigger] > 1) {
        actionTransitions[trigger] = undefined;
      }

      // Cue transitions from the queue if the transition has finished.
      // Undefined not > 0.
      if (actionTransitions[trigger] == undefined && actionTransitionQueue[trigger] > 0) {
        actionTransitions[trigger] = 0;
        actionTransitionQueue[trigger] --;
      }
    }
  }
}

function triggerEvent(trigger, number, entities) {
  if (entities.connections.hasOwnProperty(trigger)) {
    connectionTransitionQueue[trigger] = (connectionTransitionQueue[trigger] | 0 ) + number;
  } else if (entities.actions.hasOwnProperty(trigger)) {
    actionTransitionQueue[trigger] = (actionTransitionQueue[trigger] | 0 ) + number;
  } else if (entities.ignore.hasOwnProperty(trigger)) {
    // just ignore. some things aren't suitable for this display
  } else {
    console.log("Didn't recognise", trigger)
  }
}

function tickBackground() {
  drawAllBackground(window.entities);
}

function tickForeground() {
  tickTransitions(window.entities);
  drawAllForeground(window.entities);
}

// 'entities' contains input processed for layout and triggering.
window.entities = buildEntities(window.input);
connectAll(window.input, window.entities);
layoutAll(window.input, window.entities);

window.setInterval(tickForeground, 5);
window.setInterval(tickBackground, 1000);
tickBackground();

var url;
if (window.location.protocol == "https:") {
  url = "wss://" + window.location.host + "/socket";
} else {
  url = "ws://" + window.location.host + "/socket";
}

// TODO
url = "ws://status.eventdata.crossref.org/socket"

var socket = new WebSocket(url);
socket.onopen = function() {
  socket.send("start");
}
socket.onmessage = function(item) {
  var parts = item.data.split(";");
  triggerEvent(parts[0], parseInt(parts[1]), window.entities)
};
socket.onerror = function() {
  console.log("error");
}
