import AbstractException from './AbstractException.js';
import BadResponse from '../Requester/Response/BadResponse.js';
import BadResponsePropertyTree from '../Requester/Response/BadResponsePropertyTree.js';
import Request from '../Requester/Request.js';

export default
class BadRequestException extends AbstractException {
    constructor(response?: BadResponse, request?: Request) {
        super(response, request);
    }

    get response(): BadResponse {
        return super.response as BadResponse;
    }

    get errors(): BadResponsePropertyTree {
        return this.response.getErrors();
    }
}
