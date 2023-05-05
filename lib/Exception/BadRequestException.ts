import AbstractException from './AbstractException';
import BadResponse from '../Requester/Response/BadResponse';
import BadResponsePropertyTree from '../Requester/Response/BadResponsePropertyTree';
import Request from '../Requester/Request';

export default
class BadRequestException extends AbstractException {
    constructor(response?: BadResponse, request?: Request) {
        super(response, request);
    }

    get response(): BadResponse {
        return super.response as BadResponse;
    }

    get request(): Request {
        return super.request;
    }

    get errors(): BadResponsePropertyTree {
        return this.response.getErrors();
    }
}
