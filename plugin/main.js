var websocket = null;
var pluginUUID = null;
var settingsCache = {};

var webhookAction = {

    type : "com.hendricksond.homeassistant.action",

    onKeyDown : function(context, settings, coordinates, userDesiredState) {
    },

    onKeyUp : function(context, settings, coordinates, userDesiredState) {
        settingsCache[context] = settings;
        var serverurl = "";
        if(settings != null && settings.hasOwnProperty('serverurl')){
            serverurl = settings["serverurl"];
        }
        var webhookid = "";
        if(settings != null && settings.hasOwnProperty('webhookid')){
            webhookid = settings["webhookid"];
        }
        var service = "";
        if(settings != null && settings.hasOwnProperty('service')){
            service = settings["service"];
        }
        var entities = "";
        if(settings != null && settings.hasOwnProperty('entities')){
            entities = settings["entities"];
        }
        var parameter = "";
        if(settings != null && settings.hasOwnProperty('parameter')){
            parameter = settings["parameter"];
        }
        if(serverurl == "" || webhookid == "") {
            this.ShowReaction(context, "Alert");
        } else {
            var url = serverurl + '/api/webhook/' + webhookid;
            
            const request = new XMLHttpRequest();
            request.open("POST", url);

            if(service != "" || entities != "" || parameter != "") {
                data = {};
                if (service != "") {
                    data["service"] = service;
                }
                if (entities != "") {
                    data["entities"] = entities; 
                }
                if (parameter != "") {
                    data["parameter"] = parameter; 
                }
                request.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
                request.send(JSON.stringify(data));
            } else {
                request.send();
            }
        }
    },

    onWillAppear : function(context, settings, coordinates) {
        settingsCache[context] = settings;
        var serverurl = "";
        if(settings != null && settings.hasOwnProperty('serverurl')){
            serverurl = settings["serverurl"];
        }
        var webhookid = "";
        if(settings != null && settings.hasOwnProperty('webhookid')){
            webhookid = settings["webhookid"];
        }
        if(serverurl == "" || webhookid == "") {
            this.ShowReaction(context, "Alert");
        }
    },

    ShowReaction : function(context, type) {
        var json = {
            "event": "show" + type,
            "context": context,
        };
        websocket.send(JSON.stringify(json));
    },

    SetSettings : function(context, settings) {
        var json = {
            "event": "setSettings",
            "context": context,
            "payload": settings
        };

        websocket.send(JSON.stringify(json));
    },

    SendSettings : function(action, context) {
        var json = {
            "action": action,
            "event": "sendToPropertyInspector",
            "context": context,
            "payload": settingsCache[context]
        };

        websocket.send(JSON.stringify(json));
    }
};

function connectSocket(inPort, inPluginUUID, inRegisterEvent, inInfo)
{
    pluginUUID = inPluginUUID;

    // Open the web socket
    websocket = new WebSocket("ws://localhost:" + inPort);

    function registerPlugin(inPluginUUID)
    {
        var json = {
            "event": inRegisterEvent,
            "uuid": inPluginUUID
        };

        websocket.send(JSON.stringify(json));
    };

    websocket.onopen = function()
    {
        // WebSocket is connected, send message
        registerPlugin(pluginUUID);
    };

    websocket.onmessage = function (evt)
    {
        // Received message from Stream Deck
        var jsonObj = JSON.parse(evt.data);
        var event = jsonObj['event'];
        var action = jsonObj['action'];
        
        var context = jsonObj['context'];
        var jsonPayload = jsonObj['payload'];

        if(event == "keyDown")
        {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            var userDesiredState = jsonPayload['userDesiredState'];
            console.log(settings);
            webhookAction.onKeyDown(context, settings, coordinates, userDesiredState);
        }
        else if(event == "keyUp")
        {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            var userDesiredState = jsonPayload['userDesiredState'];
            webhookAction.onKeyUp(context, settings, coordinates, userDesiredState);
        }
        else if(event == "willAppear")
        {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            webhookAction.onWillAppear(context, settings, coordinates);
        }
        else if(event == "sendToPlugin") {

            if(jsonPayload['type'] == "updateSettings") {

                webhookAction.SetSettings(context, jsonPayload);
                settingsCache[context] = jsonPayload;

            } else if(jsonPayload['type'] == "requestSettings") {

                webhookAction.SendSettings(action, context);
            }
        }
    };
};