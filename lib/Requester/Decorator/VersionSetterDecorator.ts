import Decorator, { DecoratorInterface } from './DecoratorInterface.js';
import Accept from '../Header/Accept.js';
import Headers from '../Headers.js';
import Request from '../Request.js';

export default
class VersionSetterDecorator extends implementationOf(Decorator) implements DecoratorInterface {
    private readonly _version: string;

    /**
     * Constructor.
     */
    constructor(version: string) {
        super();
        this._version = version;
    }

    /**
     * Decorates the request.
     */
    decorate(request: Request<any>): Request<any> {
        const { body = undefined, method, url, headers: oldHeaders } = request;

        const headers = new Headers(oldHeaders.all);
        const header = headers.get('Accept') ?? new Accept('application/json');
        header.setParameter('version', this._version);
        headers.set('Accept', header);

        return { body, method, url, headers };
    }
}
