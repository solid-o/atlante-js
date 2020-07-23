import HttpMessage from "./HttpMessage";

export default
interface Request<T = any> extends HttpMessage {
    readonly body: T | undefined;
    readonly method: string;
    readonly url: string;
}
