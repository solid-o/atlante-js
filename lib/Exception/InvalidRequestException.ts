import AbstractException from './AbstractException';
import InvalidResponse from '../Requester/Response/InvalidResponse';

export default
class InvalidRequestException extends AbstractException {
    constructor(response?: InvalidResponse) {
        super(response);
    }

    get response(): InvalidResponse {
        return super.response as InvalidResponse;
    }
}
