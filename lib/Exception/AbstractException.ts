import { ResponseInterface } from '../Requester/Response/ResponseInterface';

export default
class AbstractException extends Error {
    private readonly _response: ResponseInterface;

    /**
     * Constructor.
     */
    constructor(response: ResponseInterface | undefined, message?: string) {
        super(message ?? ('Unsuccessful response received. Status code = ' + response.getStatusCode()));
        this._response = response;
    }

    /**
     * Gets the response, if set.
     */
    get response(): ResponseInterface {
        return this._response;
    }
}
