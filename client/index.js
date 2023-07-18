const WebSocket = require('ws');
const fetch = require('node-fetch');

const ws = new WebSocket('wss://connectify--mikecock.repl.co/tunnel');

let port = parseInt(process.argv[2]);

if (!port) throw new Error("The `port` argument is required!");

let url = `http://localhost:${port}`;

console.log('tunneling port ' + port);

ws.onopen = () => {
	ws.onmessage = async (data) => {
		data = JSON.parse(data.data);
		switch (data.type) {
			case "init":
				console.log(`request URL: https://connectify--mikecock.repl.co/${data.value}/`)
			break;
			case "request":
				let info = data.value;
								
				let path = url + info.path;
				
				delete info.path;
				
				let value = await fetch(path, info);
				let headers = Object.fromEntries(value.headers);
				console.log('HEADERS:', headers);
				value = await value.text();
				
				ws.send(JSON.stringify({ value, headers }));
			break;
		}
	}
};
