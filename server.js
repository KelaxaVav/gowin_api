const http = require("http");
const app = require("./index");
// const socketIo = require("./socket.io");
const port = process.env.PORT || 5007;
const httpServer = http.createServer(app);
// socketIo(httpServer);

httpServer.listen(port, () => console.log(`Server started on ${port}`));

// RESTART 09

if (process.env.NGROK == true || process.env.NGROK == 'true') {
    const ngrok = require('@ngrok/ngrok');
    ngrok.connect({ addr: port, authtoken: process.env.NGROK_AUTHTOKEN, domain: process.env.NGROK_DOMAIN })
        .then((listener) => console.log(`Ingress established at: ${listener.url()}`));
}
