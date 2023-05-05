import AbstractException from './AbstractException';
import NotFoundResponse from '../Requester/Response/NotFoundResponse';
import Request from '../Requester/Request';

export default
class NotFoundException extends AbstractException {
    constructor(response?: NotFoundResponse, request?: Request) {
        super(response, request);
    }

    get response(): NotFoundResponse {
        return super.response as NotFoundResponse;
    }

    get request(): Request {
        return super.request;
    }
}
