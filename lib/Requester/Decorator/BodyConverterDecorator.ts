import Decorator, { DecoratorInterface } from './DecoratorInterface';
import Request from '../Request';

const isBlob = 'undefined' !== typeof Blob ? v => v instanceof Blob : () => false;

export default
class BodyConverterDecorator extends implementationOf(Decorator) implements DecoratorInterface {
    /**
     * Converts the body to json if it is a js object.
     */
    decorate(request: Request<any>): Request<any> {
        let { body = null, method, url, headers } = request;
        if (body && 'string' !== typeof body && ! isBlob(body)) {
            const originalBody = body;
            body = () => {
                let body = this._prepare(originalBody);
                if (undefined !== body[Symbol.iterator] || isObjectLiteral(body)) {
                    body = BodyConverterDecorator._encodeIterable(body, headers);
                }

                return body;
            };
        }

        return { body, method, url, headers };
    }


    /**
     * @private
     */
    static _encodeIterable(body, headers) {
        let contentType = headers.get('content-type');

        // Add content-type if not specified
        if (contentType === undefined) {
            contentType = 'application/json';
            headers.set('content-type', contentType);
        }

        if (contentType.match(/^application\/json/)) {
            body = JSON.stringify(body);
        } else if (contentType.match(/^application\/x-www-form-urlencoded/)) {
            const p = {};
            const encodeParams = (iterable, prefix = null) => {
                for (const [ k, v ] of Object.entries(iterable)) {
                    const key = null === prefix ? k : prefix + '[' + k + ']';
                    if (Array.isArray(v) || isObjectLiteral(v)) {
                        encodeParams(v, key);
                    } else {
                        p[key] = v;
                    }
                }
            };

            encodeParams(body);
            body = (new URLSearchParams(p)).toString();
        } else {
            throw new UnexpectedValueException(`Unable to convert Request content body: expected "application/json" or "application/x-www-form-urlencoded" \`content-type\` header, "${contentType}" given`);
        }

        return body;
    }

    _prepare(body) {
        if (undefined === body || null === body || 'string' === typeof body) {
            return body;
        }

        if (isFunction(body)) {
            return this._prepare(body());
        }

        if (body[Symbol.iterator]) {
            const iterated = [];
            for (const field of body) {
                iterated.push(this._prepare(field));
            }

            return iterated;
        } else if (isObjectLiteral(body)) {
            const iterated = {};
            for (const [ k, field ] of Object.entries(body)) {
                iterated[k] = this._prepare(field);
            }

            return iterated;
        }

        throw new InvalidArgumentException('Argument #1 passed to BodyConverterDecorator._prepare has to be null, string, Blob, iterable or function, "' + typeof body + '" given');
    }
}
