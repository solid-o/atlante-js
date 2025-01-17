import BaseAuthenticator, { AuthorizationOptions } from './BaseAuthenticator.js';
import InvalidResponse from '../../../Response/InvalidResponse.js';
import NoTokenAvailableException from '../../../../Exception/NoTokenAvailableException.js';
import { TokenResponseDataInterface } from '../OAuth/TokenResponseDataInterface.js';

export default
class CodeFlowAuthenticator extends BaseAuthenticator {
    private _authPromise: Promise<string>;

    /**
     * @inheritdoc
     */
    async startAuthorization({ callbackUri, state, display, prompt }: AuthorizationOptions): Promise<never> {
        const configuration = await this._openidConfiguration;

        // Generate a random state if none is passed.
        state = state || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const authorizationUrl = new URL(configuration.authorizationEndpoint);
        authorizationUrl.searchParams.append('response_type', 'code');
        authorizationUrl.searchParams.append('prompt', prompt ? prompt : 'login consent');
        authorizationUrl.searchParams.append('scope', this._scopes);
        authorizationUrl.searchParams.append('client_id', this._clientId);
        if (this._clientSecret) {
            authorizationUrl.searchParams.append('client_secret', this._clientSecret);
        }
        authorizationUrl.searchParams.append('redirect_uri', callbackUri);
        authorizationUrl.searchParams.append('display', display);
        authorizationUrl.searchParams.append('state', state);

        if (this._audience) {
            authorizationUrl.searchParams.append('audience', this._audience);
        }

        location.href = authorizationUrl.href;

        throw new Error('Stop execution here');
    }

    /**
     * Finish code authorization flow.
     *
     * @returns {Promise<void>}
     */
    async authorize({ state = undefined, fragment = location.hash, query = location.search, callbackUri = location.href }): Promise<void> {
        const params = new URLSearchParams(fragment.replace(/^#/, ''));
        const queryParams = new URLSearchParams(query.replace(/^\?/, ''));

        const error = params.get('error') || queryParams.get('error');
        if (error) {
            const errorDescription = params.get('error_description') || queryParams.get('error_description');
            const errorHint = params.get('error_hint') || queryParams.get('error_hint');
            const errorMessage = 'Error: ' + error +
                (errorDescription ? '\nDescription: ' + decodeURIComponent(errorDescription) : '') +
                (errorHint ? '\nHint: ' + decodeURIComponent(errorHint) : '');

            throw new NoTokenAvailableException(undefined, errorMessage);
        }

        if (undefined !== state && params.get('state') !== state) {
            throw new NoTokenAvailableException(undefined, 'Invalid state returned');
        }

        await this.authenticateFromCode(params.get('code') || queryParams.get('code'), callbackUri);
    }

    /**
     * Exchanges an authorization code with an access token.
     */
    async authenticateFromCode(code: string, callbackUri: string): Promise<void> {
        this._authPromise = this._authPromise || (async () => {
            const configuration = await this._openidConfiguration;
            this._tokenEndpoint = configuration.tokenEndpoint;

            const request = this._buildTokenRequest({
                grant_type: 'authorization_code',
                redirect_uri: callbackUri,
                code: code,
                response_type: 'token id_token',
                scope: this._scopes,
                audience: this._audience,
            });

            const response = await this._request(request.body, request.headers.all);

            if (response instanceof InvalidResponse) {
                throw new NoTokenAvailableException(response, `Code exchange returned status ${response.getStatusCode()}`);
            }

            await this._storeTokenFromResponse(response);
            return response.getData<TokenResponseDataInterface>().access_token;
        })();

        await (this._tokenPromise = this._authPromise);
    }
}
