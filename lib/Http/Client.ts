import "@jymfony/util/lib/Async/Mutex";
import "@jymfony/util/lib/Platform";
import "@jymfony/util/lib/is";
import "@jymfony/util/lib/Object/filter";

import ClientInterface from "./ClientInterface";
import { DecoratorInterface } from "../Requester/Decorator/DecoratorInterface";
import Headers from "../Requester/Headers";
import HttpException from "../Exception/HttpException";
import NotFoundHttpException from "../Exception/NotFoundHttpException";
import Request from "../Requester/Request";
import { RequesterInterface } from "../Requester/RequesterInterface";
import Response from "../Requester/Response";

export default
class Client implements ClientInterface {
    protected _decorators: DecoratorInterface[];
    protected _requester: RequesterInterface;

    /**
     * Constructor.
     *
     * @param requester Object which performs http requests.
     * @param [requestDecorators = []] Decorators to apply to the request.
     */
    constructor(requester: RequesterInterface, requestDecorators?: DecoratorInterface[]) {
        this._requester = requester;
        this._decorators = requestDecorators;
    }

    /**
     * @inheritdoc
     */
    get<T = any>(path: string, headers?: {}): Promise<Response<T>> {
        return this.request('GET', path, null, headers);
    }

    /**
     * @inheritdoc
     */
    post<T = any>(path: string, requestData?: any, headers?: {}): Promise<Response<T>> {
        return this.request('POST', path, requestData, headers);
    }

    /**
     * @inheritdoc
     */
    put<T = any>(path: string, requestData?: any, headers?: {}): Promise<Response<T>> {
        return this.request('PUT', path, requestData, headers);
    }

    /**
     * @inheritdoc
     */
    patch<T = any>(path: string, requestData?: any, headers?: {}): Promise<Response<T>> {
        return this.request('PATCH', path, requestData, headers);
    }

    /**
     * @inheritdoc
     */
    async request<T = any>(method: string, path: string, requestData?: any, headers?: Record<string, string> | Headers): Promise<Response<T>> {
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
        this._filterResponse(request, response);

        return response;
    }

    /**
     * Filters a response, eventually throwing an error in case response status is not successful.
     */
    protected _filterResponse(request: Request, response: Response): void {
        if (200 <= response.status && 300 > response.status) {
            return;
        }

        switch (response.status) {
            case 404:
                throw new NotFoundHttpException(response, request);

            case 400:
            case 401:
            case 403:
            default:
                throw new HttpException(response.statusText, response, request);
        }
    }
}
