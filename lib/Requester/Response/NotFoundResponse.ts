import Headers from '../Headers';
import InvalidResponse from './InvalidResponse';

export default class NotFoundResponse extends InvalidResponse {
    public static readonly HTTP_STATUS = 404;

    constructor(headers: Headers, data: unknown) {
        super(NotFoundResponse.HTTP_STATUS, headers, data);
    }
}
