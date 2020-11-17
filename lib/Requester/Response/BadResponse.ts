import BadResponsePropertyTree from './BadResponsePropertyTree';
import Headers from '../Headers';
import InvalidResponse from './InvalidResponse';

export default class BadResponse extends InvalidResponse {
    public static readonly HTTP_STATUS = 400;
    protected data: BadResponsePropertyTree;

    constructor(headers: Headers, data: unknown) {
        data = BadResponsePropertyTree.parse(data);

        super(BadResponse.HTTP_STATUS, headers, data);
    }

    /**
     * Alias of getData().
     */
    getErrors(): BadResponsePropertyTree {
        return this.getData();
    }

    getData<T>(): never;
    getData(): BadResponsePropertyTree {
        return super.getData();
    }
}
