import { test } from 'node:test';
import assert from 'node:assert/strict';
import { identify } from '../src/gateway.js';

function fakeSocket(onSend) {
  return class extends EventTarget {
    sent = [];
    constructor() {
      super();
      queueMicrotask(() => this.receive({ op: 10, d: { heartbeat_interval: 41250 } }));
    }
    receive(payload) {
      this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(payload) }));
    }
    send(data) {
      this.sent.push(JSON.parse(data));
      onSend(this, JSON.parse(data));
    }
    close() {}
  };
}

test('identifies with the token and resolves on READY', async () => {
  let identifyPayload;
  const WebSocketImpl = fakeSocket((ws, payload) => {
    identifyPayload = payload;
    ws.receive({ op: 0, t: 'READY', d: {} });
  });
  await identify('tok', { WebSocketImpl });
  assert.equal(identifyPayload.op, 2);
  assert.equal(identifyPayload.d.token, 'tok');
});

test('rejects when Discord closes the connection', async () => {
  const WebSocketImpl = fakeSocket((ws) => {
    const event = new Event('close');
    Object.assign(event, { code: 4004, reason: 'Authentication failed.' });
    ws.dispatchEvent(event);
  });
  await assert.rejects(identify('bad', { WebSocketImpl }), /4004: Authentication failed/);
});

test('rejects on timeout', async () => {
  const WebSocketImpl = fakeSocket(() => {});
  await assert.rejects(identify('tok', { WebSocketImpl, timeoutMs: 10 }), /Timed out/);
});
