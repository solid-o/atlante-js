import '@jymfony/util/lib/String/trim';
import ArrayUtils from '../../Utils/ArrayUtils';

export default
class BaseAccept {
    protected _type: string;

    private readonly _quality: number;
    private readonly _value: string;
    private _normalized: string;
    private readonly _parameters: Record<string, string>;

    /**
     * Constructor.
     *
     * @param {string} value
     */
    protected constructor(value: string) {
        const [ type, parameters ] = this._parseParameters(value);

        if (!! parameters.q) {
            this._quality = parseFloat(parameters.q);
            delete parameters.q;
        } else {
            this._quality = 1.0;
        }

        this._value = value;
        this._type = type.trim().toLowerCase();
        this._parameters = parameters;
    }

    /**
     * Gets the string representation of this header.
     */
    toString(): string {
        return this.normalizedValue;
    }

    get normalizedValue(): string {
        return this._type + (0 < Object.keys(this._parameters).length ? '; ' + this._buildParametersString(this._parameters) : '');
    }

    get value(): string {
        return this._value;
    }

    get type(): string {
        return this._type;
    }

    get quality(): number {
        return this._quality;
    }

    get parameters(): Record<string, string> {
        return { ...this._parameters };
    }

    /**
     * Adds a parameter to the accept header.
     */
    setParameter(key: string, value: string): void {
        if (undefined === value || null === value) {
            delete this._parameters[key];
            return;
        }

        this._parameters[key] = String(value);
    }

    getParameter(key: string, default_?: any): string | any {
        return undefined !== this._parameters[key] ? this._parameters[key] : default_;
    }

    /**
     * Checks if a parameter is set.
     */
    hasParameter(key: string): boolean {
        return undefined !== this._parameters[key];
    }

    /**
     * Parses accept header parameters.
     */
    private _parseParameters(acceptPart: string): [string, Record<string, string>] {
        const [ type, ...parts ] = acceptPart.split(';');

        const parameters: Record<string, string> = {};
        for (let part of parts) {
            const split = part.split('=');
            if (2 !== split.length) {
                continue;
            }

            const key = split[0].trim().toLowerCase();
            parameters[key] = __jymfony.trim(part[1], ' "');
        }

        return [ type, parameters ];
    }

    private _buildParametersString(parameters: Record<string, string>): string {
        const parts = [];

        parameters = ArrayUtils.ksort(parameters);
        for (const [ key, val ] of Object.entries(parameters)) {
            parts.push(String(key) + '=' + String(val));
        }

        return parts.join('; ');
    }
}
