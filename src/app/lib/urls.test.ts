import { safeExternalUrl } from './urls';

describe('safeExternalUrl', () => {
  it.each(['https://example.org/', 'http://example.org/page?a=1'])(
    'allows %s',
    (url) => {
      expect(safeExternalUrl(url)).toBe(url);
    }
  );

  it('trims surrounding whitespace', () => {
    expect(safeExternalUrl('  https://example.org/ ')).toBe(
      'https://example.org/'
    );
  });

  it.each([
    'javascript:alert(1)',
    ' JavaScript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'example.org',
    '/relative/path',
    '',
    undefined,
  ])('rejects %p', (url) => {
    expect(safeExternalUrl(url)).toBeUndefined();
  });
});
