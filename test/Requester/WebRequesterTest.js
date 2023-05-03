import { createRequest } from '../../lib/Requester/Request';

const Argument = Jymfony.Component.Testing.Argument.Argument;
const BodyConverterDecorator = Solido.Atlante.Requester.Decorator.BodyConverterDecorator;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;
const WebRequester = Solido.Atlante.Requester.WebRequester;
const XMLHttpRequest = Solido.Atlante.Stubs.XmlHttpRequest;

export default class WebRequesterTest extends TestCase {
    /**
     * @type {Jymfony.Component.Testing.Prophecy.ObjectProphecy|Solido.Atlante.Stubs.XMLHttpRequest}
     */
    _xmlHttp;

    /**
     * @type {Solido.Atlante.Requester.WebRequester}
     */
    _requester;

    beforeEach() {
        const xmlHttp = this._xmlHttp = this.prophesize(XMLHttpRequest);

        // Base methods.
        this._xmlHttp.open(Argument.cetera()).willReturn();
        this._xmlHttp.setRequestHeader(Argument.cetera()).willReturn();
        this._xmlHttp.getAllResponseHeaders(Argument.cetera()).willReturn('');
        this._xmlHttp.send(Argument.cetera()).will(function () {
            const o = this.reveal();
            o.readyState = XMLHttpRequest.DONE;
            o.onreadystatechange();
        });

        const construct = function () {
            return xmlHttp.reveal();
        };
        construct.DONE = XMLHttpRequest.DONE;

        this._requester = new WebRequester(undefined, construct);
    }

    async testShouldSetContentTypeHeaderIfNotSet() {
        this._xmlHttp.setRequestHeader('Content-Type', 'application/json').shouldBeCalled();
        await this._requester.request('POST', 'resource/subresource', {}, {test: 'foo'});
    }

    async testShouldNotSetContentTypeHeaderIfRequestDataIsEmpty() {
        this._xmlHttp.setRequestHeader('Content-Type', 'application/json').shouldNotBeCalled();
        await this._requester.request('GET', 'resource/subresource');
    }

    async testShouldNotSetContentTypeHeaderIfSet() {
        this._xmlHttp.setRequestHeader('Content-Type', 'application/json').shouldNotBeCalled();
        this._xmlHttp.setRequestHeader('Content-Type', 'application/octet-stream').shouldBeCalled();

        await this._requester.request('GET', 'resource/subresource', { 'Content-Type': 'application/octet-stream' });
    }

    async testShouldParseResponseHeadersCorrectly() {
        this._xmlHttp.getAllResponseHeaders(Argument.cetera())
            .willReturn('Content-Type: application/octet-stream\r\nDate: 12 Jan 2019 02:00:00 GMT\r\n');

        const response = await this._requester.request('GET', 'resource/subresource');
        __self.assertEquals('application/octet-stream', response.getHeaders().get('Content-Type'));
        __self.assertEquals('12 Jan 2019 02:00:00 GMT', response.getHeaders().get('Date'));
    }

    async testShouldReportStatusCodeCorrectly() {
        this._xmlHttp.send(null).will(function () {
            const o = this.reveal();
            o.status = 418;
            o.statusText = 'I\'m a teapot';
            o.readyState = XMLHttpRequest.DONE;
            o.onreadystatechange();
        });

        const response = await this._requester.request('GET', 'resource/subresource');
        __self.assertEquals(418, response.getStatusCode());
    }

    async testShouldWorkWithBodyConverterDecorator() {
        const request = createRequest('POST', 'http://www.example.org', null, { test: 'foo' });
        const decorator = new BodyConverterDecorator();

        const decorated = decorator.decorate(request);
        this._xmlHttp.send('{"test":"foo"}')
            .shouldBeCalled()
            .will(function () {
                const o = this.reveal();
                o.readyState = XMLHttpRequest.DONE;
                o.onreadystatechange();
            });

        await this._requester.request(decorated.method, decorated.url, decorated.headers, decorated.body);
    }
}
