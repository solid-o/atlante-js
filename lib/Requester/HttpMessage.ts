import Headers from './Headers';

export default
interface HttpMessage<T = any> {
    readonly headers: Headers;
}
