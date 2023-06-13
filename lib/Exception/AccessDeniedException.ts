import AbstractException from './AbstractException.js';
import AccessDeniedResponse from '../Requester/Response/AccessDeniedResponse.js';
import Request from '../Requester/Request.js';

export default
class AccessDeniedException extends AbstractException {
    constructor(response?: AccessDeniedResponse, request?: Request) {
        super(response, request);
    }

    get response(): AccessDeniedResponse {
        return super.response as AccessDeniedResponse;
    }
}
