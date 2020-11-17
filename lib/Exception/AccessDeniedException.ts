import AbstractException from './AbstractException';
import AccessDeniedResponse from '../Requester/Response/AccessDeniedResponse';

export default
class AccessDeniedException extends AbstractException {
    constructor(response?: AccessDeniedResponse) {
        super(response);
    }

    get response(): AccessDeniedResponse {
        return super.response as AccessDeniedResponse;
    }
}
