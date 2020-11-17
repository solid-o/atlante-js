import IResponse, { ResponseInterface } from './ResponseInterface';
import Headers from '../Headers';

export default
abstract class AbstractResponse extends implementationOf(IResponse) implements ResponseInterface {
    constructor(protected statusCode: number, protected headers: Headers, protected data: unknown) {
        super();
    }

    getData<T>(): T;
    getData(): unknown[] | Record<string, unknown> | string {
        return this.data as any;
    }

    getHeaders(): Headers {
        return this.headers;
    }

    getStatusCode(): number {
        return this.statusCode;
    }
}
