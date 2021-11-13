import Requester, { RequesterInterface } from './RequesterInterface';
import { ResponseFactoryInterface } from './Response/ResponseFactoryInterface';
import { ResponseInterface } from './Response/ResponseInterface';
import XhrResponseFactory from './Response/XhrResponseFactory';

export default
class WebRequester extends implementationOf(Requester) implements RequesterInterface {
    private readonly _responseFactory: ResponseFactoryInterface;
    private readonly _xmlHttp: typeof XMLHttpRequest;

    /**
     * Constructor.
     */
    constructor(responseFactory: ResponseFactoryInterface = new XhrResponseFactory(), xmlHttp: typeof XMLHttpRequest = XMLHttpRequest) {
        super();
        this._responseFactory = responseFactory;
        this._xmlHttp = xmlHttp;
    }

    /**
     * @inheritdoc
     */
    request(method: string, path: string, headers: any = {}, requestData?: any): Promise<ResponseInterface> {
        const xmlHttp: XMLHttpRequest = new this._xmlHttp();
        let contentTypeSet = false;
        xmlHttp.open(method, path);

        if ('function' === typeof requestData) {
            requestData = requestData();
        }

        for (const [ key, value ] of Object.entries(headers)) {
            xmlHttp.setRequestHeader(key, String(value));

            if ('content-type' === key.toLowerCase()) {
                contentTypeSet = true;
            }
        }

        if (! contentTypeSet && requestData) {
            xmlHttp.setRequestHeader('Content-Type', 'application/json');
        }

        return new Promise(resolve => {
            xmlHttp.onreadystatechange = () => {
                if(xmlHttp.readyState !== this._xmlHttp.DONE) {
                    return;
                }

                resolve(this._responseFactory.fromResponse(xmlHttp));
            };

            xmlHttp.send(requestData);
        });
    }
}
