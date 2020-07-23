import Request from "../Request";

export interface DecoratorInterface { }
export class DecoratorInterface {
    /**
     * Decorates the request object adding/removing headers,
     * authenticating the request, etc.
     */
    // @ts-ignore
    decorate<T = any>(request: Request<T>): Request<T> | Promise<Request<T>> { }
}

export default getInterface(DecoratorInterface);
