import { ResponseInterface } from './Response/ResponseInterface.js';

export interface RequesterInterface { }
export class RequesterInterface {
    /**
     * Performs a request.
     * Returns a response with parsed data, if no error is present.
     */
    // @ts-ignore
    request(method: string, path: string, headers?: any, requestData?: any): Promise<ResponseInterface> { }
}

export default getInterface(RequesterInterface);
