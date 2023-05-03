import axios from 'axios';
import { createRequest } from '../../lib/Requester/Request';

const Argument = Jymfony.Component.Testing.Argument.Argument;
const AxiosRequester = Solido.Atlante.Requester.AxiosRequester;
const BodyConverterDecorator = Solido.Atlante.Requester.Decorator.BodyConverterDecorator;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

const genericResponse = async (headers = {'Content-Type': 'application/json'}, statusCode = 200) => {
    return {
        data: '{}',
        headers,
        status: statusCode,
    };
};

export default class AxiosRequesterTest extends TestCase {
    /**
     * @type {Jymfony.Component.Testing.Prophecy.ObjectProphecy}
     */
    _axios;

    /**
     * @type {Solido.Atlante.Requester.AxiosRequester}
     */
    _requester;

    beforeEach() {
        this._axios = this.prophesize(axios.Axios);
        this._requester = new AxiosRequester(undefined, this._axios.reveal());
    }

    async testShouldSetContentTypeHeaderIfNotSet() {
        this._axios
            .request(Argument.that(request =>
                'application/json' === request.headers['Content-Type']
            ))
            .shouldBeCalled()
            .willReturn(genericResponse());

        await this._requester.request('POST', 'resource/subresource', {}, {test: 'foo'});
    }

    async testShouldNotSetContentTypeHeaderIfRequestIsEmpty() {
        this._axios
            .request(Argument.that(request =>
                'application/json' === request.headers['Content-Type']
            ))
            .shouldNotBeCalled();

        this._axios
            .request(Argument.any())
            .willReturn(genericResponse());

        await this._requester.request('GET', 'resource/subresource');
    }

    async testShouldNotSetContentTypeHeaderIfSet() {
        this._axios
            .request(Argument.that(request =>
                'application/octet-stream' === request.headers['Content-Type']
            ))
            .shouldBeCalled()
            .willReturn(genericResponse());

        await this._requester.request('GET', 'resource/subresource', { 'Content-Type': 'application/octet-stream' });
    }

    async testShouldParseResponseHeadersCorrectly() {
        this._axios
            .request(Argument.cetera())
            .shouldBeCalled()
            .willReturn(genericResponse({
                'Content-Type': 'application/octet-stream',
                Date: '12 Jan 2019 02:00:00 GMT',
            }));

        const response = await this._requester.request('GET', 'resource/subresource');
        __self.assertEquals('application/octet-stream', response.getHeaders().get('Content-Type'));
        __self.assertEquals('12 Jan 2019 02:00:00 GMT', response.getHeaders().get('Date'));
    }

    async testShouldReportStatusCodeCorrectly() {
        this._axios
            .request(Argument.cetera())
            .shouldBeCalled()
            .willReturn(genericResponse(undefined, 418, 'I\'m a teapot'));

        const response = await this._requester.request('GET', 'resource/subresource');
        __self.assertEquals(418, response.getStatusCode());
    }

    async testShouldWorkWithBodyConverterDecorator() {
        const request = createRequest('POST', 'http://www.example.org', null, { test: 'foo' });
        const decorator = new BodyConverterDecorator();

        const decorated = decorator.decorate(request);
        this._axios
            .request(Argument.that(request =>
                '{"test":"foo"}' === request.data
            ))
            .shouldBeCalled()
            .willReturn(genericResponse());

        await this._requester.request(decorated.method, decorated.url, decorated.headers, decorated.body);
    }
}
