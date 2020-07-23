import Request from '../Request';
import Decorator, { DecoratorInterface } from "./DecoratorInterface";

export default
class BodyConverterDecorator extends implementationOf(Decorator) implements DecoratorInterface {
    /**
     * Converts the body to json if it is a js object.
     */
    decorate(request: Request<any>): Request<any> {
        let { body = null, method, url, headers } = request;
        if (body && 'string' !== typeof body && ! (undefined !== Blob && body instanceof Blob)) {
            body = JSON.stringify(body);

            if (! headers.has('Content-Type')) {
                headers.set('Content-Type', 'application/json');
            }
        }

        return { body, method, url, headers };
    }
}
