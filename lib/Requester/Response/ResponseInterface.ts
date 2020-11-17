import Headers from '../Headers';

export interface ResponseInterface {}
export class ResponseInterface {
    /**
     * Returns the API response content.
     */
    getData<T>(): T;
    // @ts-ignore
    getData(): unknown[] | Record<string, unknown> | string { }

    /**
     * Gets the HTTP headers received in the response.
     */
    // @ts-ignore
    getHeaders(): Headers { }

    /**
     * Gets the HTTP status code of the response.
     */
    // @ts-ignore
    getStatusCode(): number { }
}

export default getInterface(ResponseInterface);
