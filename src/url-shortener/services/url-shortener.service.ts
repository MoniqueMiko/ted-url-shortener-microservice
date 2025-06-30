import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../schema/user.entity';
import { HttpException } from '../../common/exceptions/http-exception';
import { UrlShortener } from '../../schema/url-shortener.entity';
import { UrlShortenerDto } from '../../dto/url-shortener.dto';
import { DtoValidatorService } from '../../common/validations/dto-validator.service';
import { generateShortUrl } from '../../common/utils/url-shortener.util';

@Injectable()
export class UrlShortenerService {
    constructor(
        @InjectRepository(User)
        private readonly _user: Repository<User>,

        @InjectRepository(UrlShortener)
        private readonly _urlShortener: Repository<UrlShortener>,

        private _httpException: HttpException,
        private _dtoValidatorService: DtoValidatorService
    ) { }

    async store(data) {
        try {
            const validate = await this._dtoValidatorService.validateBody(UrlShortenerDto, data.body);
            if (validate?.status === 400) {
                return await this._httpException.responseHelper(400, await validate.message);
            }

            const shortenedUrl = await generateShortUrl(data.body.url)

            if (data?.user?.sub) {
                const userExist = await this._user.findOne({ where: { id: data?.user?.sub } });
                if (!userExist) {
                    delete data.user;
                }
            }

            const urlExist = await this._urlShortener.findOne({ where: { url: data.body.url, active: true } });
            if (urlExist) {
                return await this._httpException.responseHelper(400, `URL already exists, ${urlExist.urlShortener}`);
            }

            const newShortenedUrl = this._urlShortener.create({
                url: data.body.url,
                urlShortener: shortenedUrl,
                user: data?.user?.sub
            });

            await this._urlShortener.save(newShortenedUrl);

            return await this._httpException.responseHelper(201, 'Success');

        } catch (error) {
            console.error(error.message);
        }
    }

    async index(params) {
        try {
            const query = this._urlShortener.createQueryBuilder('url')
                .select([
                    'url.id',
                    'url.urlShortener',
                    'url.created_at',
                    'url.updated_at',
                    'url.clicks'
                ])
                .andWhere('url.active = true')
                .andWhere('url.urlShortener IS NOT NULL')
                .andWhere('url.urlShortener != \'\'')
                .orderBy('url.id', 'ASC');


            if (params?.user?.sub) {
                query.andWhere('url.user = :user', { user: params.user.sub });
            }

            return await this._httpException.responseHelper(200, await query.getMany());

        } catch (error) {
            console.error(error.message);
        }

    }

    async handleRedirect(params) {
        try {
            const existsURL = await this._urlShortener.findOne({ where: { urlShortener: params.url } });
            if (!existsURL) {
                return await this._httpException.responseHelper(404, `URL not found`);
            }

            existsURL.clicks += 1;
            await this._urlShortener.save(existsURL);

            return await this._httpException.responseHelper(200, {
                url: existsURL.url,
                click: existsURL.clicks
            });

        } catch (error) {
            console.error(error.message);
        }
    }

    async update(id, data) {
        try {
            const validate = await this._dtoValidatorService.validateBody(UrlShortenerDto, data.body);
            if (validate?.status === 400) {
                return await this._httpException.responseHelper(400, await validate.message);
            }

            const url: any = await this._urlShortener.findOne({ where: { id: id } });
            if (!url) {
                return await this._httpException.responseHelper(404, 'Update failed: Record not found.');
            }

            if (url?.active === false) {
                return await this._httpException.responseHelper(400, 'Update failed: The record has already been deleted.');
            }

            if (url.url === data.body.url) {
                return await this._httpException.responseHelper(400, 'Update failed: No changes detected.');
            }

            const urlExist = await this._urlShortener.findOne({ where: { url: data.body.url, active: true } });
            if (urlExist && urlExist.id != id) {
                return await this._httpException.responseHelper(400, `Update failed: URL already exists, ${urlExist.urlShortener}`);
            }

            const shortenedUrl = await generateShortUrl(data.body.url)
            url.version = url.version + 1

            const updatedUrl = {
                user: data?.user?.sub,
                url: data.body.url,
                urlShortener: shortenedUrl,
                updated_at: new Date(),
                version: url?.version
            }

            await this._urlShortener.update(id, updatedUrl);

            return await this._httpException.responseHelper(201, updatedUrl);

        } catch (error) {
            console.error(error.message);
        }
    }

    async delete(id, data) {
        try {

            const url: any = await this._urlShortener.findOne({ where: { id: id } });
            if (!url) {
                return await this._httpException.responseHelper(404, 'Delete failed: Record not found.');
            }

            if (url?.active === false) {
                return await this._httpException.responseHelper(400, 'Delete failed: The record has already been deleted.');
            }

            url.version = url.version + 1
            const deletedUrl: any = {
                user: data?.user?.sub,
                urlShortener: null,
                active: false,
                updated_at: new Date(),
                version: url?.version
            }

            await this._urlShortener.update(id, deletedUrl);

            return await this._httpException.responseHelper(201, deletedUrl);

        } catch (error) {
            console.error(error.message);
        }
    }
}