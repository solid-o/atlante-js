import AbstractException from './AbstractException';
import NotFoundResponse from '../Requester/Response/NotFoundResponse';

export default
class NotFoundException extends AbstractException {
    constructor(response?: NotFoundResponse) {
        super(response);
    }

    get response(): NotFoundResponse {
        return super.response as NotFoundResponse;
    }
}
