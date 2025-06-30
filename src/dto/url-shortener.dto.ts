import { IsNotEmpty, IsUrl } from 'class-validator';

export class UrlShortenerDto {
  @IsNotEmpty({ message: 'URL is required' })
  @IsUrl({}, { message: 'URL  must be a valid URL' })
  url: string;
}