import Requester, { RequesterInterface } from './RequesterInterface';
import Headers from './Headers';
import Response from './Response';

export default
class WebRequester extends implementationOf(Requester) implements RequesterInterface {
    private readonly _xmlHttp: typeof XMLHttpRequest;

    /**
     * Constructor.
     */
    constructor(xmlHttp?: typeof XMLHttpRequest) {
        super();
        this._xmlHttp = xmlHttp;
    }

    /**
     * @inheritdoc
     */
    request<T = any>(method: string, path: string, headers: any = {}, requestData?: any): Promise<Response<T>> {
        const xmlHttp: XMLHttpRequest = new this._xmlHttp();
        let contentTypeSet = false;
        xmlHttp.open(method, path);

        for (const [ key, value ] of Object.entries(headers)) {
            xmlHttp.setRequestHeader(key, String(value));

            if ('content-type' === key.toLowerCase()) {
                contentTypeSet = true;
            }
        }

        if (! contentTypeSet) {
            xmlHttp.setRequestHeader('Content-Type', 'application/json');
        }

        return new Promise(resolve => {
            xmlHttp.onreadystatechange = () => {
                if(xmlHttp.readyState !== this._xmlHttp.DONE) {
                    return;
                }

                const headers = xmlHttp.getAllResponseHeaders()
                    .split('\r\n')
                    .reduce((res, val) => {
                        if (! val) {
                            return res;
                        }

                        const vals = val.split(': ');
                        return res.add(vals[0], vals[1]);
                    }, new Headers())
                ;

                let data = xmlHttp.responseText;
                if (((headers.get('content-type') || 'text/html') as string).match(/^application\/json/)) {
                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        // Do nothing
                    }
                }

                resolve({
                    status: xmlHttp.status,
                    statusText: xmlHttp.statusText,
                    headers: headers,
                    data: data as unknown as T,
                });
            };

            xmlHttp.send(requestData);
        });
    }
}
