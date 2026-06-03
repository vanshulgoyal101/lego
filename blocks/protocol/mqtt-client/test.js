import { describe, it, expect } from '../../../test/test-harness.js';
import { serialize, deserialize } from './index.js';

await describe('protocol/mqtt-client', async () => {
  await it('should serialize and deserialize CONNECT packets correctly', () => {
    const connectPacket = {
      type: 'CONNECT',
      clientId: 'my-client-id',
      cleanSession: true,
      keepAlive: 30,
      username: 'user123',
      password: 'password123',
      will: {
        topic: 'will/topic',
        payload: 'goodbye',
        qos: 1,
        retain: false
      }
    };

    const buf = serialize(connectPacket);
    expect(buf instanceof Buffer).toBe(true);

    const result = deserialize(buf);
    expect(result !== null).toBe(true);
    expect(result.bytesRead).toBe(buf.length);

    const parsed = result.packet;
    expect(parsed.type).toBe('CONNECT');
    expect(parsed.clientId).toBe('my-client-id');
    expect(parsed.cleanSession).toBe(true);
    expect(parsed.keepAlive).toBe(30);
    expect(parsed.username).toBe('user123');
    expect(parsed.password.toString()).toBe('password123');
    expect(parsed.will !== undefined).toBe(true);
    expect(parsed.will.topic).toBe('will/topic');
    expect(parsed.will.payload.toString()).toBe('goodbye');
    expect(parsed.will.qos).toBe(1);
    expect(parsed.will.retain).toBe(false);
  });

  await it('should serialize and deserialize CONNACK packets correctly', () => {
    const connackPacket = {
      type: 'CONNACK',
      sessionPresent: true,
      returnCode: 0
    };

    const buf = serialize(connackPacket);
    const result = deserialize(buf);
    expect(result !== null).toBe(true);
    expect(result.packet.type).toBe('CONNACK');
    expect(result.packet.sessionPresent).toBe(true);
    expect(result.packet.returnCode).toBe(0);
  });

  await it('should serialize and deserialize PUBLISH packets correctly (QoS 0 and QoS 1)', () => {
    // QoS 0
    const pubQos0 = {
      type: 'PUBLISH',
      topic: 'sensors/temp',
      payload: '22.5',
      qos: 0,
      retain: true,
      dup: false
    };

    let buf = serialize(pubQos0);
    let result = deserialize(buf);
    expect(result !== null).toBe(true);
    expect(result.packet.topic).toBe('sensors/temp');
    expect(result.packet.payload.toString()).toBe('22.5');
    expect(result.packet.qos).toBe(0);
    expect(result.packet.retain).toBe(true);
    expect(result.packet.dup).toBe(false);

    // QoS 1 with packet ID
    const pubQos1 = {
      type: 'PUBLISH',
      topic: 'sensors/humidity',
      payload: Buffer.from([0x01, 0x02, 0x03]),
      qos: 1,
      retain: false,
      dup: true,
      packetId: 42
    };

    buf = serialize(pubQos1);
    result = deserialize(buf);
    expect(result !== null).toBe(true);
    expect(result.packet.topic).toBe('sensors/humidity');
    expect(Buffer.compare(result.packet.payload, Buffer.from([0x01, 0x02, 0x03]))).toBe(0);
    expect(result.packet.qos).toBe(1);
    expect(result.packet.packetId).toBe(42);
    expect(result.packet.dup).toBe(true);
  });

  await it('should serialize and deserialize PUBACK packets correctly', () => {
    const puback = {
      type: 'PUBACK',
      packetId: 1024
    };

    const buf = serialize(puback);
    const result = deserialize(buf);
    expect(result !== null).toBe(true);
    expect(result.packet.type).toBe('PUBACK');
    expect(result.packet.packetId).toBe(1024);
  });

  await it('should serialize and deserialize SUBSCRIBE packets correctly', () => {
    const subscribe = {
      type: 'SUBSCRIBE',
      packetId: 99,
      subscriptions: [
        { topic: 'a/b', qos: 0 },
        { topic: 'c/d', qos: 2 }
      ]
    };

    const buf = serialize(subscribe);
    const result = deserialize(buf);
    expect(result !== null).toBe(true);
    expect(result.packet.type).toBe('SUBSCRIBE');
    expect(result.packet.packetId).toBe(99);
    expect(result.packet.subscriptions.length).toBe(2);
    expect(result.packet.subscriptions[0].topic).toBe('a/b');
    expect(result.packet.subscriptions[0].qos).toBe(0);
    expect(result.packet.subscriptions[1].topic).toBe('c/d');
    expect(result.packet.subscriptions[1].qos).toBe(2);
  });

  await it('should serialize and deserialize SUBACK packets correctly', () => {
    const suback = {
      type: 'SUBACK',
      packetId: 99,
      grantedQos: [0, 2, 128]
    };

    const buf = serialize(suback);
    const result = deserialize(buf);
    expect(result !== null).toBe(true);
    expect(result.packet.type).toBe('SUBACK');
    expect(result.packet.packetId).toBe(99);
    expect(result.packet.grantedQos).toEqual([0, 2, 128]);
  });
});
