import IResponseFactory, { ResponseFactoryInterface } from './ResponseFactoryInterface';
import AccessDeniedResponse from './AccessDeniedResponse';
import BadResponse from './BadResponse';
import Headers from '../Headers';
import InvalidResponse from './InvalidResponse';
import NotFoundResponse from './NotFoundResponse';
import Response from './Response';
import { ResponseInterface } from './ResponseInterface';

export default
class XhrResponseFactory extends implementationOf(IResponseFactory) implements ResponseFactoryInterface {
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

        const data = XhrResponseFactory.decodeData(response.responseText, headers);
        const statusCode = response.status;

        if (Array.isArray(data) || isObjectLiteral(data)) {
            if (300 > statusCode && 200 <= statusCode) {
                return new Response(statusCode, headers, data);
            }

            switch (statusCode) {
                case 400:
                    return new BadResponse(headers, data);

                case 403:
                    return new AccessDeniedResponse(headers, data);

                case 404:
                    return new NotFoundResponse(headers, data);
            }
        }

        return new InvalidResponse(statusCode, headers, data);
    }

    private static decodeData(responseText: string, headers: Headers) {
        let data = responseText;
        if (((headers.get('content-type') || 'text/html') as string).match(/^application\/json/)) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                // Do nothing
            }
        }

        return data;
    }
}
