import Requester, { RequesterInterface } from './RequesterInterface';
import axios, { Method } from 'axios';
import AxiosResponseFactory from './Response/AxiosResponseFactory';
import { ResponseFactoryInterface } from './Response/ResponseFactoryInterface';
import { ResponseInterface } from './Response/ResponseInterface';

export default
class WebRequester extends implementationOf(Requester) implements RequesterInterface {
    private readonly _responseFactory: ResponseFactoryInterface;
    private readonly _requester: typeof axios;

    /**
     * Constructor.
     */
    constructor(responseFactory: ResponseFactoryInterface = new AxiosResponseFactory(), requester: typeof axios = axios) {
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

        if (! contentTypeSet) {
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
