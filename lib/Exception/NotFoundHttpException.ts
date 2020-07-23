import HttpException from './HttpException';
import Request from '../Requester/Request';
import Response from '../Requester/Response';

export default
class NotFoundHttpException extends HttpException {
    constructor(response?: Response, request?: Request) {
        super('Not found', response, request);
    }
}
