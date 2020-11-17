import { expect } from 'chai';

const Argument = Jymfony.Component.Testing.Argument.Argument;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;
const WebRequester = Solido.Atlante.Requester.WebRequester;
const XMLHttpRequest = Solido.Atlante.Stubs.XmlHttpRequest;

export default class WebRequesterTest extends TestCase {
    __construct() {
        super.__construct();

        /**
         * @type {Jymfony.Component.Testing.Prophecy.ObjectProphecy|Solido.Atlante.Stubs.XMLHttpRequest}
         *
         * @private
         */
        this._xmlHttp = undefined;

        /**
         * @type {Solido.Atlante.Requester.WebRequester}
         *
         * @private
         */
        this._requester = undefined;
    }

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
        expect(response.getHeaders().get('Content-Type')).to.be.eq('application/octet-stream');
        expect(response.getHeaders().get('Date')).to.be.eq('12 Jan 2019 02:00:00 GMT');
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
        expect(response.getStatusCode()).to.be.eq(418);
    }
}
