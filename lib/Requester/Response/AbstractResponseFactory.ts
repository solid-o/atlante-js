import IResponseFactory, { ResponseFactoryInterface } from './ResponseFactoryInterface.js';
import AccessDeniedResponse from './AccessDeniedResponse.js';
import BadResponse from './BadResponse.js';
import Headers from '../Headers.js';
import InvalidResponse from './InvalidResponse.js';
import NotFoundResponse from './NotFoundResponse.js';
import Response from './Response.js';
import { ResponseInterface } from './ResponseInterface.js';

export default
abstract class AbstractResponseFactory extends implementationOf(IResponseFactory) implements ResponseFactoryInterface {
    protected makeResponse(content: string, headers: Headers, statusCode: number): ResponseInterface {
        if (204 === statusCode) {
            return new Response(statusCode, headers, '');
        }

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

    protected decodeData(responseText: string, headers: Headers): unknown {
        const contentType = (headers.get('content-type') ?? 'text/html') as string;
        let data = responseText;

        if (contentType.match(/^application\/(?:.+\+)?json/)) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                // Do nothing
            }
        }

        return data;
    }

    abstract fromResponse(response: any): ResponseInterface;
}
