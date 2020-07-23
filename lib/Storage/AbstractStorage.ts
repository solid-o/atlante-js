import Storage, { StorageInterface } from './StorageInterface';
import Item from './Item';
import { ItemInterface } from './ItemInterface';
import JSONMarshaller from './Marshaller/JSONMarshaller';
import { MarshallerInterface } from './Marshaller/MarshallerInterface';

export default
abstract class AbstractStorage extends implementationOf(Storage) implements StorageInterface {
    public marshaller: MarshallerInterface;
    private readonly _createItem: (key: string, value: any, isHit: boolean) => ItemInterface;

    constructor(defaultLifetime?: number) {
        super();

        /**
         * Create a cache item for the current adapter.
         */
        this._createItem = (key, value, isHit) => {
            const item: any = new Item();
            item._key = key;
            item._value = value;
            item._isHit = isHit;
            item._defaultLifetime = defaultLifetime;

            return item;
        };

        /**
         * @type {MarshallerInterface}
         */
        this.marshaller = new JSONMarshaller();
    }

    /**
     * @inheritdoc
     */
    async getItem(key: string): Promise<ItemInterface> {
        let value;
        let isHit = await this.hasItem(key);

        try {
            if (! isHit || 'undefined' === (value = await this._getItem(key))) {
                value = undefined;
            } else if (undefined === (value = this.marshaller.unmarshall(value))) {
                value = undefined;
                isHit = false;
            }
        } catch (e) {
            console.warn('Failed to unserialize key "' + key + '"');

            value = undefined;
            isHit = false;
        }

        return this._createItem(key, value, isHit);
    }

    /**
     * @inheritdoc
     */
    async abstract hasItem(key: string): Promise<boolean>;

    /**
     * @inheritdoc
     */
    async clear(): Promise<boolean> {
        return false;
    }

    /**
     * @inheritdoc
     */
    async abstract deleteItem(key: string): Promise<boolean>;

    /**
     * @inheritdoc
     */
    async save(item: ItemInterface): Promise<boolean> {
        const key = (item as any)._key;
        let value = (item as any)._value;
        let expiry = (item as any)._expiry;

        if (expiry && expiry <= ~~(new Date().getTime() / 1000)) {
            await this.deleteItem(key);

            return true;
        }

        try {
            value = this.marshaller.marshall(value);
            if (undefined === value) {
                value = 'undefined';
            }
        } catch (e) {
            console.warn(`Failed to save key "${key}" (${typeof value})`);

            return false;
        }

        if (undefined === expiry && 0 < (item as any)._defaultLifetime) {
            expiry = new Date().setTime(new Date().getTime() + ((item as any)._defaultLifetime * 1000));
        } else if (undefined === expiry) {
            expiry = null;
        }

        return await this._save(key, value, expiry);
    }

    /**
     * Gets an item from the storage, if not expired.
     */
    protected async abstract _getItem(key: string): Promise<string>;

    /**
     * Stores an item into the storage.
     */
    protected async abstract _save(key: string, value: string, expiry: Date): Promise<boolean>;
}
