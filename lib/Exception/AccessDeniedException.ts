import AbstractException from './AbstractException';
import AccessDeniedResponse from '../Requester/Response/AccessDeniedResponse';
import Request from '../Requester/Request';

export default
class AccessDeniedException extends AbstractException {
    constructor(response?: AccessDeniedResponse, request?: Request) {
        super(response, request);
    }

    get response(): AccessDeniedResponse {
        return super.response as AccessDeniedResponse;
    }
}
