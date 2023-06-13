import Headers from '../Headers.js';
import InvalidResponse from './InvalidResponse.js';

export default class AccessDeniedResponse extends InvalidResponse {
    public static readonly HTTP_STATUS = 403;

    constructor(headers: Headers, data: unknown) {
        super(AccessDeniedResponse.HTTP_STATUS, headers, data);
    }
}
