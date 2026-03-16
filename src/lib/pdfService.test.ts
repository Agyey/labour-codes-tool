import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePDF } from './pdfService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mock'),
  }),
}));

vi.mock('jspdf', () => ({
  jsPDF: class {
    setProperties = vi.fn();
    getImageProperties = vi.fn().mockReturnValue({ width: 100, height: 200 });
    internal = {
      pageSize: { getWidth: vi.fn().mockReturnValue(210), getHeight: vi.fn().mockReturnValue(297) },
    };
    addImage = vi.fn();
    addPage = vi.fn();
    output = vi.fn().mockReturnValue(new Blob());
  }
}));

describe('pdfService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
  });

  it('throws an error if element not found', async () => {
    await expect(generatePDF('missing-id', 'test')).rejects.toThrow('Element with ID missing-id not found.');
  });

  it('generates a PDF when element is found', async () => {
    const el = document.createElement('div');
    el.id = 'found-id';
    document.body.appendChild(el);

    const result = await generatePDF('found-id', 'test.pdf');
    expect(result).toBe('blob:mock-url');
    expect(html2canvas).toHaveBeenCalledWith(el, expect.any(Object));

    document.body.removeChild(el);
  });
});
