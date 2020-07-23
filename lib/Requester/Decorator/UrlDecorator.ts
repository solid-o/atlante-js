import Decorator, { DecoratorInterface } from "./DecoratorInterface";
import Request from "../Request";

export default
class UrlDecorator extends implementationOf(Decorator) implements DecoratorInterface {
    private readonly _baseUrl: string;

    /**
     * Constructor.
     */
    constructor(baseUrl: string) {
        super();
        this._baseUrl = baseUrl;
    }

    /**
     * @inheritdoc
     */
    decorate(request: Request<any>): Request<any> {
        let { body = undefined, method, url, headers } = request;
        if (-1 === url.indexOf('://')) {
            const parsedUrl = new URL(url, this._baseUrl);
            url = parsedUrl.href;
        }

        return { body, method, url, headers };
    }
}
