let websocket = null,
    uuid = null,
    actionInfo = {};

function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
    uuid = inUUID;

    actionInfo = JSON.parse(inActionInfo);
    websocket = new WebSocket('ws://localhost:' + inPort);

    websocket.onopen = function () {
        const json = {
            event:  inRegisterEvent,
            uuid:   inUUID
        };

        websocket.send(JSON.stringify(json));
        requestSettings();
    }

    websocket.onmessage = function (evt) {
        // Received message from Stream Deck
        const jsonObj = JSON.parse(evt.data);
        if (jsonObj.event === 'sendToPropertyInspector') {
            const payload = jsonObj.payload;
            if (payload.error) {
                return;
            }

            const serverurl = document.getElementById('serverurl');
            serverurl.value = payload.serverurl;

            const webhookid = document.getElementById('webhookid');
            webhookid.value = payload.webhookid;

            const service = document.getElementById('service');
            service.value = payload.service;

            const entities = document.getElementById('entities');
            entities.value = payload.entities;

            const parameter = document.getElementById('parameter');
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
        let payload = {};
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
        const serverurl = document.getElementById('serverurl');
        const webhookid = document.getElementById('webhookid');
        const service = document.getElementById('service');
        const entities = document.getElementById('entities');
        const parameter = document.getElementById('parameter');

        let payload = {};
        payload.type = "updateSettings";
        payload.serverurl = serverurl.value;
        payload.webhookid = webhookid.value;
        payload.service = service.value;
        payload.entities = entities.value;
        payload.parameter = parameter.value;
        const json = {
            "action": actionInfo['action'],
            "event": "sendToPlugin",
            "context": uuid,
            "payload": payload,
        };
        websocket.send(JSON.stringify(json));
    }
}
