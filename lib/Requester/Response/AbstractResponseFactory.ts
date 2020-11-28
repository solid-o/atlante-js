import IResponseFactory, { ResponseFactoryInterface } from './ResponseFactoryInterface';
import AccessDeniedResponse from './AccessDeniedResponse';
import BadResponse from './BadResponse';
import Headers from '../Headers';
import InvalidResponse from './InvalidResponse';
import NotFoundResponse from './NotFoundResponse';
import Response from './Response';
import { ResponseInterface } from './ResponseInterface';

export default
abstract class AbstractResponseFactory extends implementationOf(IResponseFactory) implements ResponseFactoryInterface {
    protected makeResponse(content: string, headers: Headers, statusCode: number): ResponseInterface {
        const data = this.decodeData(content, headers);

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

    protected decodeData(responseText: string, headers: Headers) {
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
