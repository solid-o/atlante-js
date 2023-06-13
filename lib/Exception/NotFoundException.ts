import AbstractException from './AbstractException.js';
import NotFoundResponse from '../Requester/Response/NotFoundResponse.js';
import Request from '../Requester/Request.js';

export default
class NotFoundException extends AbstractException {
    constructor(response?: NotFoundResponse, request?: Request) {
        super(response, request);
    }

    get response(): NotFoundResponse {
        return super.response as NotFoundResponse;
    }
}
