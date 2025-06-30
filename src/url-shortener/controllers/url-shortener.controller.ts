import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { UrlShortenerService } from "../services/url-shortener.service";

@Controller('url-shortener')
export class UrlShortenerController {
    constructor(private readonly _urlShortenerService: UrlShortenerService) { }

    @MessagePattern('url-shortener/store')
    async store(@Payload() data) {
        return await this._urlShortenerService.store(data)
    }

    @MessagePattern('url-shortener/index')
    async index(@Payload() params) {
        return await this._urlShortenerService.index(params)
    }

    @MessagePattern('url-shortener/redirect')
    async handleRedirect(@Payload() params) {
        return await this._urlShortenerService.handleRedirect(params)
    }

    @MessagePattern('url-shortener/update')
    async update(@Payload() data) {
        return await this._urlShortenerService.update(data.id, data)
    }

    @MessagePattern('url-shortener/delete')
    async delete(@Payload() data) {
        return await this._urlShortenerService.delete(data.id, data)
    }
}