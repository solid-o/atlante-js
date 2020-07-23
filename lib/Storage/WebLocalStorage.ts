import AbstractStorage from './AbstractStorage';

export default
class WebLocalStorage extends AbstractStorage {
    /**
     * @inheritdoc
     */
    async hasItem(key: string): Promise<boolean> {
        let item;
        try {
            item = localStorage.getItem(key);
        } catch (e) {
            return false;
        }

        if (null === item) {
            return false;
        }

        try {
            item = this.marshaller.unmarshall(item);
            const expiry = item.expiry;

            return null === expiry || expiry >= new Date().getTime();
        } catch (e) {
            return false;
        }
    }

    async clear(): Promise<boolean> {
        localStorage.clear();
        return true;
    }

    /**
     * @inheritdoc
     */
    async deleteItem(key: string): Promise<boolean> {
        localStorage.removeItem(key);

        return true;
    }

    /**
     * @inheritdoc
     */
    protected async _getItem(key: string): Promise<string> {
        let item;
        if (! (item = localStorage.getItem(key)) || ! (item = this.marshaller.unmarshall(item))) {
            return undefined;
        }

        return item.value;
    }

    /**
     * @inheritdoc
     */
    protected async _save(key: string, value: string, expiry: Date): Promise<boolean> {
        localStorage.setItem(key, this.marshaller.marshall({ value, expiry }));

        return true;
    }
}
