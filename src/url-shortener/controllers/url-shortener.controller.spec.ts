import { UrlShortenerController } from './url-shortener.controller';
import { UrlShortenerService } from '../services/url-shortener.service';

describe('UrlShortenerController', () => {
    let controller: UrlShortenerController;
    let service: jest.Mocked<UrlShortenerService> | any;;

    beforeEach(() => {
        service = {
            store: jest.fn(),
            index: jest.fn(),
            handleRedirect: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as any;

        controller = new UrlShortenerController(service);
    });

    it('should call service.store with payload', async () => {
        const data = { url: 'https://example.com' };
        service.store.mockResolvedValue('mocked-response');

        const result = await controller.store(data);
        expect(service.store).toHaveBeenCalledWith(data);
        expect(result).toBe('mocked-response');
    });

    it('should call service.index with params', async () => {
        const params = { userId: '123' };
        service.index.mockResolvedValue(['mocked']);

        const result = await controller.index(params);
        expect(service.index).toHaveBeenCalledWith(params);
        expect(result).toEqual(['mocked']);
    });

    it('should call service.handleRedirect with params', async () => {
        const params = { hash: 'abc123' };
        service.handleRedirect.mockResolvedValue({ url: 'https://original.com' });

        const result = await controller.handleRedirect(params);
        expect(service.handleRedirect).toHaveBeenCalledWith(params);
        expect(result).toEqual({ url: 'https://original.com' });
    });

    it('should call service.update with id and data', async () => {
        const data = { id: '1', url: 'https://updated.com' };
        service.update.mockResolvedValue('updated');

        const result = await controller.update(data);
        expect(service.update).toHaveBeenCalledWith('1', data);
        expect(result).toBe('updated');
    });

    it('should call service.delete with id and data', async () => {
        const data = { id: '1', reason: 'duplicate' };
        service.delete.mockResolvedValue('deleted');

        const result = await controller.delete(data);
        expect(service.delete).toHaveBeenCalledWith('1', data);
        expect(result).toBe('deleted');
    });
});
