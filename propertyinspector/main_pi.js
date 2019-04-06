var websocket = null,
    uuid = null,
    actionInfo = {};

function connectSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
    uuid = inUUID;

    actionInfo = JSON.parse(inActionInfo);
    websocket = new WebSocket('ws://localhost:' + inPort);

    websocket.onopen = function () {
        var json = {
            event:  inRegisterEvent,
            uuid:   inUUID
        };

        websocket.send(JSON.stringify(json));
        requestSettings();
    }

    websocket.onmessage = function (evt) {
        // Received message from Stream Deck
        var jsonObj = JSON.parse(evt.data);
        if (jsonObj.event === 'sendToPropertyInspector') {
            var payload = jsonObj.payload;
            if (payload.error) {
                return;
            }

            var serverurl = document.getElementById('serverurl');
            serverurl.value = payload.serverurl;

            var webhookid = document.getElementById('webhookid');
            webhookid.value = payload.webhookid;

            var service = document.getElementById('service');
            service.value = payload.service;

            var entities = document.getElementById('entities');
            entities.value = payload.entities;

            var parameter = document.getElementById('parameter');
            parameter.value = payload.parameter;

            if(serverurl.value == "undefined") {
                serverurl.value = "";
            }

            if(webhookid.value == "undefined") {
                webhookid.value = "";
            }

            if(service.value == "undefined") {
                service.value = "";
            }

            if(entities.value == "undefined") {
                entities.value = "";
            }

            if(parameter.value == "undefined") {
                parameter.value = "";
            }

            revealPropertyInspector()
        }
    };

}

function revealPropertyInspector() {
    const el = document.querySelector('.sdpi-wrapper');
    el && el.classList.remove('hidden');
}

function requestSettings() {
    if (websocket) {
        var payload = {};
        payload.type = "requestSettings";
        const json = {
            "action": actionInfo['action'],
            "event": "sendToPlugin",
            "context": uuid,
            "payload": payload,
        };
        websocket.send(JSON.stringify(json));
    }
}

function updateSettings() {
    if (websocket) {
        var serverurl = document.getElementById('serverurl');
        var webhookid = document.getElementById('webhookid');
        var service = document.getElementById('service');
        var entities = document.getElementById('entities');
        var parameter = document.getElementById('parameter');

        var payload = {};
        payload.type = "updateSettings";
        payload.serverurl = serverurl.value;
        payload.webhookid = webhookid.value;
        payload.service = service.value;
        payload.entities = entities.value;
        payload.parameter = parameter.value;
        console.log(payload);
        const json = {
            "action": actionInfo['action'],
            "event": "sendToPlugin",
            "context": uuid,
            "payload": payload,
        };
        websocket.send(JSON.stringify(json));
    }
}
