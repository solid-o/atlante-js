import HttpMessage from './HttpMessage';

export default
interface Response<T = any> extends HttpMessage {
    readonly data: T;
    readonly status: number;
    readonly statusText: string;
}
