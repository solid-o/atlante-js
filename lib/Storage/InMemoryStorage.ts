import Storage, { StorageInterface } from './StorageInterface.js';
import Item from './Item.js';
import { ItemInterface } from './ItemInterface.js';
import JSONMarshaller from './Marshaller/JSONMarshaller.js';
import { MarshallerInterface } from './Marshaller/MarshallerInterface.js';

export default
class InMemoryStorage extends implementationOf(Storage) implements StorageInterface {
    public marshaller: MarshallerInterface;

    /**
     * Create a cache item for the current adapter.
     */
    private readonly _createCacheItem: (key: string, value: any, isHit: boolean) => ItemInterface;

    private _values: Record<string, string>;
    private _expiries: Record<string, number>;
    private _pruneInterval: any;

    constructor(defaultLifetime?: number) {
        super();

        this._createCacheItem = (key, value, isHit) => {
            const item: any = new Item();
            item._key = key;
            item._value = value;
            item._isHit = isHit;
            item._defaultLifetime = defaultLifetime;

            return item;
        };

        this.marshaller = new JSONMarshaller();
        this._values = {};
        this._expiries = {};
        this._pruneInterval = undefined;
    }

    /**
     * Deletes the expired items.
     */
    async prune(): Promise<boolean> {
        const time = new Date().getTime();
        let ok = true;
        for (const key of Object.keys(this._expiries)) {
            if (time < this._expiries[key]) {
                continue;
            }

            ok = await this.deleteItem(key) && ok;
        }

        return ok;
    }

    /**
     * @inheritdoc
     */
    async getItem(key: string): Promise<ItemInterface> {
        let value;
        let isHit = await this.hasItem(key);

        try {
            if (! isHit || 'undefined' === (value = this._values[key])) {
                this._values[key] = value = undefined;
            } else if (undefined === (value = this.marshaller.unmarshall(value))) {
                this._values[key] = value = undefined;
                isHit = false;
            }
        } catch (e) {
            this._values[key] = value = undefined;
            isHit = false;
        }

        return this._createCacheItem(key, value, isHit);
    }

    /**
     * @inheritdoc
     */
    async hasItem(key: string): Promise<boolean> {
        return undefined !== this._expiries[key] && this._expiries[key] >= new Date().getTime() || ! (await this.deleteItem(key));
    }

    /**
     * @inheritdoc
     */
    async clear(): Promise<boolean> {
        this._values = {};
        this._expiries = {};
        if (undefined !== this._pruneInterval) {
            clearInterval(this._pruneInterval);
        }

        return true;
    }

    /**
     * @inheritdoc
     */
    async deleteItem(key: string): Promise<boolean> {
        delete this._values[key];
        delete this._expiries[key];

        if (undefined !== this._pruneInterval && 0 === Object.keys(this._expiries).length) {
            clearInterval(this._pruneInterval);
            this._pruneInterval = undefined;
        }

        return true;
    }

    /**
     * @inheritdoc
     */
    async save(item: ItemInterface): Promise<boolean> {
        const key = (item as any)._key;
        let value = (item as any)._value;
        let expiry = (item as any)._expiry;

        if (expiry && expiry <= new Date().getTime()) {
            await this.deleteItem(key);

            return true;
        }

        try {
            value = this.marshaller.marshall(value);
        } catch (e) {
            return false;
        }

        if (undefined === expiry && 0 < (item as any)._defaultLifetime) {
            expiry = new Date().getTime() + ((item as any)._defaultLifetime * 1000);
        }

        this._values[key] = value;
        this._expiries[key] = undefined !== expiry ? expiry : Infinity;

        if (undefined === this._pruneInterval) {
            this._pruneInterval = setInterval(this.prune.bind(this), 60000);
        }

        return true;
    }
}
