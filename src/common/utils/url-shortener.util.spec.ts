import { generateShortUrl } from './url-shortener.util';

describe('generateShortUrl', () => {
  it('should generate a valid shortened URL with the same origin', () => {
    const originalUrl = 'https://example.com/some/long/path';
    const shortUrl = generateShortUrl(originalUrl);

    expect(shortUrl).toMatch(/^https:\/\/example\.com\/[a-f0-9]{6}$/);
  });

  it('should throw an error for an invalid URL', () => {
    expect(() => generateShortUrl('not_a_url')).toThrow();
  });

  it('should generate different hashes for different calls', () => {
    const url = 'https://example.com';
    const shortUrl1 = generateShortUrl(url);
    const shortUrl2 = generateShortUrl(url);

    expect(shortUrl1).not.toEqual(shortUrl2);
  });
});
