import Interface, { ItemInterface } from './ItemInterface';

export default
class Item extends implementationOf(Interface) implements ItemInterface {
    private readonly _key: string;
    private _value: any;
    private readonly _isHit: boolean;
    private _expiry: number;
    private readonly _defaultLifetime: undefined | number;

    constructor() {
        super();

        this._key = undefined;
        this._value = undefined;
        this._isHit = false;
        this._expiry = undefined;
        this._defaultLifetime = undefined;
    }

    /**
     * @inheritdoc
     */
    get(): any {
        return this._value;
    }

    /**
     * @inheritdoc
     */
    set(value: any): this {
        this._value = value;

        return this;
    }

    /**
     * @inheritdoc
     */
    get isHit(): boolean {
        return this._isHit;
    }

    /**
     * @inheritdoc
     */
    get key(): string {
        return this._key;
    }

    /**
     * @inheritdoc
     */
    expiresAt(expiration: Date | undefined | null): this {
        if (null === expiration || undefined === expiration) {
            this._expiry = 0 < this._defaultLifetime ? new Date().setTime(new Date().getTime() + (this._defaultLifetime * 1000)) : undefined;
        } else if (expiration instanceof Date) {
            this._expiry = expiration.getTime();
        } else {
            throw new Error('Expiration date must an instance of Date or be null or undefined, "' + typeof expiration + '" given');
        }

        return this;
    }

    /**
     * @inheritdoc
     */
    expiresAfter(time: number | undefined): this {
        if (null === time || undefined === time) {
            this._expiry = 0 < this._defaultLifetime ? new Date().setTime(new Date().getTime() + (this._defaultLifetime * 1000)) : undefined;
        } else if ('number' === typeof time) {
            this._expiry = new Date().setTime(new Date().getTime() + (time * 1000));
        } else {
            throw new Error('Expiration date must an instance of TimeSpan, a Number or be null or undefined, "' + typeof time + '" given');
        }

        return this;
    }
}
