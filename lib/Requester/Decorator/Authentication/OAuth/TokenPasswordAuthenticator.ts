import ClientTokenAuthenticator, { ClientTokenAuthenticatorConfiguration } from './ClientTokenAuthenticator';
import { RequesterInterface } from "../../../RequesterInterface";
import { StorageInterface } from "../../../../Storage/StorageInterface";
import Response from "../../../Response";
import NoTokenAvailableException from "../../../../Exception/NoTokenAvailableException";

interface TokenPasswordAuthenticatorConfiguration extends ClientTokenAuthenticatorConfiguration {
    access_token_key?: string;
    refresh_token_key?: string;
    id_token_key?: string;
}

export default class TokenPasswordAuthenticator extends ClientTokenAuthenticator {
    protected _accessTokenKey: string;
    protected _idTokenKey: string;
    private readonly _refreshTokenKey: string;

    /**
     * Constructor.
     */
    constructor(
        requester: RequesterInterface,
        tokenStorage: StorageInterface,
        {
            token_endpoint,
            client_id,
            client_secret = undefined,
            client_token_key = undefined,
            data_encoding = undefined,
            access_token_key = 'access_token',
            refresh_token_key = 'refresh_token',
            id_token_key = 'id_token',
        }: TokenPasswordAuthenticatorConfiguration
    ) {
        super(requester, tokenStorage, { token_endpoint, client_id, client_secret, client_token_key, data_encoding });

        this._accessTokenKey = access_token_key;
        this._idTokenKey = id_token_key;
        this._refreshTokenKey = refresh_token_key;
    }

    /**
     * Authenticates user.
     */
    authenticate(username: string, password: string): Promise<string> {
        this._tokenPromise = (async () => {
            const request = this._buildTokenRequest({
                grant_type: 'password',
                username,
                password,
            });

            const response = await this._request(request.body, request.headers.all);
            await this._storeTokenFromResponse(response);

            return response.data.access_token;
        })();

        return this.token;
    }

    /**
     * Logs user out.
     */
    async logout(): Promise<void> {
        await this._tokenStorage.deleteItem(this._accessTokenKey);
        await this._tokenStorage.deleteItem(this._refreshTokenKey);

        if (this._idTokenKey) {
            await this._tokenStorage.deleteItem(this._idTokenKey);
        }
    }

    /**
     * Request a token.
     */
    protected async _getToken(): Promise<string> {
        const item = await this._tokenStorage.getItem(this._accessTokenKey);
        if (item.isHit) {
            return item.get();
        }

        const refreshed = await this._refreshToken();
        if (null === refreshed) {
            return await super._getToken();
        }

        return refreshed;
    }

    /**
     * Tries to refresh a token. Returns a string if refresh succeeded.
     */
    protected async _refreshToken(): Promise<string|null> {
        const refreshItem = await this._tokenStorage.getItem('refresh_token');
        if (! refreshItem.isHit) {
            return null;
        }

        const request = this._buildTokenRequest({
            grant_type: 'refresh_token',
            refresh_token: refreshItem.get(),
        });
        const response = await this._request(request.body, request.headers.all);
        await this._storeTokenFromResponse(response, 'refresh');

        return response.data.access_token;
    }

    /**
     * Stores the access/refresh tokens from response.
     */
    protected async _storeTokenFromResponse(response: Response, requestType: 'request' | 'refresh' = 'request'): Promise<void> {
        const item = await this._tokenStorage.getItem(this._accessTokenKey);
        const refreshItem = await this._tokenStorage.getItem(this._refreshTokenKey);

        if (200 !== response.status) {
            throw new NoTokenAvailableException(`Token ${requestType} responded with status ${response.status} (${response.statusText})`);
        }

        const content = response.data;

        item.set(content.access_token);
        item.expiresAfter(content.expires_in - 60);
        await this._tokenStorage.save(item);

        if (!! content.refresh_token) {
            refreshItem.set(content.refresh_token);
            await this._tokenStorage.save(refreshItem);
        }

        if (!! content.id_token) {
            const idItem = await this._tokenStorage.getItem(this._idTokenKey);
            idItem.set(content.id_token);
            await this._tokenStorage.save(idItem);
        }
    }
}
