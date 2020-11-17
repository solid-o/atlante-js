import { ResponseInterface } from './ResponseInterface';

export interface ResponseFactoryInterface {}
export class ResponseFactoryInterface {
    // @ts-ignore
    fromResponse(response: any): ResponseInterface { }
}

export default getInterface(ResponseFactoryInterface);
