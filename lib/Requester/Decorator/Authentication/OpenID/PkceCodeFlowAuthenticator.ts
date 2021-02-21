import BaseAuthenticator, { AuthFlowDisplay } from './BaseAuthenticator';
import InvalidResponse from '../../../Response/InvalidResponse';
import NoTokenAvailableException from '../../../../Exception/NoTokenAvailableException';
import { TokenResponseDataInterface } from '../OAuth/TokenResponseDataInterface';

const base64_alphabet = 'ABCDEFGHIJKLMNOPQRSTUWXYZabcdefghijklmnopqrstuwxyz0123456789+/';
const generateRandomString = (bytes = 16) => {
    const buf = new Uint8Array(bytes);
    if ('undefined' !== typeof window && 'undefined' !== typeof window.crypto) {
        window.crypto.getRandomValues(buf);
    } else {
        let crypto;
        if ('function' === typeof require) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            crypto = require('crypto');
        } else {
            throw Error('Cannot retrieve a valid random values generator');
        }

        const data = crypto.randomBytes(bytes).toJSON().data;
        for (let i = 0; i < data.length; ++i) {
            buf[i] = data[i];
        }
    }

    const l = buf.length;
    let result = '', i;

    for (i = 2; i < l; i += 3) {
        result += base64_alphabet[buf[i - 2] >> 2];
        result += base64_alphabet[((buf[i - 2] & 0x03) << 4) | (buf[i - 1] >> 4)];
        result += base64_alphabet[((buf[i - 1] & 0x0F) << 2) | (buf[i] >> 6)];
        result += base64_alphabet[buf[i] & 0x3F];
    }
    if (i === l + 1) { // 1 octet yet to write
        result += base64_alphabet[buf[i - 2] >> 2];
        result += base64_alphabet[(buf[i - 2] & 0x03) << 4];
        result += '==';
    }
    if (i === l) { // 2 octets yet to write
        result += base64_alphabet[buf[i - 2] >> 2];
        result += base64_alphabet[((buf[i - 2] & 0x03) << 4) | (buf[i - 1] >> 4)];
        result += base64_alphabet[(buf[i - 1] & 0x0F) << 2];
        result += '=';
    }

    return result;
};

const sha256 = async (message: string) => {
    if ('undefined' !== typeof window && 'undefined' !== typeof window.crypto) {
        const msgUint8 = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));

        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    let crypto;
    if ('function' === typeof require) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        crypto = require('crypto');
    } else {
        throw Error('Cannot retrieve a valid crypto module');
    }

    return crypto
        .createHash('sha256')
        .update(message)
        .digest('hex');
};

export default
class PkceCodeFlowAuthenticator extends BaseAuthenticator {
    /**
     * @inheritdoc
     */
    async startAuthorization(callbackUri: string, display: AuthFlowDisplay = AuthFlowDisplay.PAGE, state?: string): Promise<never> {
        const configuration = await this._openidConfiguration;

        // Generate a random state if none is passed.
        state = state || generateRandomString(26);
        const verifier = generateRandomString(30);

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
        this._tokenPromise = this._tokenPromise || (async () => {
            const configuration = await this._openidConfiguration;
            this._tokenEndpoint = configuration.tokenEndpoint;

            const verifierItem = await this._tokenStorage.getItem('pkce_verifier_' + state);
            if (! verifierItem.isHit) {
                throw new NoTokenAvailableException('Cannot authenticate. No code verifier present on the storage.');
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
