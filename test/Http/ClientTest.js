const Client = Solido.Atlante.Http.Client;
const RequesterInterface = Solido.Atlante.Requester.RequesterInterface;
const DecoratorInterface = Solido.Atlante.Requester.Decorator.DecoratorInterface;
const Argument = Jymfony.Component.Testing.Argument.Argument;
const Prophet = Jymfony.Component.Testing.Prophet;
const { expect } = require('chai');

describe('[Http] Client', function () {
    beforeEach(() => {
        /**
         * @type {Jymfony.Component.Testing.Prophet}
         *
         * @private
         */
        this._prophet = new Prophet();

        this._requester = this._prophet.prophesize(RequesterInterface);
        this._client = new Client(this._requester.reveal(), []);
    });

    afterEach(() => {
        if (this.currentTest && 'passed' === this.currentTest.state) {
            this._prophet.checkPredictions();
        }
    });

    it('should forward request to requester', async () => {
        const response = { data: {}, status: 200, statusText: 'OK' };

        this._requester
            .request('GET', 'http://example.org/', { Accept: 'application/json' }, undefined)
            .shouldBeCalled()
            .willReturn(response)
        ;

        expect(await this._client.request('GET', 'http://example.org/'))
            .to.be.equal(response)
        ;
    });

    it('should pass request to decorators', async () => {
        const response = { data: {}, status: 200, statusText: 'OK' };
        const decorator = this._prophet.prophesize(DecoratorInterface);

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
    });
});
