const GATEWAY_URL = 'wss://gateway.discord.gg/?v=10&encoding=json';
const OP_DISPATCH = 0;
const OP_IDENTIFY = 2;
const OP_HELLO = 10;

// Discord rejects messages from bots that have never identified on the Gateway.
export function identify(token, { WebSocketImpl = WebSocket, timeoutMs = 15_000 } = {}) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocketImpl(GATEWAY_URL);
    const finish = (err) => {
      clearTimeout(timer);
      ws.close();
      err ? reject(err) : resolve();
    };
    const timer = setTimeout(() => finish(new Error('Timed out identifying with the Discord Gateway')), timeoutMs);

    ws.addEventListener('message', ({ data }) => {
      const { op, t } = JSON.parse(data);
      if (op === OP_HELLO) {
        ws.send(
          JSON.stringify({
            op: OP_IDENTIFY,
            d: { token, intents: 0, properties: { os: 'linux', browser: 'hn-bot', device: 'hn-bot' } },
          }),
        );
      } else if (op === OP_DISPATCH && t === 'READY') {
        finish();
      }
    });
    ws.addEventListener('close', ({ code, reason }) => {
      finish(new Error(`Discord Gateway closed with ${code}: ${reason}`));
    });
    ws.addEventListener('error', () => finish(new Error('Could not connect to the Discord Gateway')));
  });
}
