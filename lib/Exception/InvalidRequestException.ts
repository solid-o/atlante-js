import AbstractException from './AbstractException.js';
import InvalidResponse from '../Requester/Response/InvalidResponse.js';
import Request from '../Requester/Request.js';

export default
class InvalidRequestException extends AbstractException {
    constructor(response?: InvalidResponse, request?: Request) {
        super(response, request);
    }

    get response(): InvalidResponse {
        return super.response as InvalidResponse;
    }
}
