import BaseAuthenticator, { AuthFlowDisplay } from './BaseAuthenticator';
import { generateRandomString, sha256 } from '../../../../Utils/Crypto';
import InvalidResponse from '../../../Response/InvalidResponse';
import NoTokenAvailableException from '../../../../Exception/NoTokenAvailableException';
import { ResponseInterface } from '../../../Response/ResponseInterface';
import { TokenResponseDataInterface } from '../OAuth/TokenResponseDataInterface';

export default
class PkceCodeFlowAuthenticator extends BaseAuthenticator {
    private _authPromise: Promise<string>;

    /**
     * @inheritdoc
     */
    async startAuthorization(callbackUri: string, display: AuthFlowDisplay = AuthFlowDisplay.PAGE, state?: string): Promise<never> {
        const configuration = await this._openidConfiguration;

        // Generate a random state if none is passed.
        state = state || generateRandomString(26);
        const verifier = generateRandomString(48);

        const verifierItem = await this._tokenStorage.getItem('pkce_verifier_' + state);
        verifierItem.set(verifier);
        verifierItem.expiresAfter(43200);
        await this._tokenStorage.save(verifierItem);

        const authorizationUrl = new URL(configuration.authorizationEndpoint);
        authorizationUrl.searchParams.append('response_type', 'code');
        authorizationUrl.searchParams.append('prompt', 'login consent');
        authorizationUrl.searchParams.append('scope', this._scopes);
        authorizationUrl.searchParams.append('client_id', this._clientId);
        authorizationUrl.searchParams.append('client_secret', this._clientSecret);
        authorizationUrl.searchParams.append('redirect_uri', callbackUri);
        authorizationUrl.searchParams.append('display', display);
        authorizationUrl.searchParams.append('state', state);
        authorizationUrl.searchParams.append('code_challenge', await sha256(verifier));
        authorizationUrl.searchParams.append('code_challenge_method', 'S256');

        if (this._audience) {
            authorizationUrl.searchParams.append('audience', this._audience);
        }

        location.href = authorizationUrl.href;

        throw new Error('Stop execution here');
    }

    /**
     * Exchanges an authorization code with an access token.
     */
    async authenticateFromCode(code: string, state: string, callbackUri: string): Promise<void> {
        this._authPromise = this._authPromise || (async () => {
            const configuration = await this._openidConfiguration;
            this._tokenEndpoint = configuration.tokenEndpoint;

            const verifierItem = await this._tokenStorage.getItem('pkce_verifier_' + state);
            if (! verifierItem.isHit) {
                throw new NoTokenAvailableException(undefined, 'Cannot authenticate. No code verifier present on the storage.');
            }

            const request = this._buildTokenRequest({
                grant_type: 'authorization_code',
                redirect_uri: callbackUri,
                code: code,
                code_verifier: verifierItem.get(),
                response_type: 'token id_token',
                scope: this._scopes,
                audience: this._audience,
            });

            let response: ResponseInterface;
            try {
                response = await this._request(request.body, request.headers.all);
                if (response instanceof InvalidResponse) {
                    throw new NoTokenAvailableException(response, `Code exchange returned status ${response.getStatusCode()}`);
                }
            } finally {
                await this._tokenStorage.deleteItem(verifierItem.key);
            }

            await this._storeTokenFromResponse(response);
            return response.getData<TokenResponseDataInterface>().access_token;
        })();

        await (this._tokenPromise = this._authPromise);
    }
}
