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
    "twitter-agent/input/report-queue-sizes",
    "twitter-agent/input/input-queue",
    "wikipedia-agent/process/input-queue",
    "wikipedia-agent/input/queue-sizes"
  ],

  columns:
  [
    // External services
    [
     {
        id: "twitter",
        caption: "Twitter.com",
        spacer: 34
      },
      {
        id: "blogs",
        caption: "Blogs",
        spacer: 60
      },
      {
        id: "newsfeed",
        caption: "Newsfeeds"
      },
      {
        id: "wikipedia",
        caption: "Wikipedia.org",
        spacer: 55
      },
      {
        id: "reddit",
        caption: "Reddit.com",
        spacer: 75
      }

    ],
    // Agents
    [
      {
        id: "twitter-agent",
        caption: "Twitter Agent",
        actions: [{trigger: "twitter-agent/input/process-stream-event",
                   caption: "process", colour: MODE_NORMAL},
                  {trigger: "twitter-agent/ingest/heartbeat",
                   caption: "heartbeat", colour: MODE_NORMAL},
                  {trigger: "twitter-agent/process/found-dois",
                   caption: "found event", colour: MODE_OK}]
      },
      {
        id: "newsfeed-agent",
        caption: "Newsfeed Agent",
        actions: [{trigger: "newsfeed-agent/feed/analyze-item",
                     caption: "analyze", colour: MODE_NORMAL},
                    {trigger: "newsfeed-agent/feed/found-item",
                     caption: "found event", colour: MODE_OK},
                    {trigger: "newsfeed-agent/feed/heartbeat",
                     caption: "heartbeat", colour: MODE_NORMAL},
                    {trigger: "newsfeed-agent/feed/check-all-newsfeeds",
                     caption: "check all newsfeeds", colour: MODE_NORMAL},
                    {trigger: "newsfeed-agent/ingest/heartbeat",
                     caption: "ingest", colour: MODE_NORMAL}]
      },
      {
        id: "wikipedia-agent",
        caption: "Wikipedia Agent",
        actions: [{trigger: "wikipedia-agent/process/process-input",
                   caption: "process", colour: MODE_NORMAL},
                  {trigger: "wikipedia-agent/ingest/heartbeat", caption: "heartbeat", colour: MODE_NORMAL},
                  {trigger: "wikipedia-agent/input/found-doi-removed", caption: "event: reference removed", colour: MODE_ERROR},
                  {trigger: "wikipedia-agent/input/found-doi-added", caption: "event: reference added", colour: MODE_OK}]
      },
      {
        id: "reddit-agent",
        caption: "Reddit Agent",
        actions: [{"trigger": "reddit-agent/ingest/heartbeat", caption: "heartbeat", colour: MODE_NORMAL},
                  {"trigger": "reddit-agent/process/found-doi", caption: "found event", colour: MODE_OK}]
      }
    ],
    // Internal processing
    [
      {
        id: "evidence-service",
        caption: "Evidence Service",
        actions: [{trigger: "evidence-service/api/get-artifact-current",
                     caption: "get current artifact", colour: MODE_NORMAL},
                    {trigger: "evidence-service/api/get-artifact-version",
                     caption: "get artifact version", colour: MODE_NORMAL},
                    {trigger: "evidence-service/api/get-artifact-versions",
                     caption: "get all artifact versions", colour: MODE_NORMAL},
                    {trigger: "evidence-service/api/get-event-evidence",
                     caption: "get evidence record", colour: MODE_NORMAL},
                    {trigger: "get-event-evidence/api/get-list-all",
                     caption: "list all", colour: MODE_NORMAL},
                    {trigger: "evidence-service/api/receive-evidence",
                     caption: "received evidence", colour: MODE_NORMAL},
                    {trigger: "evidence-service/server/heartbeat",
                     caption: "heartbeat", colour: MODE_NORMAL}],
        spacer: 200
      }

    ],
    // More internal processing
    [
      {
        id: "lagotto",
        caption: "Lagotto",
        spacer: 200
      },
      {
        id: "status-service",
        caption: "Status Service",
        actions: [{trigger: "status-service/heartbeat/tick", caption: "heartbeat", colour: MODE_NORMAL}]
      },
      {
        id: "archive",
        caption: "Archive"
      },
       
    ]
  ],
  // trigger => info
  connections : {
   "evidence-service/deposits/send-deposit": {from: "evidence-service", to: "lagotto", reverse: false, colour: MODE_NORMAL, caption: "deposit"},
   "evidence-service/deposits/send-deposit-ok": {from: "evidence-service", to: "lagotto" , reverse: true, colour: MODE_OK, caption: "deposit"},
   "evidence-service/deposits/send-evidence": {from: "evidence-service", to: "archive", reverse: false, colour: MODE_NORMAL, caption: "archive evidence"},
   "evidence-service/deposits/send-evidence-success": {from: "evidence-service", to: "archive", reverse: true, colour: MODE_OK, caption: "archive evidence"},
   "evidence-service/deposits/send-evidence-failure": {from: "evidence-service", to: "archive", reverse: true, colour: MODE_ERROR, caption: "archive evidence"},
   
   "wikipedia-agent/restbase-input/query": {from: "wikipedia", to: "wikipedia-agent", reverse: true, colour: MODE_NORMAL, caption: "RESTBase"},
   "wikipedia-agent/restbase-input/error": {from: "wikipedia", to: "wikipedia-agent", reverse: false, colour: MODE_ERROR, caption: "RESTBase"},
   "wikipedia-agent/restbase-input/ok": {from: "wikipedia", to: "wikipedia-agent", reverse: false, colour: MODE_OK, caption: "RESTBase"},
   "wikipedia-agent/input/recent-changes-input": {from: "wikipedia", to: "wikipedia-agent", reverse: false, colour: MODE_NORMAL, caption: "RCStream"},
   "wikipedia-agent/evidence/sent": {from: "wikipedia-agent", to: "evidence-service", reverse: false, colour: MODE_OK, caption: "evidence"},
   "wikipedia-agent/evidence/sent-ok": {from: "wikipedia-agent", to: "evidence-service", reverse: true, colour: MODE_OK, caption: "evidence"},
   "wikipedia-agent/evidence/sent-error": {from: "wikipedia-agent", to: "evidence-service", reverse: true, colour: MODE_ERROR, caption: "evidence"},

   "twitter-agent/artifact/fetch": {from: "twitter-agent", to: "evidence-service", reverse: true, colour: MODE_NORMAL, caption: "artifact"},
   "twitter-agent/evidence/sent": {from: "twitter-agent", to: "evidence-service", reverse: false, colour: MODE_NORMAL, caption: "evidence"},
   "twitter-agent/evidence/sent-ok": {from: "twitter-agent", to: "evidence-service", reverse: true, colour: MODE_OK, caption: "evidence"},
   "twitter-agent/evidence/sent-error": {from: "twitter-agent", to: "evidence-service", reverse: true, colour: MODE_ERROR, caption: "evidence"},
   "twitter-agent/input/input-stream-event": {from: "twitter", to: "twitter-agent", reverse: false, colour: MODE_NORMAL, caption: "tweet"},

   "newsfeed-agent/artifact/fetch": {from: "newsfeed-agent", to: "evidence-service", reverse: true, colour: MODE_NORMAL, caption: "artifact"},
   "newsfeed-agent/evidence/sent": {from: "newsfeed-agent", to: "evidence-service", reverse: false, colour: MODE_NORMAL, caption: "evidence"},
   "newsfeed-agent/evidence/sent-ok": {from: "newsfeed-agent", to: "evidence-service", reverse: true, colour: MODE_OK, caption: "evidence"},
   "newsfeed-agent/evidence/sent-error": {from: "newsfeed-agent", to: "evidence-service", reverse: true, colour: MODE_ERROR, caption: "evidence"},
   "newsfeed-agent/feed/fetch-feed": {from: "newsfeed", to: "newsfeed-agent", reverse: false, colour: MODE_NORMAL, caption: "fetch feed"},

   "reddit-agent/evidence/sent": {from: "reddit-agent", to: "evidence-service", reverse: false, colour: MODE_NORMAL, caption: "artifact"},
   "reddit-agent/evidence/sent-ok": {from: "reddit-agent", to: "evidence-service", reverse: true, colour: MODE_OK, caption: "artifact"},
   "reddit-agent/evidence/sent-error": {from: "reddit-agent", to: "evidence-service", reverse: true, colour: MODE_ERROR, caption: "artifact"},
   "reddit-agent/reddit/fetch-page": {from: "reddit", to: "reddit-agent", reverse: true, colour: MODE_NORMAL, caption: "fetch"},
   "reddit-agent/reddit/authenticate": {from: "reddit", to: "reddit-agent", reverse: true, colour: MODE_NORMAL, caption: "authenticate"}
  }
};

// All values in 'pixels'.
window.config = {
  columnWidth: 250,
  columnPadding: 50,

  boxHeight: 80,
  boxPaddingTop: 20,
  boxPaddingBottom: 0,
  boxPaddingLeft: 20,
  boxPaddingRight: 20,
  boxMarginBottom: 20,
  spacerUnit: 1,

  paddingLeft: 20,
  paddingTop: 2,

  boxCaptionTextHeight: 20,
  boxCaptionTextPaddingTop: 8,
  boxCaptionTextPaddingLeft: 15,
  boxCaptionTextPaddingBottom: 0,

  actionCaptionTextHeight: 15,
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
      // console.log("Layout connection", connection, "from", from, "to", to);
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
        

        // Draw connecting line.
        // context.lineWidth = 1;
        // context.strokeStyle = LIGHT;

        // context.beginPath();
        // context.moveTo(connection.x, connection.y);
        // context.lineTo(connection.xx, connection.yy);
        // context.stroke();

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

// Advance transitions and cue from the queue.
function tickTransitions(entities) {
  // Connections
  for (let trigger in entities.connections) {
    if (entities.connections.hasOwnProperty(trigger)) {

      // Tick all transitions.
      if (connectionTransitions[trigger] != undefined) {
        connectionTransitions[trigger] += 0.01;
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
