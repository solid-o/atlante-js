import AbstractResponseFactory from './AbstractResponseFactory.js';
import Headers from '../Headers.js';
import { ResponseInterface } from './ResponseInterface.js';

export default
class XhrResponseFactory extends AbstractResponseFactory {
    fromResponse(response: XMLHttpRequest): ResponseInterface {
        const headers = response.getAllResponseHeaders()
            .split('\r\n')
            .reduce((res, val) => {
                if (! val) {
                    return res;
                }

                const vals = val.split(': ');
                return res.add(vals[0], vals[1]);
            }, new Headers())
        ;

        return this.makeResponse(response.responseText, headers, response.status);
    }
}
