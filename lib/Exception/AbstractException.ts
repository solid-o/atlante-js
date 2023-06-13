import Request from '../Requester/Request.js';
import { ResponseInterface } from '../Requester/Response/ResponseInterface.js';

export default
class AbstractException extends Error {
    private readonly _response: ResponseInterface;
    private readonly _request: Request;

    /**
     * Constructor.
     */
    constructor(response: ResponseInterface, message?: string);
    constructor(response: ResponseInterface, request: Request | undefined, message?: string);
    constructor(response: ResponseInterface, requestOrMessage: Request | string | undefined, message?: string) {
        message = isString(requestOrMessage) ? requestOrMessage : message;
        super(message ?? ('Unsuccessful response received. Status code = ' + response.getStatusCode()));
        this._response = response;
        this._request = isObject(requestOrMessage) ? requestOrMessage : undefined;
    }

    /**
     * Gets the response, if set.
     */
    get response(): ResponseInterface {
        return this._response;
    }

    /**
     * Gets the request, if set.
     */
    get request(): Request | undefined {
        return this._request;
    }
}
