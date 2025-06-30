import { UrlShortenerService } from './url-shortener.service';
import { Repository } from 'typeorm';
import { UrlShortener } from '../../schema/url-shortener.entity';
import { User } from '../../schema/user.entity';
import { DtoValidatorService } from '../../common/validations/dto-validator.service';
import { HttpException } from '../../common/exceptions/http-exception';
import { generateShortUrl } from '../../common/utils/url-shortener.util';

jest.mock('../../common/utils/url-shortener.util', () => ({
    generateShortUrl: jest.fn().mockReturnValue('https://short.ly/mockhash'),
}));

describe('UrlShortenerService', () => {
    let service: UrlShortenerService | any;
    let userRepo: jest.Mocked<Repository<User>> | any;
    let urlRepo: jest.Mocked<Repository<UrlShortener>> | any;
    let validator: jest.Mocked<DtoValidatorService> | any;
    let httpException: jest.Mocked<HttpException> | any;

    beforeEach(() => {
        userRepo = {
            findOne: jest.fn(),
        } as any;

        urlRepo = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([]),
            }),
        } as any;

        validator = {
            validateBody: jest.fn(),
        } as any;

        httpException = {
            responseHelper: jest.fn((status, message) => ({ status, message })),
        } as any;

        service = new UrlShortenerService(userRepo, urlRepo, httpException, validator);
    });

    describe('store', () => {
        it('should return 400 if DTO invalid', async () => {
            validator.validateBody.mockResolvedValue({ status: 400, message: 'Invalid' });
            const result = await service.store({ body: { url: '' } });
            expect(result.status).toBe(400);
        });

        it('should return 400 if URL already exists', async () => {
            validator.validateBody.mockResolvedValue(undefined);
            urlRepo.findOne.mockResolvedValue({ urlShortener: 'exists' } as UrlShortener);
            const result = await service.store({ body: { url: 'https://test.com' } });
            expect(result.status).toBe(400);
        });

        it('should save URL if valid', async () => {
            validator.validateBody.mockResolvedValue(undefined);
            urlRepo.findOne.mockResolvedValue(null);
            userRepo.findOne.mockResolvedValue({ id: 1 } as User);
            urlRepo.create.mockReturnValue({} as UrlShortener);

            const result = await service.store({ body: { url: 'https://test.com' }, user: { sub: 1 } });
            expect(urlRepo.save).toHaveBeenCalled();
            expect(result.status).toBe(201);
        });
    });

    describe('index', () => {
        it('should return 200 with URL list', async () => {
            const result = await service.index({ user: { sub: 1 } });
            expect(result.status).toBe(200);
            expect(Array.isArray(result.message)).toBe(true);
        });
    });

    describe('handleRedirect', () => {
        it('should return 404 if URL not found', async () => {
            urlRepo.findOne.mockResolvedValue(null);
            const result = await service.handleRedirect({ url: 'abc123' });
            expect(result.status).toBe(404);
        });

        it('should return 200 with URL and increment click', async () => {
            const url = { url: 'https://test.com', clicks: 0 } as UrlShortener;
            urlRepo.findOne.mockResolvedValue(url);
            urlRepo.save.mockResolvedValue(undefined);
            const result = await service.handleRedirect({ url: 'abc123' });
            expect(result.status).toBe(200);
        });
    });

    describe('update', () => {
        it('should return 404 if URL not found', async () => {
            validator.validateBody.mockResolvedValue(undefined);
            urlRepo.findOne.mockResolvedValueOnce(null);
            const result = await service.update(1, { body: { url: 'new' } });
            expect(result.status).toBe(404);
        });

        it('should return 400 if no changes detected', async () => {
            validator.validateBody.mockResolvedValue(undefined);
            urlRepo.findOne.mockResolvedValueOnce({ id: 1, url: 'same', active: true } as UrlShortener);
            const result = await service.update(1, { body: { url: 'same' } });
            expect(result.status).toBe(400);
        });
    });

    describe('delete', () => {
        it('should return 404 if URL not found', async () => {
            urlRepo.findOne.mockResolvedValue(null);
            const result = await service.delete(1, {});
            expect(result.status).toBe(404);
        });

        it('should return 400 if already deleted', async () => {
            urlRepo.findOne.mockResolvedValue({ active: false } as UrlShortener);
            const result = await service.delete(1, {});
            expect(result.status).toBe(400);
        });

        it('should delete and return 201 if valid', async () => {
            urlRepo.findOne.mockResolvedValue({ active: true, version: 0 } as UrlShortener);
            const result = await service.delete(1, { user: { sub: 1 } });
            expect(urlRepo.update).toHaveBeenCalled();
            expect(result.status).toBe(201);
        });
    });
});