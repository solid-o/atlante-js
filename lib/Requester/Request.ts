import Headers from './Headers';
import HttpMessage from './HttpMessage';

export default interface Request<T = any> extends HttpMessage {
    readonly method: string;
    readonly url: string;
    readonly body: T | undefined;
}

export const createRequest = <T = any>(
    method: string,
    url: string,
    headers: Headers | Record<string, string | string[]> | null = null,
    body?: T | undefined
): Request<T> => {
    return {
        method,
        url,
        headers: new Headers(headers),
        body,
    };
};
