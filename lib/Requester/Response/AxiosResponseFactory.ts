import AbstractResponseFactory from './AbstractResponseFactory.js';
import { AxiosResponse } from 'axios';
import Headers from '../Headers.js';
import { ResponseInterface } from './ResponseInterface.js';

export default
class AxiosResponseFactory extends AbstractResponseFactory {
    fromResponse(response: AxiosResponse): ResponseInterface {
        return this.makeResponse(
            response.data,
            new Headers(response.headers as unknown as Record<string, string | string[]>),
            response.status
        );
    }
}
