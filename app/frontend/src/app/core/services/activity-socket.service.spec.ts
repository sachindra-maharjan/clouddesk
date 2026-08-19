import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ActivitySocket } from './activity-socket.service';

class MockWebSocket {
  static instances: MockWebSocket[] = [];

  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  close = vi.fn();
  url: string;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  simulateMessage(data: string) {
    this.onmessage?.(new MessageEvent('message', { data }));
  }

  simulateError() {
    this.onerror?.();
  }

  simulateClose() {
    this.onclose?.();
  }
}

describe('ActivitySocket', () => {
  let service: ActivitySocket;

  beforeEach(() => {
    MockWebSocket.instances = [];
    (globalThis as any).WebSocket = MockWebSocket;

    TestBed.configureTestingModule({
      providers: [ActivitySocket],
    });
    service = TestBed.inject(ActivitySocket);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('opens a WebSocket connection on connect()', () => {
    service.connect().subscribe();

    expect(MockWebSocket.instances.length).toBe(1);
    expect(MockWebSocket.instances[0].url).toBe('ws://localhost:8080/ws/activity');
  });

  it('emits parsed JSON messages as ActivityMessage', () => {
    const messages: any[] = [];
    service.connect().subscribe((msg) => messages.push(msg));

    const ws = MockWebSocket.instances[0];
    ws.simulateMessage(JSON.stringify({ type: 'FILE_UPLOADED', payload: { displayName: 'test.pdf' } }));

    expect(messages.length).toBe(1);
    expect(messages[0].type).toBe('FILE_UPLOADED');
    expect(messages[0].payload.displayName).toBe('test.pdf');
  });

  it('drops malformed JSON without erroring the observable', () => {
    const messages: any[] = [];
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    service.connect().subscribe((msg) => messages.push(msg));

    const ws = MockWebSocket.instances[0];
    ws.simulateMessage('not-json');

    expect(messages.length).toBe(0);
    expect(consoleSpy).toHaveBeenCalledWith('Malformed message dropped.');
    consoleSpy.mockRestore();
  });

  it('propagates WebSocket errors to the subscriber', () => {
    let error: any = null;
    service.connect().subscribe({
      error: (err) => (error = err),
    });

    MockWebSocket.instances[0].simulateError();

    expect(error).toBeTruthy();
    expect(error.message).toBe('Activity socket error.');
  });

  it('completes the observable when WebSocket closes', () => {
    let completed = false;
    service.connect().subscribe({ complete: () => (completed = true) });

    MockWebSocket.instances[0].simulateClose();

    expect(completed).toBe(true);
  });

  it('closes the WebSocket when unsubscribed', () => {
    const sub = service.connect().subscribe();
    const ws = MockWebSocket.instances[0];

    sub.unsubscribe();

    expect(ws.close).toHaveBeenCalled();
  });
});
