import Request from '../Request.js';

export class DecoratorInterface {
    /**
     * Decorates the request object adding/removing headers,
     * authenticating the request, etc.
     */
    // @ts-ignore
    decorate<T = any>(request: Request<T>): Request<T> | Promise<Request<T>> { }
}

export interface DecoratorInterface {}
export default getInterface(DecoratorInterface);
