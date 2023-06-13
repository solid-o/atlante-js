import BadResponsePropertyTree from './BadResponsePropertyTree.js';
import Headers from '../Headers.js';
import InvalidResponse from './InvalidResponse.js';

export default class BadResponse extends InvalidResponse {
    public static readonly HTTP_STATUS = 400;
    protected errors: BadResponsePropertyTree;

    constructor(headers: Headers, data: unknown) {
        let errors: BadResponsePropertyTree = null;
        try {
            errors = BadResponsePropertyTree.parse(data);
        } catch (e) {
            if (! (e instanceof globalThis.InvalidArgumentException)) {
                throw e;
            }
        }

        super(BadResponse.HTTP_STATUS, headers, errors ?? data);
        this.errors = errors;
    }

    /**
     * If errors property tree is returned, this method is an alias of getData()
     * otherwise will return null.
     */
    getErrors(): null | BadResponsePropertyTree {
        return this.errors;
    }

    getData<T>(): never;
    getData(): unknown[] | Record<string, unknown> | BadResponsePropertyTree {
        return super.getData();
    }
}
