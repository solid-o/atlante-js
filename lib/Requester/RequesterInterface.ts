import Response from './Response';

export class RequesterInterface {
    /**
     * Performs a request.
     * Returns a response with parsed data, if no error is present.
     */
    // @ts-ignore
    request<T = any>(method: string, path: string, headers?: any, requestData?: any): Promise<Response<T>> { }
}
export interface RequesterInterface { }

export default getInterface(RequesterInterface);
