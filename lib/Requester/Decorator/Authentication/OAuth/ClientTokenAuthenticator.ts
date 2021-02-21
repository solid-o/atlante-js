import Decorator, { DecoratorInterface } from '../../DecoratorInterface';
import Headers from '../../../Headers';
import InvalidResponse from '../../../Response/InvalidResponse';
import NoTokenAvailableException from '../../../../Exception/NoTokenAvailableException';
import Request from '../../../Request';
import { RequesterInterface } from '../../../RequesterInterface';
import { ResponseInterface } from '../../../Response/ResponseInterface';
import { StorageInterface } from '../../../../Storage/StorageInterface';
import { TokenResponseDataInterface } from './TokenResponseDataInterface';

export interface ClientTokenAuthenticatorConfiguration {
    token_endpoint: string;
    client_id: string;
    client_secret?: string;
    client_token_key?: string;
    data_encoding?: 'json' | 'form';
}

export interface TokenRequestParams extends Record<string, any> {
    grant_type: string,
}

export default
class ClientTokenAuthenticator extends implementationOf(Decorator) implements DecoratorInterface {
    protected _requester: RequesterInterface;
    protected _tokenEndpoint: string;
    protected _tokenStorage: StorageInterface;
    protected _clientId: string;
    protected _clientSecret: string;
    protected _tokenPromise: null | Promise<string>;
    private readonly _clientTokenKey: string;
    private readonly _encoding: 'json' | 'form';

    /**
     * Constructor.
     */
    constructor(requester: RequesterInterface, tokenStorage: StorageInterface, config: ClientTokenAuthenticatorConfiguration) {
        super();

        this._requester = requester;
        this._tokenEndpoint = config.token_endpoint;
        this._tokenStorage = tokenStorage;
        this._clientId = config.client_id;
        this._clientSecret = config.client_secret;
        this._tokenPromise = null;
        this._clientTokenKey = config.client_token_key;
        this._encoding = config.data_encoding;
    }

    /**
     * Decorates the request adding client token authorization if not already set.
     */
    async decorate(request: Request): Promise<Request> {
        const { body = undefined, method, url, headers } = request;
        if (! headers.has('Authorization')) {
            headers.set('Authorization', 'Bearer ' + await this.token);
        }

        return { body, method, url, headers };
    }

    /**
     * Gets a token promise.
     */
    get token(): Promise<string> {
        return this._tokenPromise = this._tokenPromise ||
            (this._getToken().then(res => (this._tokenPromise = null, res)));
    }

    /**
     * Request a token.
     */
    protected async _getToken(): Promise<string> {
        const item = await this._tokenStorage.getItem(this._clientTokenKey);
        if (item.isHit) {
            return item.get();
        }

        const request = this._buildTokenRequest({ grant_type: 'client_credentials' });
        const response = await this._request(request.body, request.headers.all);

        if (response instanceof InvalidResponse) {
            throw new NoTokenAvailableException(response, `Client credentials token returned status ${response.getStatusCode()}`);
        }

        const content = response.getData<TokenResponseDataInterface>() ;
        const token = content.access_token;

        item.set(token);
        item.expiresAfter(content.expires_in - 60);
        await this._tokenStorage.save(item);

        return token;
    }

    /**
     * Builds token request body and headers.
     */
    protected _buildTokenRequest({ grant_type, ...extra }: TokenRequestParams): { body: any, headers: Headers } {
        return {
            body: {
                grant_type,
                client_id: this._clientId,
                client_secret: this._clientSecret,
                ...extra,
            },
            headers: new Headers(),
        };
    }

    /**
     * Encodes data and perform POST request.
     */
    protected _request(data: any, headers?: any): Promise<ResponseInterface> {
        if ('json' === this._encoding) {
            headers['Content-Type'] = 'application/json';
            data = JSON.stringify(data);
        } else {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
            const params = [];
            for (const key of Object.keys(data)) {
                params.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }

            data = params.join('&');
        }

        return this._requester.request('POST', this._tokenEndpoint, headers, data);
    }
}
