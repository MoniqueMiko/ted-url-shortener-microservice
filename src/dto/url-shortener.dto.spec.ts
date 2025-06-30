import { validate } from 'class-validator';
import { UrlShortenerDto } from './url-shortener.dto';

describe('UrlShortenerDto', () => {
  it('should be valid with a correct URL', async () => {
    const dto = new UrlShortenerDto();
    dto.url = 'https://www.example.com';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if url is empty', async () => {
    const dto = new UrlShortenerDto();
    dto.url = '';

    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'url')).toBeTruthy();
  });

  it('should fail if url is missing', async () => {
    const dto = new UrlShortenerDto();

    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'url')).toBeTruthy();
  });

  it('should fail with invalid url', async () => {
    const dto = new UrlShortenerDto();
    dto.url = 'invalid_url';

    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'url')).toBeTruthy();
  });

  it('should fail if url is not a proper URL format', async () => {
    const dto = new UrlShortenerDto();
    dto.url = 'htp:/invalid.com';

    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'url')).toBeTruthy();
  });
});