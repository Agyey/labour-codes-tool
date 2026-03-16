import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  it('logs info securely', () => {
    logger.info('test info', { contextId: 1 });
    expect(console.log).toHaveBeenCalled();
    const calls = vi.mocked(console.log).mock.calls;
    expect(calls[0][0]).toContain('"level":"info"');
    expect(calls[0][0]).toContain('"message":"test info"');
    expect(calls[0][0]).toContain('"contextId":1');
  });

  it('logs warn securely', () => {
    logger.warn('test warn');
    expect(console.warn).toHaveBeenCalled();
    const calls = vi.mocked(console.warn).mock.calls;
    expect(calls[0][0]).toContain('"level":"warn"');
  });

  it('logs error securely with instance', () => {
    const err = new Error('Test Error');
    err.name = 'TestError';
    logger.error('failed', err);
    expect(console.error).toHaveBeenCalled();
    const calls = vi.mocked(console.error).mock.calls;
    expect(calls[0][0]).toContain('"level":"error"');
    expect(calls[0][0]).toContain('Test Error');
    expect(calls[0][0]).toContain('TestError');
  });

  it('logs error securely with unknown obj', () => {
    logger.error('failed', { custom: 123 });
    const calls = vi.mocked(console.error).mock.calls;
    expect(calls[0][0]).toContain('"custom":123');
  });

  it('logs debug in dev mode', () => {
    vi.stubEnv('NODE_ENV', 'development');
    logger.debug('test debug', { d: 1 });
    expect(console.log).toHaveBeenCalled();
    const calls = vi.mocked(console.log).mock.calls;
    expect(calls[0][0]).toContain('"level":"debug"');
    vi.unstubAllEnvs();
  });
});
