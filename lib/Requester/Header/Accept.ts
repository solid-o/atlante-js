import BaseAccept from './BaseAccept';

export default
class Accept extends BaseAccept {
    private readonly _basePart: string;
    private readonly _subPart: string;

    /**
     * Constructor.
     */
    constructor(value: string) {
        super(value);

        if ('*' === this._type) {
            this._type = '*/*';
        }

        const parts = this._type.split('/');
        if (2 !== parts.length || ! parts[0] || ! parts[1]) {
            throw new Error('Invalid media type');
        }

        this._basePart = parts[0];
        this._subPart = parts[1];
    }

    get subPart(): string {
        return this._subPart;
    }

    get basePart(): string {
        return this._basePart;
    }
}
