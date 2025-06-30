import * as crypto from 'crypto';

export function generateShortUrl(url: string): string {
    const parsedUrl = new URL(url);
    const hash = crypto.randomBytes(3).toString('hex');
    return `${parsedUrl.origin}/${hash}`;
}