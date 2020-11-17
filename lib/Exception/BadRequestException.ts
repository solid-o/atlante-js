import AbstractException from './AbstractException';
import BadResponse from '../Requester/Response/BadResponse';
import BadResponsePropertyTree from '../Requester/Response/BadResponsePropertyTree';

export default
class BadRequestException extends AbstractException {
    constructor(response?: BadResponse) {
        super(response);
    }

    get response(): BadResponse {
        return super.response as BadResponse;
    }

    get errors(): BadResponsePropertyTree {
        return this.response.getErrors();
    }
}
