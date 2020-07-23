import Accept from './Header/Accept';
import BaseAccept from './Header/BaseAccept';

export default
class Headers {
    private _headers: Record<string, (string | Accept)[]> = {};
    private _headersName: Record<string, string> = {};

    /**
     * Constructor.
     */
    constructor(headers: Record<string, string|string[]> | Headers = null) {
        if (headers instanceof Headers) {
            return headers;
        }

        if (null !== headers) {
            for (const [ key, value ] of Object.entries(headers)) {
                this.set(key, value);
            }
        }
    }

    /**
     * Sets an header.
     */
    set(name: 'Accept', value: string | Accept): this;
    set(name: string, value: string | Accept | string[]): this;
    set(name: string, value: string | Accept | string[]): this {
        const lowerName = name.toLowerCase();

        if ('accept' === lowerName && ! (value instanceof Accept)) {
            value = new Accept('string' === typeof value ? value : value[0]);
        }

        if (value instanceof BaseAccept && ! lowerName.startsWith('accept')) {
            throw new Error('Cannot set accept to non-Accept header');
        }

        this._headers[lowerName] = Array.isArray(value) ? value : [ value ];
        this._headersName[lowerName] = name;

        return this;
    }

    /**
     * Gets an header by name.
     */
    get(name: 'Accept'): Accept | undefined;
    get(name: string): string | string[] | undefined;
    get(name: string): string | Accept | (string | Accept)[] | undefined {
        if (! this.has(name)) {
            return undefined;
        }

        const lowerName = name.toLowerCase();
        const hdr = this._headers[lowerName];

        return 1 === hdr.length ? hdr[0] : hdr;
    }

    /**
     * Checks whether an header is present.
     */
    has(name: string): boolean {
        return Object.prototype.hasOwnProperty.call(this._headers, name.toLowerCase());
    }

    /**
     * Removes an header.
     */
    remove(name: string): this {
        const lowerName = name.toLowerCase();

        delete this._headers[lowerName];
        delete this._headersName[lowerName];

        return this;
    }

    /**
     * Adds an header.
     */
    add(name: 'Accept', value: string | Accept): Headers;
    add(name: string, value: string | Accept | string[]): Headers;
    add(name: string, value: string | Accept | string[]): Headers {
        if (! this.has(name)) {
            return this.set(name, value);
        }

        const lowerName = name.toLowerCase();
        if ('accept' === lowerName && ! (value instanceof Accept)) {
            value = new Accept('string' === typeof value ? value : value[0]);
        }

        if (value instanceof BaseAccept) {
            return this.set(name, value);
        }

        value = ! Array.isArray(value) ? [ value ] : value;
        this._headers[lowerName] = [ ...this._headers[lowerName], ...value ];

        return this;
    }

    get all(): Record<string, string | string[]> {
        const headers: Record<string, string | string[]> = {};
        for (const name of Object.keys(this._headersName)) {
            const headerName = this._headersName[name];
            let header: unknown = this._headers[name];

            if (isArray(header) && 1 === header.length) {
                header = header[0].toString();
            }

            headers[headerName] = isArray(header) ? header.map(String) : String(header);
        }

        return headers;
    }
}
