import { describe, it, expect, vi } from 'vitest';
import { logActivity } from './audit';
import { prisma } from './prisma';

vi.mock('./prisma', () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
    },
  },
}));

describe('audit', () => {
  it('logs activity to db', async () => {
    vi.mocked(prisma.auditLog.create).mockResolvedValue({ id: '1' } as any);
    await logActivity({ action: 'test', entityType: 'user' });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'test', entity_type: 'user', metadata: {} }),
    });
  });

  it('handles db error gracefully', async () => {
    vi.mocked(prisma.auditLog.create).mockRejectedValue(new Error('DB Failed'));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await logActivity({ action: 'test', entityType: 'user' });
    expect(spy).toHaveBeenCalledWith('[AUDIT_FAILURE] Failed to log action test:', expect.any(Error));
  });
});
