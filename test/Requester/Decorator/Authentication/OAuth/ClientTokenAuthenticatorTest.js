import { expect } from 'chai';

const ClientTokenAuthenticator = Solido.Atlante.Requester.Decorator.Authentication.OAuth.ClientTokenAuthenticator;
const Headers = Solido.Atlante.Requester.Headers;
const InMemoryStorage = Solido.Atlante.Storage.InMemoryStorage;
const RequesterInterface = Solido.Atlante.Requester.RequesterInterface;
const Response = Solido.Atlante.Requester.Response.Response;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

const TOKEN_ENDPOINT = 'http://localhost/oauth2/token';
export default class ClientTokenAuthenticatorTest extends TestCase {
    _requester;
    _storage;
    _authenticator;

    beforeEach() {
        this._requester = this.prophesize(RequesterInterface);
        this._storage = new InMemoryStorage();
        this._authenticator = new ClientTokenAuthenticator(this._requester.reveal(), this._storage, {
            client_id: 'foo_client',
            token_endpoint: TOKEN_ENDPOINT,
            data_encoding: 'json',
        });
    }

    async testShouldRequestTokenUsingClientCredentialsGrantType() {
        this._requester.request('POST', TOKEN_ENDPOINT, {
            'Content-Type': 'application/json',
        }, '{"grant_type":"client_credentials","client_id":"foo_client"}')
            .willReturn(new Response(200, new Headers(), {
                access_token: 'foo_token',
                expires_in: 600,
            }))
            .shouldBeCalled()
        ;

        expect(await this._authenticator.token).to.be.equal('foo_token');

        let item = await this._storage.getItem('client_access_token');
        expect(item.isHit).to.be.equal(true);
        expect(item.get()).to.be.equal('foo_token');

        item = await this._storage.getItem('refresh_token');
        expect(item.isHit).to.be.equal(false);
    }
}
