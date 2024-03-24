const WebSocket = require('ws');
const fetch = require('node-fetch');
const { v3: uuidv3 } = require('uuid');
const { random: randomUserAgent } = require('fake-useragent');
const fs = require('fs');

const user_agent = randomUserAgent();

async function connectToWss(socks5_proxy, user_id) {
    const device_id = uuidv3(socks5_proxy, uuidv3.DNS);
    console.log(device_id);
    try {
        const custom_headers = {
            "User-Agent": user_agent
        };

        const ws = new WebSocket('wss://proxy.wynd.network:4650/', {
            agent: socks5_proxy,
            headers: custom_headers
        });

        ws.on('open', async function open() {
            setInterval(async function ping() {
                const send_message = JSON.stringify({
                    "id": uuidv3(),
                    "version": "1.0.0",
                    "action": "PING",
                    "data": {}
                });
                console.log(send_message);
                ws.send(send_message);
            }, 20000);
        });

        ws.on('message', async function incoming(data) {
            const message = JSON.parse(data);
            console.log(message);
            if (message.action === "AUTH") {
                const auth_response = JSON.stringify({
                    "id": message.id,
                    "origin_action": "AUTH",
                    "result": {
                        "browser_id": device_id,
                        "user_id": user_id,
                        "user_agent": custom_headers['User-Agent'],
                        "timestamp": Math.floor(Date.now() / 1000),
                        "device_type": "extension",
                        "version": "3.3.2"
                    }
                });
                console.log(auth_response);
                ws.send(auth_response);
            } else if (message.action === "PONG") {
                const pong_response = JSON.stringify({
                    "id": message.id,
                    "origin_action": "PONG"
                });
                console.log(pong_response);
                ws.send(pong_response);
            }
        });

        ws.on('error', async function(error) {
            console.error('WebSocket error occurred:', error);
            ws.close();
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
            console.log('Reconnecting to WebSocket...');
            connectToWss(socks5_proxy, user_id); // Retry connecting to WebSocket
        });
    } catch (error) {
        console.error('Error occurred:', error);
        console.error('Proxy:', socks5_proxy);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
        console.log('Reconnecting to WebSocket...');
        connectToWss(socks5_proxy, user_id); // Retry connecting to WebSocket
    }
}

async function main() {
    const user_id = process.argv[2];
    const socks5_proxy_list = fs.readFileSync('proxy_list.txt', 'utf8').split('\n');
    for (const socks5_proxy of socks5_proxy_list) {
        await connectToWss(socks5_proxy, user_id);
    }
}

main();
