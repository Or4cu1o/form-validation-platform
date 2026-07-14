import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { triggerBlobDownload } from './download';

describe('triggerBlobDownload', () => {
  beforeEach(() => {
    if (!URL.createObjectURL) URL.createObjectURL = () => '';
    if (!URL.revokeObjectURL) URL.revokeObjectURL = () => {};
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates an object URL, clicks a temporary anchor, and revokes the URL', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const blob = new Blob(['conteudo'], { type: 'text/csv' });
    triggerBlobDownload(blob, 'relatorio.csv');

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});
