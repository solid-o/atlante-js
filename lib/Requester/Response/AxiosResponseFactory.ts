import AbstractResponseFactory from './AbstractResponseFactory';
import { AxiosResponse } from 'axios';
import Headers from '../Headers';
import { ResponseInterface } from './ResponseInterface';

export default
class AxiosResponseFactory extends AbstractResponseFactory {
    fromResponse(response: AxiosResponse): ResponseInterface {
        return this.makeResponse(
            response.data,
            new Headers(response.headers),
            response.status
        );
    }
}
