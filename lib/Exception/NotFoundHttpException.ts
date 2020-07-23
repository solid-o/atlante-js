import HttpException from "./HttpException";
import Response from "../Requester/Response";
import Request from "../Requester/Request";

export default
class NotFoundHttpException extends HttpException {
    constructor(response?: Response, request?: Request) {
        super('Not found', response, request);
    }
}
