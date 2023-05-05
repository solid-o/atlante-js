import Request from '../Requester/Request';
import { ResponseInterface } from '../Requester/Response/ResponseInterface';

export default
class AbstractException extends Error {
    private readonly _response: ResponseInterface;
    private readonly _request: Request;

    /**
     * Constructor.
     */
    constructor(response: ResponseInterface | undefined, request: Request | undefined, message?: string) {
        super(message ?? ('Unsuccessful response received. Status code = ' + response.getStatusCode()));
        this._response = response;
        this._request = request;
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
    get request(): Request {
        return this._request;
    }
}
