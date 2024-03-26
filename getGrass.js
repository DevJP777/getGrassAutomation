require('dotenv').config();
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const randomUserAgent = require('random-useragent');
const { HttpProxyAgent } = require('http-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');
const ping = require('ping');

const MAX_RETRIES = 2; // Maximum number of retry attempts per proxy
const RETRY_DELAY = 5000; // Delay in milliseconds before retrying connection

async function measurePing(proxy) {
    return new Promise(resolve => {
        ping.promise.probe('8.8.8.8', { timeout: 2 }).then(result => {
            if (result.alive) {
                resolve(result.time);
            } else {
                resolve(null);
            }
        }).catch(err => {
            console.error('\x1b[31mError occurred while pinging:\x1b[0m', err);
            resolve(null);
        });
    });
}

async function removeFromProxyList(proxyToRemove) {
    try {
        let proxyList = fs.readFileSync('proxyList.txt', 'utf8');
        const proxyArray = proxyList.split('\n');
        const updatedProxyArray = proxyArray.filter(proxy => proxy.trim() !== proxyToRemove.trim());
        const updatedProxyList = updatedProxyArray.join('\n');
        fs.writeFileSync('proxyList.txt', updatedProxyList, 'utf8');
        console.log('\x1b[32mProxy removed from list:\x1b[0m', proxyToRemove);
    } catch (error) {
        console.error('\x1b[31mError occurred while removing proxy from list:\x1b[0m', error);
    }
}

async function connectToWss(proxy, user_id, retryCount = 0) {
    try {
        if (retryCount >= MAX_RETRIES) {
            console.error('\x1b[31mMaximum retry attempts reached for proxy:\x1b[0m', proxy);
            await removeFromProxyList(proxy);
            return;
        }

        const device_id = uuidv4();
        console.log('\x1b[32mNew device ID:\x1b[0m', device_id);

        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000)));

        const custom_headers = {
            "User-Agent": randomUserAgent.getRandom().toString()
        };

        let agent;
        if (proxy.startsWith('http://')) {
            agent = new HttpProxyAgent(proxy);
        } else if (proxy.startsWith('socks://') || proxy.startsWith('socks4://') || proxy.startsWith('socks5://')) {
            // If the proxy starts with "socks4://" or "socks5://", replace the number in the URL with "socks://"
            const modifiedProxy = proxy.replace(/^socks[45]:\/\//, 'socks://');
            agent = new SocksProxyAgent(modifiedProxy);
        } else {
            console.error('\x1b[31mUnsupported proxy protocol:\x1b[0m', proxy);
            return;
        }

        const ws = new WebSocket('wss://proxy.wynd.network:4650/', {
            agent: agent,
            headers: custom_headers
        });

        ws.on('open', async function open() {
            const pingTime = await measurePing(proxy);
            console.log('\x1b[32mConnected to proxy:\x1b[0m', proxy, "- Ping:", pingTime ? pingTime + " ms" : "Failed to ping");
            //console.log('\x1b[32mConnected to:\x1b[0m', 'proxy:', proxy);
            setInterval(async function ping() {
                const send_message = JSON.stringify({
                    "id": uuidv4(),
                    "version": "1.0.0",
                    "action": "PING",
                    "data": {}
                });
                //console.log(send_message);
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
            }             else if (message.action === "PONG") {
                const pong_response = JSON.stringify({
                    "id": message.id,
                    "origin_action": "PONG"
                });
                console.log('\x1b[32m RESPONSE PONG TO PROXY:\x1b[0m', proxy);
                //console.log(pong_response);
                ws.send(pong_response);
            }
        });

        ws.on('error', async function (error) {
            console.log('\x1b[31mKoneksi Gagal,Akan Menghubungkan kembali ke:\x1b[0m', proxy);
            ws.close();
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY)); // Retry after delay
            connectToWss(proxy, user_id, retryCount + 1); // Retry connecting to WebSocket
        });
    } catch (error) {
        console.error('\x1b[31mError occurred:\x1b[0m', error);
        console.error('\x1b[31mProxy:\x1b[0m', proxy);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY)); // Retry after delay
        connectToWss(proxy, user_id, retryCount + 1); // Retry connecting to WebSocket
    }
}

async function main() {
    const user_id = process.env.USER_ID
    const proxy_list = fs.readFileSync('proxyList.txt', 'utf8').split('\n');
    for (const proxy of proxy_list) {
        await connectToWss(proxy.trim(), user_id);
    }
}

main();

