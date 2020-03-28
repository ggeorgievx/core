importScripts("./pwa-gateway.js");

node_gateway.core.configure_logging({
	level:"error"
});

const gateway = node_gateway.core.create({
});

gateway.start();

onconnect = function (e) {
  console.log('connected', e);
  var port = e.ports[0];

  const c = gateway.connect((client, msg) => port.postMessage(msg))

  port.onmessage = function (e) {
    console.log(e);
    c.then((client) => client.send(e.data));
  }
}
