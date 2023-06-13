import Headers from '../Headers.js';
import InvalidResponse from './InvalidResponse.js';

export default class NotFoundResponse extends InvalidResponse {
    public static readonly HTTP_STATUS = 404;

    constructor(headers: Headers, data: unknown) {
        super(NotFoundResponse.HTTP_STATUS, headers, data);
    }
}
