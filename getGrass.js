const WebSocket = require('ws');
const fs = require('fs');
const uuid = require('uuid');
const { promisify } = require('util');
const { ProxyAgent } = require('proxy-agent');
const UserAgent = require('user-agents');

const user_agent = new UserAgent();
const random_user_agent = user_agent;

const readFileAsync = promisify(fs.readFile);

async function connectToWss(socks5Proxy, userId) {
    const device_id = uuid.v3(socks5Proxy, uuid.v3.DNS);
    console.log(device_id);

    const proxyAgent = new ProxyAgent(socks5Proxy);

    const customHeaders = {
        'User-Agent': random_user_agent
    };

    const ws = new WebSocket('wss://proxy.wynd.network:4650/', {
        agent: proxyAgent,
        headers: customHeaders,
        rejectUnauthorized: false,
        handshakeTimeout: 20000 // Set handshake timeout to 20 seconds
    });

    ws.on('open', async () => {
        try {
            await sleep(Math.random() * 10000);

            const sendPing = async () => {
                while (true) {
                    const send_message = JSON.stringify({
                        id: uuid.v4(),
                        version: '1.0.0',
                        action: 'PING',
                        data: {}
                    });
                    console.log(send_message);
                    ws.send(send_message);
                    await sleep(20000);
                }
            };

            await sleep(1000);
            sendPing();

            ws.on('message', async (response) => {
                const message = JSON.parse(response);
                console.log(message);
                if (message.action === 'AUTH') {
                    const auth_response = {
                        id: message.id,
                        origin_action: 'AUTH',
                        result: {
                            browser_id: device_id,
                            user_id: userId,
                            user_agent: customHeaders['User-Agent'],
                            timestamp: Math.floor(Date.now() / 1000),
                            device_type: 'extension',
                            version: '3.3.2'
                        }
                    };
                    console.log(auth_response);
                    ws.send(JSON.stringify(auth_response));
                } else if (message.action === 'PONG') {
                    const pong_response = {
                        id: message.id,
                        version: '1.0.0',
                        action: 'PONG',
                        data: {
                            proxy: socks5Proxy
                        }
                    };
                    console.log(pong_response);
                    ws.send(JSON.stringify(pong_response));
                }
            });
        } catch (error) {
            console.error('Error:', error.message);
            // Cetak pesan kesalahan ke konsol dan lanjutkan eksekusi
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed.');
        // Handle the WebSocket connection closed event if needed
    });

    ws.on('error', (err) => {
        console.error('WebSocket connection error:', err.message);
        // Hanya mencetak pesan kesalahan ke konsol dan melanjutkan eksekusi
    });
}

async function main() {
    // Find user_id on the site in console localStorage.getItem('userId')
    const userId = await askQuestion('Please Enter your user ID: ');

    // Put the proxy in a file in the format socks5://username:password@ip:port or socks5://ip:port
    const proxyList = (await readFileAsync('listProxy.txt', 'utf8')).split('\n');
    for (const socks5Proxy of proxyList) {
        await connectToWss(socks5Proxy, userId);
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function askQuestion(question) {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        readline.question(question, (answer) => {
            readline.close();
            resolve(answer);
        });
    });
}

main().catch(err => {
    console.error('Main function error:', err.message);
    // Cetak pesan kesalahan ke konsol dan lanjutkan eksekusi
});
