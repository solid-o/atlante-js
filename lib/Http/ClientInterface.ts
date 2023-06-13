import Headers from '../Requester/Headers.js';
import { ResponseInterface } from '../Requester/Response/ResponseInterface.js';

export interface ClientInterface {}
export class ClientInterface {
    /**
     * Performs a request to the API service using the given method.
     *
     * Request data should be either a string, an array or an object.
     * If not a string will be JSON-encoded.
     * The parameter is ignored on GET, HEAD and DELETE requests.
     *
     * In case of an error, the "error" event SHOULD be emitted.
     * If no handler has been registered the error MUST be thrown.
     *
     * @throws {NoTokenAvailableException} When no token could be provided for the request.
     */
    // @ts-ignore
    request(method: string, path: string, requestData?: any, headers?: Record<string, string> | Headers): Promise<ResponseInterface> { }

    /**
     * Performs a request to the API service using a GET method.
     */
    // @ts-ignore
    get(path: string, headers?: Record<string, string> | Headers): Promise<ResponseInterface> { }

    /**
     * Performs a request to the API service using a POST method.
     */
    // @ts-ignore
    post(path: string, requestData?: any, headers?: Record<string, string> | Headers): Promise<ResponseInterface> { }

    /**
     * Performs a request to the API service using a PUT method.
     */
    // @ts-ignore
    put(path: string, requestData?: any, headers?: Record<string, string> | Headers): Promise<ResponseInterface> { }

    /**
     * Performs a request to the API service using a PATCH method.
     */
    // @ts-ignore
    patch(path: string, requestData?: any, headers?: Record<string, string> | Headers): Promise<ResponseInterface> { }
}

export default getInterface(ClientInterface);
