import { @dataProvider } from '@jymfony/decorators';
import { createRequest } from '../../../../../lib/Requester/Request';
import { expect } from 'chai';

const BadResponse = Solido.Atlante.Requester.Response.BadResponse;
const Headers = Solido.Atlante.Requester.Headers;
const InMemoryStorage = Solido.Atlante.Storage.InMemoryStorage;
const RequesterInterface = Solido.Atlante.Requester.RequesterInterface;
const Response = Solido.Atlante.Requester.Response.Response;
const TokenPasswordAuthenticator = Solido.Atlante.Requester.Decorator.Authentication.OAuth.TokenPasswordAuthenticator;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

const TOKEN_ENDPOINT = 'http://localhost/oauth2/token';
export default class TokenPasswordAuthenticatorTest extends TestCase {
    _requester;
    _storage;
    _authenticator;

    beforeEach() {
        this._requester = this.prophesize(RequesterInterface);
        this._storage = new InMemoryStorage();
        this._authenticator = new TokenPasswordAuthenticator(this._requester.reveal(), this._storage, {
            client_id: 'foo_client',
            token_endpoint: TOKEN_ENDPOINT,
            data_encoding: 'json',
        });
    }

    async testShouldRequestTokenUsingPasswordGrantType() {
        this._requester.request('POST', TOKEN_ENDPOINT, {
            'Content-Type': 'application/json',
        }, '{"grant_type":"password","client_id":"foo_client","username":"foo","password":"bar"}')
            .willReturn(new Response(200, new Headers(), {
                access_token: 'foo_token',
                refresh_token: 'refresh_token',
                expires_in: 600,
            }))
            .shouldBeCalled()
        ;

        await this._authenticator.authenticate('foo', 'bar');
        expect(await this._authenticator.token).to.be.equal('foo_token');

        let item = await this._storage.getItem('access_token');
        expect(item.isHit).to.be.equal(true);
        expect(item.get()).to.be.equal('foo_token');

        item = await this._storage.getItem('refresh_token');
        expect(item.isHit).to.be.equal(true);
        expect(item.get()).to.be.equal('refresh_token');
    }

    async testShouldRefreshToken() {
        const refreshItem = await this._storage.getItem('refresh_token');
        refreshItem.set('this_is_the_token');
        refreshItem.expiresAfter(600);
        await this._storage.save(refreshItem);

        this._requester.request('POST', TOKEN_ENDPOINT, {
            'Content-Type': 'application/json',
        }, '{"grant_type":"refresh_token","client_id":"foo_client","refresh_token":"this_is_the_token"}')
            .willReturn(new Response(200, new Headers(), {
                access_token: 'foo_token',
                refresh_token: 'refresh_token',
                expires_in: 600,
            }))
            .shouldBeCalled()
        ;

        expect(await this._authenticator.token).to.be.equal('foo_token');

        const item = await this._storage.getItem('refresh_token');
        expect(item.isHit).to.be.equal(true);
        expect(item.get()).to.be.equal('refresh_token');
    }

    async testShouldRequestClientTokenIfRefreshFails() {
        const refreshItem = await this._storage.getItem('refresh_token');
        refreshItem.set('this_is_the_token');
        refreshItem.expiresAfter(600);
        await this._storage.save(refreshItem);

        this._requester.request('POST', TOKEN_ENDPOINT, {
            'Content-Type': 'application/json',
        }, '{"grant_type":"refresh_token","client_id":"foo_client","refresh_token":"this_is_the_token"}')
            .willReturn(new BadResponse(new Headers(), {
                error: 'login_required',
            }))
            .shouldBeCalled()
        ;

        this._requester.request('POST', TOKEN_ENDPOINT, {
            'Content-Type': 'application/json',
        }, '{"grant_type":"client_credentials","client_id":"foo_client"}')
            .willReturn(new Response(200, new Headers(), {
                access_token: 'client_token',
                expires_in: 600,
            }))
            .shouldBeCalled()
        ;

        expect(await this._authenticator.token).to.be.equal('client_token');

        const item = await this._storage.getItem('refresh_token');
        expect(item.isHit).to.be.equal(false);
    }
}
