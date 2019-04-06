let websocket = null,
    pluginUUID = null,
    settingsCache = {};

const webhookAction = {

    type : "com.hendricksond.homeassistant.webhook.action",

    onKeyDown : function(context, settings, coordinates, userDesiredState) {
    },

    onKeyUp : function(context, settings, coordinates, userDesiredState) {
        settingsCache[context] = settings;
        let serverurl = "";
        if(settings != null && settings.hasOwnProperty('serverurl')){
            serverurl = settings["serverurl"];
        }
        let webhookid = "";
        if(settings != null && settings.hasOwnProperty('webhookid')){
            webhookid = settings["webhookid"];
        }
        let service = "";
        if(settings != null && settings.hasOwnProperty('service')){
            service = settings["service"];
        }
        let entities = "";
        if(settings != null && settings.hasOwnProperty('entities')){
            entities = settings["entities"];
        }
        let parameter = "";
        if(settings != null && settings.hasOwnProperty('parameter')){
            parameter = settings["parameter"];
        }
        if(serverurl == "" || webhookid == "") {
            this.ShowReaction(context, "Alert");
        } else {
            const url = serverurl + '/api/webhook/' + webhookid;
            
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
        let serverurl = "";
        if(settings != null && settings.hasOwnProperty('serverurl')){
            serverurl = settings["serverurl"];
        }
        let webhookid = "";
        if(settings != null && settings.hasOwnProperty('webhookid')){
            webhookid = settings["webhookid"];
        }
        if(serverurl == "" || webhookid == "") {
            this.ShowReaction(context, "Alert");
        }
    },

    ShowReaction : function(context, type) {
        const json = {
            "event": "show" + type,
            "context": context,
        };
        websocket.send(JSON.stringify(json));
    },

    SetSettings : function(context, settings) {
        const json = {
            "event": "setSettings",
            "context": context,
            "payload": settings
        };

        websocket.send(JSON.stringify(json));
    },

    SendSettings : function(action, context) {
        const json = {
            "action": action,
            "event": "sendToPropertyInspector",
            "context": context,
            "payload": settingsCache[context]
        };

        websocket.send(JSON.stringify(json));
    }
};

function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo)
{
    pluginUUID = inPluginUUID;

    // Open the web socket
    websocket = new WebSocket("ws://localhost:" + inPort);

    function registerPlugin(inPluginUUID)
    {
        const json = {
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
        const jsonObj = JSON.parse(evt.data);
        const event = jsonObj['event'];
        const action = jsonObj['action'];
        const context = jsonObj['context'];
        const jsonPayload = jsonObj['payload'];

        if(event == "keyDown")
        {
            const settings = jsonPayload['settings'];
            const coordinates = jsonPayload['coordinates'];
            const userDesiredState = jsonPayload['userDesiredState'];
            webhookAction.onKeyDown(context, settings, coordinates, userDesiredState);
        }
        else if(event == "keyUp")
        {
            const settings = jsonPayload['settings'];
            const coordinates = jsonPayload['coordinates'];
            const userDesiredState = jsonPayload['userDesiredState'];
            webhookAction.onKeyUp(context, settings, coordinates, userDesiredState);
        }
        else if(event == "willAppear")
        {
            const settings = jsonPayload['settings'];
            const coordinates = jsonPayload['coordinates'];
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