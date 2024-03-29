import '@jymfony/util/lib/global-this.js';
// @ts-ignore
globalThis.__jymfony = globalThis.__jymfony || {};

import '@jymfony/exceptions';
import '@jymfony/util/lib/mixins.js';
import '@jymfony/util/lib/Platform.js';
import '@jymfony/util/lib/is.js';

import Interface, { ClientInterface } from './ClientInterface.js';
import AccessDeniedException from '../Exception/AccessDeniedException.js';
import AccessDeniedResponse from '../Requester/Response/AccessDeniedResponse.js';
import BadRequestException from '../Exception/BadRequestException.js';
import BadResponse from '../Requester/Response/BadResponse.js';
import { DecoratorInterface } from '../Requester/Decorator/DecoratorInterface.js';
import Headers from '../Requester/Headers.js';
import InvalidRequestException from '../Exception/InvalidRequestException.js';
import InvalidResponse from '../Requester/Response/InvalidResponse.js';
import NotFoundException from '../Exception/NotFoundException.js';
import NotFoundResponse from '../Requester/Response/NotFoundResponse.js';
import Request from '../Requester/Request.js';
import { RequesterInterface } from '../Requester/RequesterInterface.js';
import { ResponseInterface } from '../Requester/Response/ResponseInterface.js';

export default
class Client extends implementationOf(Interface) implements ClientInterface {
    protected _decorators: DecoratorInterface[];
    protected _requester: RequesterInterface;

    /**
     * Constructor.
     *
     * @param requester Object which performs http requests.
     * @param [requestDecorators = []] Decorators to apply to the request.
     */
    constructor(requester: RequesterInterface, requestDecorators?: DecoratorInterface[]) {
        super();
        this._requester = requester;
        this._decorators = requestDecorators;
    }

    /**
     * @inheritdoc
     */
    get(path: string, headers?: Record<string, string> | Headers): Promise<ResponseInterface> {
        return this.request('GET', path, null, headers);
    }

    /**
     * @inheritdoc
     */
    post(path: string, requestData?: any, headers?: Record<string, string> | Headers): Promise<ResponseInterface> {
        return this.request('POST', path, requestData, headers);
    }

    /**
     * @inheritdoc
     */
    put(path: string, requestData?: any, headers?: Record<string, string> | Headers): Promise<ResponseInterface> {
        return this.request('PUT', path, requestData, headers);
    }

    /**
     * @inheritdoc
     */
    patch(path: string, requestData?: any, headers?: Record<string, string> | Headers): Promise<ResponseInterface> {
        return this.request('PATCH', path, requestData, headers);
    }

    /**
     * @inheritdoc
     */
    async request(method: string, path: string, requestData?: any, headers?: Record<string, string> | Headers): Promise<ResponseInterface> {
        if ('GET' === method || 'HEAD' === method || 'DELETE' === method) {
            requestData = undefined;
        }

        if (! (headers instanceof Headers)) {
            headers = new Headers(headers);
        }

        headers.set('Accept', 'application/json');

        let request: Request = {
            body: requestData,
            method,
            url: path,
            headers,
        };

        for (const decorator of this._decorators) {
            request = await decorator.decorate(request);
        }

        const response = await this._requester.request(request.method, request.url, request.headers.all, request.body);
        this._filterResponse(response, request);

        return response;
    }

    /**
     * Filters a response, eventually throwing an error in case response status is not successful.
     */
    protected _filterResponse(response: ResponseInterface, request: Request): void {
        switch (true) {
            case response instanceof BadResponse:
                throw new BadRequestException(response as BadResponse, request);

            case response instanceof AccessDeniedResponse:
                throw new AccessDeniedException(response as AccessDeniedResponse, request);

            case response instanceof NotFoundResponse:
                throw new NotFoundException(response as NotFoundResponse, request);

            case response instanceof InvalidResponse:
                throw new InvalidRequestException(response as InvalidResponse, request);
        }
    }
}
