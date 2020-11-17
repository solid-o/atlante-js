import { expect } from 'chai';

const Argument = Jymfony.Component.Testing.Argument.Argument;
const Client = Solido.Atlante.Http.Client;
const DecoratorInterface = Solido.Atlante.Requester.Decorator.DecoratorInterface;
const Headers = Solido.Atlante.Requester.Headers;
const RequesterInterface = Solido.Atlante.Requester.RequesterInterface;
const Response = Solido.Atlante.Requester.Response.Response;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class ClientTest extends TestCase {
    __construct() {
        super.__construct();

        /**
         * @type {Jymfony.Component.Testing.Prophecy.ObjectProphecy|Solido.Atlante.Requester.RequesterInterface}
         *
         * @private
         */
        this._requester = undefined;

        /**
         * @type {Solido.Atlante.Http.Client}
         *
         * @private
         */
        this._client = undefined;
    }

    beforeEach() {
        this._requester = this.prophesize(RequesterInterface);
        this._client = new Client(this._requester.reveal(), []);
    }

    async testShouldForwardRequestToRequester() {
        const response = new Response(200, new Headers(), {});

        this._requester
            .request('GET', 'http://example.org/', { Accept: 'application/json' }, undefined)
            .shouldBeCalled()
            .willReturn(response)
        ;

        expect(await this._client.request('GET', 'http://example.org/'))
            .to.be.equal(response)
        ;
    }

    async testShouldPassRequestToDecorators() {
        const response = new Response(200, new Headers(), {});
        const decorator = this.prophesize(DecoratorInterface);

        decorator.decorate(Argument.any())
            .shouldBeCalledTimes(1)
            .will(request => {
                request.url = new URL(request.url, 'http://example.org');
                return request;
            })
        ;

        this._client._decorators.push(decorator.reveal());
        this._requester
            .request('GET', 'http://example.org/', { Accept: 'application/json' }, undefined)
            .shouldBeCalled()
            .willReturn(response)
        ;

        expect(await this._client.request('GET', '/'))
            .to.be.equal(response)
        ;
    }
}
