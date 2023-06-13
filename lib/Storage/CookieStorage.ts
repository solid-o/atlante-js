import AbstractStorage from './AbstractStorage.js';

const getCookie = (key: string) => {
    const name = key + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';')
        .map(str => str.trim());

    for (const c of ca) {
        if (0 === c.indexOf(name)) {
            return c.substring(name.length, c.length);
        }
    }

    return undefined;
};

export default
class CookieStorage extends AbstractStorage {
    private readonly _cookieDomain: string;

    constructor(cookieDomain?: string, defaultLifetime?: number) {
        super(defaultLifetime);
        this._cookieDomain = cookieDomain;
    }

    /**
     * @inheritdoc
     */
    async hasItem(key: string): Promise<boolean> {
        return !! document.cookie.match(new RegExp('(^|;)\\s*'+key+'='));
    }

    /**
     * @inheritdoc
     */
    async deleteItem(key: string): Promise<boolean> {
        document.cookie = key + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/' +
            (this._cookieDomain ? ';domain='+this._cookieDomain : '');

        return true;
    }

    /**
     * @inheritdoc
     */
    protected async _getItem(key: string): Promise<string> {
        return getCookie(key);
    }

    /**
     * @inheritdoc
     */
    protected async _save(key: string, value: string, expiry: Date): Promise<boolean> {
        const d = new Date();
        d.setTime(expiry.getTime());

        document.cookie = key + '=' + value + ';' +
            'expires='+ d.toUTCString() + ';path=/' +
            (this._cookieDomain ? ';domain='+this._cookieDomain : '')
        ;

        return true;
    }
}
