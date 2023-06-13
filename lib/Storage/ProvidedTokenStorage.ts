import AbstractStorage from './AbstractStorage.js';
import NullMarshaller from './Marshaller/NullMarshaller.js';

export default
class ProvidedTokenStorage extends AbstractStorage {
    private _accessToken?: string;
    private _refreshToken?: string;

    /**
     * Constructor.
     */
    constructor(accessToken?: string | undefined, refreshToken?: string | undefined) {
        super();

        this._accessToken = accessToken;
        this._refreshToken = refreshToken;
        this.marshaller = new NullMarshaller();
    }

    /**
     * @inheritdoc
     */
    async hasItem(key: string): Promise<boolean> {
        return (('access_token' === key && undefined !== this._accessToken) ||
            ('refresh_token' === key && undefined !== this._refreshToken));
    }

    /**
     * @inheritdoc
     */
    async clear(): Promise<boolean> {
        this._accessToken = undefined;
        this._refreshToken = undefined;

        return true;
    }

    /**
     * @inheritdoc
     */
    async deleteItem(key: string): Promise<boolean> {
        switch (key) {
            case 'access_token':
                this._accessToken = undefined;
                break;

            case 'refresh_token':
                this._refreshToken = undefined;
                break;
        }

        return true;
    }

    /**
     * @inheritdoc
     */
    async _getItem(key: string): Promise<any> {
        switch (key) {
            case 'access_token':
                return this._accessToken;

            case 'refresh_token':
                return this._refreshToken;
        }

        return undefined;
    }

    /**
     * @inheritdoc
     */
    async _save(key: string, value: any, expiry: Date): Promise<boolean> { // eslint-disable-line no-unused-vars
        switch (key) {
            case 'access_token':
                this._accessToken = value;
                return true;

            case 'refresh_token':
                this._refreshToken = value;
                return true;
        }

        return false;
    }
}
