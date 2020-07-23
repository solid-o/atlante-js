import Request from '../Requester/Request';
import Response from '../Requester/Response';

export default
class HttpException extends Error {
    private readonly _request: Request | undefined;
    private readonly _response: Response | undefined;

    /**
     * Constructor.
     */
    constructor(message?: string, response?: Response | undefined, request?: Request | undefined) {
        super(message);

        this._request = request;
        this._response = response;
    }

    /**
     * Gets the request, if set.
     */
    get request(): Request | undefined {
        return this._request;
    }

    /**
     * Gets the response, if set.
     */
    get response(): Response | undefined {
        return this._response;
    }
}
