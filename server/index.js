const express = require('express');
const ews = require('express-ws');

const app = express();
ews(app);

let sessions = {};

let rand_hex = (t) => " ".repeat(t).split(" ").map((t, a) => { let r = Math.floor(Math.random() * (a + 120)); return 0 == r ? 87 : r }).map(t => t.toString(16)).join("");

let request_ws = (id, path, method, body, headers) => {
  sessions[id].send(JSON.stringify({ type: "request", value: { method, path, body, headers } }))
}

app.ws('/tunnel', (ws, req) => {
  let id = rand_hex(10);
  sessions[id] = ws;
  ws.send(JSON.stringify({ type: "init", value: id }))
  console.log('SESSION MAKE:', id);
});


app.route('/:id/*')
  .all((req, res) => {
    let { method, body, headers } = req;

    let id = req.params.id;

    let path = '/' + req.params[0];

    console.log(id);

    if (sessions[id]) {
      request_ws(id, path, method, body, headers);
      sessions[id].on('message', (msg) => {
          msg = JSON.parse(msg.toString());
          res.set(msg.headers);
          res.send(msg.value);
          is_rec = true;
          sessions[id].removeAllListeners('message');
      })
      sessions[id].on('close', () => {
        delete sessions[id];
      });
    } else {
      res.status(404)
        .send('Session not found');
    }
  });


app.listen(8080);
