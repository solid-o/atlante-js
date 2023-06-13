import BaseAuthenticator, { AuthFlowDisplay, AuthorizationOptions } from './BaseAuthenticator.js';
import { generateRandomString, sha256 } from '../../../../Utils/Crypto.js';
import InvalidResponse from '../../../Response/InvalidResponse.js';
import NoTokenAvailableException from '../../../../Exception/NoTokenAvailableException.js';
import { ResponseInterface } from '../../../Response/ResponseInterface.js';
import { TokenResponseDataInterface } from '../OAuth/TokenResponseDataInterface.js';

export default
class PkceCodeFlowAuthenticator extends BaseAuthenticator {
    private _authPromise: Promise<string>;

    /**
     * @inheritdoc
     */
    async startAuthorization({ callbackUri, state, display, prompt }: AuthorizationOptions): Promise<never> {
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
        authorizationUrl.searchParams.append('prompt', prompt ? prompt : 'login consent');
        authorizationUrl.searchParams.append('scope', this._scopes);
        authorizationUrl.searchParams.append('client_id', this._clientId);
        authorizationUrl.searchParams.append('client_secret', this._clientSecret);
        authorizationUrl.searchParams.append('redirect_uri', callbackUri);
        authorizationUrl.searchParams.append('display', display);
        authorizationUrl.searchParams.append('state', state);
        authorizationUrl.searchParams.append('code_challenge', await sha256(verifier, 'url-safe-base64'));
        authorizationUrl.searchParams.append('code_challenge_method', 'S256');

        if (this._audience) {
            authorizationUrl.searchParams.append('audience', this._audience);
        }

        location.href = authorizationUrl.href;

        throw new Error('Stop execution here');
    }

    /**
     * Finish PKCE code authorization flow.
     *
     * @returns {Promise<void>}
     */
    async authorize({ state = undefined, fragment = location.hash, query = location.search, callbackUri = location.href }): Promise<void> {
        const params = new URLSearchParams(fragment.replace(/^#/, ''));
        const queryParams = new URLSearchParams(query.replace(/^\?/, ''));

        const data: Record<string, string> = { event: 'silent_auth_flow' };
        for (const [ key, value ] of [ ...params.entries(), ...queryParams.entries() ]) {
            data[key] = data[key] || value;
        }

        try {
            const error = data.error;
            if (error) {
                const errorDescription = data.error_description;
                const errorHint = data.error_hint;
                const errorMessage = 'Error: ' + error +
                    (errorDescription ? '\nDescription: ' + decodeURIComponent(errorDescription) : '') +
                    (errorHint ? '\nHint: ' + decodeURIComponent(errorHint) : '');

                throw new NoTokenAvailableException(undefined, errorMessage);
            }

            if (undefined !== state && data.state !== state) {
                data.error = 'login_required';
                throw new NoTokenAvailableException(undefined, 'Invalid state returned');
            }

            try {
                await this.authenticateFromCode(data.code, state, callbackUri);
            } catch (e) {
                data.error = data.error || e.message;
                throw e;
            }
        } finally {
            window.parent.postMessage(data, '*');
        }
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

    async authenticateFromSession(callbackUri: string): Promise<void> {
        if (undefined === window) {
            throw new NoTokenAvailableException(undefined, 'Silent PKCE authorization flow called from a non-browser environment');
        }

        const configuration = await this._openidConfiguration;

        // Generate a random state.
        const state = generateRandomString(26);
        const verifier = generateRandomString(48);
        const verifierItem = await this._tokenStorage.getItem('pkce_verifier_' + state);
        verifierItem.set(verifier);
        verifierItem.expiresAfter(43200);
        await this._tokenStorage.save(verifierItem);

        const authorizationUrl = new URL(configuration.authorizationEndpoint);
        authorizationUrl.searchParams.append('response_type', 'code');
        authorizationUrl.searchParams.append('prompt', 'none');
        authorizationUrl.searchParams.append('scope', this._scopes);
        authorizationUrl.searchParams.append('client_id', this._clientId);
        authorizationUrl.searchParams.append('client_secret', this._clientSecret);
        authorizationUrl.searchParams.append('redirect_uri', callbackUri);
        authorizationUrl.searchParams.append('display', AuthFlowDisplay.PAGE);
        authorizationUrl.searchParams.append('state', state);
        authorizationUrl.searchParams.append('code_challenge', await sha256(verifier, 'url-safe-base64'));
        authorizationUrl.searchParams.append('code_challenge_method', 'S256');

        if (this._audience) {
            authorizationUrl.searchParams.append('audience', this._audience);
        }

        const frame = window.document.createElement('iframe');
        const removeFrame = () => {
            try {
                document.body.removeChild(frame);
            } catch (e) {
                // Someone already removed the frame: do nothing.
            }
        };

        let resolved = false;
        const responsePromise = new Promise<void>((resolve, reject) => {
            frame.style.position = 'fixed';
            frame.style.top = '0';
            frame.style.left = '0';
            frame.style.width = '0';
            frame.style.height = '0';
            frame.src = authorizationUrl.href;
            frame.onerror = reject;
            frame.onabort = () => reject(new NoTokenAvailableException(undefined, 'Token request has been aborted.'));

            window.addEventListener('message', (event) => {
                if (! event.data || 'silent_auth_flow' !== event.data.event) {
                    return;
                }

                resolved = true;
                removeFrame();

                if (event.data.error) {
                    reject(new NoTokenAvailableException(undefined, 'Token request returned "' + event.data.error + '"'));
                } else {
                    resolve();
                }
            });

            document.body.appendChild(frame);
        });

        try {
            await Promise.race([
                responsePromise,
                new Promise<void>((resolve, reject) => {
                    setTimeout(() => {
                        if (resolved) {
                            return;
                        }

                        removeFrame();
                        reject(new NoTokenAvailableException(undefined, 'Operation timed out'));
                    }, 30000);
                }),
            ]);
        } finally {
            await this._tokenStorage.deleteItem('pkce_verifier_' + state);
        }
    }
}
