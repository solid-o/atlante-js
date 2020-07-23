import Storage, { StorageInterface } from './StorageInterface';
import { ItemInterface } from './ItemInterface';

export default
class ChainStorage extends implementationOf(Storage) implements StorageInterface {
    private readonly _storages: StorageInterface[];

    /**
     * Constructor.
     */
    constructor(storages?: StorageInterface[]) {
        super();
        this._storages = storages;
    }

    /**
     * Adds a storage to the chain.
     */
    addStorage(storage: StorageInterface): void {
        this._storages.push(storage);
    }

    /**
     * @inheritdoc
     */
    async getItem(key: string): Promise<ItemInterface> {
        let item;
        for (const storage of this._storages) {
            try {
                item = await storage.getItem(key);
                if (! item.isHit) {
                    continue;
                }

                break;
            } catch (e) {
                // Continue to the next storage.
            }
        }

        if (undefined === item) {
            throw new Error('No available storage.');
        }

        return item;
    }

    /**
     * @inheritdoc
     */
    async hasItem(key: string): Promise<boolean> {
        for (const storage of this._storages) {
            try {
                if (await storage.hasItem(key)) {
                    return true;
                }
            } catch (e) {
                // Continue to the next storage.
            }
        }

        return false;
    }

    /**
     * @inheritdoc
     */
    clear(): Promise<boolean> {
        return this._call('clear');
    }

    /**
     * @inheritdoc
     */
    deleteItem(key: string): Promise<boolean> {
        return this._call('deleteItem', key);
    }

    /**
     * @inheritdoc
     */
    save(item: ItemInterface): Promise<boolean> {
        return this._call('save', item);
    }

    /**
     * Chain-call storages.
     */
    private async _call(method: 'clear' | 'deleteItem' | 'save', ...args: any[]): Promise<any> {
        for (const storage of this._storages) {
            try {
                // @ts-ignore
                return await storage[method](...args);
            } catch (e) {
                // Continue to the next storage.
            }
        }

        throw new Error('No available storage.');
    }
}
