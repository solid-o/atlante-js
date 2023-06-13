import Requester, { RequesterInterface } from './RequesterInterface.js';
import axios, { AxiosInstance, AxiosStatic, Method } from 'axios';
import AxiosResponseFactory from './Response/AxiosResponseFactory.js';
import { ResponseFactoryInterface } from './Response/ResponseFactoryInterface.js';
import { ResponseInterface } from './Response/ResponseInterface.js';

export default
class AxiosRequester extends implementationOf(Requester) implements RequesterInterface {
    private readonly _responseFactory: ResponseFactoryInterface;
    private readonly _requester: AxiosStatic | AxiosInstance;

    /**
     * Constructor.
     */
    constructor(responseFactory: ResponseFactoryInterface = new AxiosResponseFactory(), requester: AxiosStatic | AxiosInstance = axios) {
        super();
        this._responseFactory = responseFactory;
        this._requester = requester;
    }

    /**
     * @inheritdoc
     */
    async request(method: string, path: string, headers: any = {}, requestData?: any): Promise<ResponseInterface> {
        if ('function' === typeof requestData) {
            requestData = requestData();
        }

        let contentTypeSet = false;
        for (const key of Object.keys(headers)) {
            if ('content-type' === key.toLowerCase()) {
                contentTypeSet = true;
            }
        }

        if (! contentTypeSet && requestData) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await this._requester.request({
            method: method as Method,
            url: path,
            data: requestData,
            headers,
            responseType: 'text',
        });

        return this._responseFactory.fromResponse(response);
    }
}
