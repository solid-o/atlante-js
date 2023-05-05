import AbstractException from './AbstractException';
import InvalidResponse from '../Requester/Response/InvalidResponse';
import Request from '../Requester/Request';

export default
class InvalidRequestException extends AbstractException {
    constructor(response?: InvalidResponse, request?: Request) {
        super(response, request);
    }

    get response(): InvalidResponse {
        return super.response as InvalidResponse;
    }

    get request(): Request {
        return super.request;
    }
}
