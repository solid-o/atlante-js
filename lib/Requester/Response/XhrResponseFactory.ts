import AbstractResponseFactory from './AbstractResponseFactory';
import Headers from '../Headers';
import { ResponseInterface } from './ResponseInterface';

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
