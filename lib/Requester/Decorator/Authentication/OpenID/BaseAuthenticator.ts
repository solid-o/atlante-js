import Headers from '../../../Headers';
import HttpBasicAuthenticator from '../HttpBasicAuthenticator';
import { RequesterInterface } from '../../../RequesterInterface';
import ServerConfiguration from './ServerConfiguration';
import { StorageInterface } from '../../../../Storage/StorageInterface';
import TokenPasswordAuthenticator from '../OAuth/TokenPasswordAuthenticator';
import { TokenRequestParams } from '../OAuth/ClientTokenAuthenticator';

export interface OpenidAuthenticatorConfiguration {
    server_url: string;
    client_id: string;
    openid_scope?: string[];
    client_secret?: string;
    audience?: string;
    auth_method?: 'client_secret_basic' | 'client_secret_post';
    post_logout_redirect_uri?: string;
}

export enum AuthFlowDisplay {
    PAGE = 'page',
    POPUP = 'popup',
    TOUCH = 'touch',
}

export default abstract class BaseAuthenticator extends TokenPasswordAuthenticator {
    protected readonly _scopes: string;
    protected readonly _audience: string;

    private _oidConfig: Promise<any>;
    private readonly _serverUrl: string;
    private readonly _authMethod: 'client_secret_basic' | 'client_secret_post';
    private readonly _postLogoutRedirectUri: string | null;

    protected constructor(requester: RequesterInterface, tokenStorage: StorageInterface, config: OpenidAuthenticatorConfiguration) {
        super(requester, tokenStorage, {
            ...config,
            token_endpoint: '',
            client_token_key: 'client_access_token',
            data_encoding: 'form',
        });

        this._serverUrl = config.server_url;

        const scopes = (config.openid_scope || [ 'profile', 'email', 'offline_access' ]);
        scopes.push('openid');

        this._scopes = scopes.join(' ');
        this._audience = config.audience;
        this._authMethod = config.auth_method || 'client_secret_basic';
        this._postLogoutRedirectUri = config.post_logout_redirect_uri || null;
    }

    /**
     * Starts the authorization flow (code or implicit).
     */
    abstract async startAuthorization(callbackUri: string, display?: AuthFlowDisplay, state?: string): Promise<never>;

    /**
     * Get the current token information (using token introspection endpoint).
     */
    get tokenInfo(): Promise<any> {
        return this._tokenInfo();
    }

    /**
     * @inheritdoc
     */
    async logout(state?: string): Promise<void> {
        const configuration = await this._openidConfiguration;
        if (! configuration.logoutEndpoint) {
            return super.logout();
        }

        const endSessionUrl = new URL(configuration.logoutEndpoint);
        endSessionUrl.searchParams.append('post_logout_redirect_uri', this._postLogoutRedirectUri || window.location.href);

        if (state) {
            endSessionUrl.searchParams.append('state', state);
        }

        if (this._idTokenKey) {
            const idItem = await this._tokenStorage.getItem(this._idTokenKey);
            if (idItem.isHit) {
                endSessionUrl.searchParams.append('id_token_hint', idItem.get());
            }
        }

        await super.logout();
        window.location.href = endSessionUrl.href;
    }

    /**
     * @inheritdoc
     */
    protected async _getToken(): Promise<string> {
        const configuration = await this._openidConfiguration;
        this._tokenEndpoint = configuration.tokenEndpoint;

        return super._getToken();
    }

    /**
     * @inheritdoc
     */
    protected _buildTokenRequest({ grant_type, ...extra }: TokenRequestParams): { body: any, headers: Headers } {
        let headers = new Headers();
        if ('client_secret_basic' === this._authMethod) {
            const basic = new HttpBasicAuthenticator(this._clientId, this._clientSecret || null);
            headers = basic.decorate({ method: 'POST', headers, url: '', body: undefined }).headers;

            return {
                body: {
                    grant_type,
                    ...extra,
                },
                headers,
            };
        }

        return super._buildTokenRequest({ grant_type, ...extra });
    }

    /**
     * Gets the openid configuration from the well known configuration endpoint.
     */
    protected get _openidConfiguration() {
        return this._oidConfig = this._oidConfig || this._getConfiguration();
    }

    private async _getConfiguration(): Promise<ServerConfiguration> {
        const configurationUrl = new URL('/.well-known/openid-configuration', this._serverUrl).toString();
        const response = await this._requester.request('GET', configurationUrl);
        if (200 !== response.status) {
            throw new Error('Server misconfiguration or server does not support OpenID Connect');
        }

        return new ServerConfiguration(response.data);
    }

    /**
     * Retrieves token info.
     */
    private async _tokenInfo(): Promise<any> {
        const token = await this.token;

        const configuration = await this._openidConfiguration;
        const response = await this._requester.request('GET', configuration.userinfoEndpoint, {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token,
        });

        if (200 !== response.status) {
            throw new Error('Bad response');
        }

        return response.data;
    }
}
