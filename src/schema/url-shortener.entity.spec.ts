import { UrlShortener } from './url-shortener.entity';

describe('UrlShortener Entity', () => {
  it('should create a valid shortened URL entry', () => {
    const urlShortener = new UrlShortener();
    urlShortener.id = 1;
    urlShortener.url = 'https://meusite.com/pagina-longa';
    urlShortener.urlShortener = 'https://meusite.com/abc123';
    urlShortener.user = 10;
    urlShortener.created_at = new Date('2025-06-30T10:00:00Z');
    urlShortener.updated_at = new Date('2025-06-30T10:30:00Z');
    urlShortener.version = 1;
    urlShortener.clicks = 0;

    expect(urlShortener).toBeDefined();
    expect(urlShortener.id).toBe(1);
    expect(urlShortener.url).toBe('https://meusite.com/pagina-longa');
    expect(urlShortener.urlShortener).toBe('https://meusite.com/abc123');
    expect(urlShortener.user).toBe(10);
    expect(urlShortener.created_at).toEqual(new Date('2025-06-30T10:00:00Z'));
    expect(urlShortener.updated_at).toEqual(new Date('2025-06-30T10:30:00Z'));
    expect(urlShortener.version).toBe(1);
    expect(urlShortener.clicks).toBe(0);
  });

  it('should allow instance without optional fields', () => {
    const urlShortener = new UrlShortener();
    urlShortener.id = 2;
    urlShortener.url = 'https://meusite.com/outra-url';
    urlShortener.user = 20;
    urlShortener.version = 1;
    urlShortener.clicks = 0;

    expect(urlShortener.urlShortener).toBeUndefined();
    expect(urlShortener.updated_at).toBeUndefined();
    expect(urlShortener.user).toBe(20);
    expect(urlShortener.version).toBe(1);
    expect(urlShortener.clicks).toBe(0);
  });

  it('should simulate duplicate URL detection', () => {
    const entry1 = new UrlShortener();
    entry1.url = 'https://meusite.com/igual';

    const entry2 = new UrlShortener();
    entry2.url = 'https://meusite.com/igual';

    expect(entry1.url).toBe(entry2.url);

    const existingUrls = [entry1.url];
    const isDuplicate = existingUrls.includes(entry2.url);
    expect(isDuplicate).toBe(true);
  });
});
