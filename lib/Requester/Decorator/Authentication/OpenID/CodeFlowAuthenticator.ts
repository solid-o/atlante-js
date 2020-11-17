import BaseAuthenticator, { AuthFlowDisplay } from './BaseAuthenticator';
import InvalidResponse from '../../../Response/InvalidResponse';
import NoTokenAvailableException from '../../../../Exception/NoTokenAvailableException';
import { TokenResponseDataInterface } from '../OAuth/TokenResponseDataInterface';

export default
class CodeFlowAuthenticator extends BaseAuthenticator {
    /**
     * @inheritdoc
     */
    async startAuthorization(callbackUri: string, display: AuthFlowDisplay = AuthFlowDisplay.PAGE, state?: string): Promise<never> {
        const configuration = await this._openidConfiguration;

        // Generate a random state if none is passed.
        state = state || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const authorizationUrl = new URL(configuration.authorizationEndpoint);
        authorizationUrl.searchParams.append('response_type', 'code');
        authorizationUrl.searchParams.append('prompt', 'login consent');
        authorizationUrl.searchParams.append('scope', this._scopes);
        authorizationUrl.searchParams.append('client_id', this._clientId);
        authorizationUrl.searchParams.append('client_secret', this._clientSecret);
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
     * Exchanges an authorization code with an access token.
     */
    async authenticateFromCode(code: string, callbackUri: string): Promise<void> {
        this._tokenPromise = this._tokenPromise || (async () => {
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
                throw new NoTokenAvailableException(`Code exchange returned status ${response.getStatusCode()}`);
            }

            await this._storeTokenFromResponse(response);
            return response.getData<TokenResponseDataInterface>().access_token;
        })();

        await this._tokenPromise;
    }
}
