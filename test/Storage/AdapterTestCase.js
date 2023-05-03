const TestCase = Jymfony.Component.Testing.Framework.TestCase;

/**
 * @memberOf Solido.Atlante.Tests.Storage
 */
export default class AdapterTestCase extends TestCase {
    /**
     * @type {Solido.Atlante.Storage.StorageInterface}
     */
    _cache;

    beforeEach() {
        this._cache = this._createCachePool();
    }

    async afterEach() {
        if (this._cache) {
            await this._cache.clear();
        }
    }

    async testBasicUsage() {
        let item = await this._cache.getItem('key');
        item.set('4711');
        await this._cache.save(item);

        item = await this._cache.getItem('key2');
        item.set('4712');
        await this._cache.save(item);

        const fooItem = await this._cache.getItem('key');
        __self.assertTrue(fooItem.isHit);
        __self.assertEquals('4711', fooItem.get());

        const barItem = await this._cache.getItem('key2');
        __self.assertTrue(barItem.isHit);
        __self.assertEquals('4712', barItem.get());

        await this._cache.deleteItem('key');
        __self.assertFalse((await this._cache.getItem('key')).isHit);
        __self.assertTrue((await this._cache.getItem('key2')).isHit);

        await this._cache.deleteItem('key2');
        __self.assertFalse((await this._cache.getItem('key')).isHit);
        __self.assertFalse((await this._cache.getItem('key2')).isHit);
    }

    async testBasicUsageWithLongKeys() {
        const key = 'a'.repeat(300);

        let item = await this._cache.getItem(key);
        __self.assertFalse(item.isHit);
        __self.assertEquals(key, item.key);
        item.set('value');
        __self.assertTrue(await this._cache.save(item));

        item = await this._cache.getItem(key);
        __self.assertTrue(item.isHit);
        __self.assertEquals(key, item.key);
        __self.assertEquals('value', item.get());

        __self.assertTrue(await this._cache.deleteItem(key));

        item = await this._cache.getItem(key);
        __self.assertFalse(item.isHit);
    }

    async testItemModifiersReturnsSelf() {
        const item = await this._cache.getItem('key');

        __self.assertEquals(item, item.set('4711'));
        __self.assertEquals(item, item.expiresAfter(2));
        __self.assertEquals(item, item.expiresAt(new Date(new Date().valueOf() + 7200000)));
    }

    async testGetItem() {
        let item = await this._cache.getItem('key');
        item.set('value');
        await this._cache.save(item);

        item = await this._cache.getItem('key');
        __self.assertTrue(item.isHit);
        __self.assertEquals('key', item.key);
        __self.assertEquals('value', item.get());

        item = await this._cache.getItem('key2');
        __self.assertFalse(item.isHit);
        __self.assertUndefined(item.get());
    }

    async testHasItem() {
        const item = await this._cache.getItem('key');
        item.set('value');
        await this._cache.save(item);

        __self.assertTrue(await this._cache.hasItem('key'));
        __self.assertFalse(await this._cache.hasItem('key2'));
    }

    async testClear() {
        const item = await this._cache.getItem('key');
        item.set('value');
        await this._cache.save(item);

        __self.assertTrue(await this._cache.clear());
        __self.assertFalse((await this._cache.getItem('key')).isHit);
        __self.assertFalse(await this._cache.hasItem('key2'));
    }

    async testDeleteItem() {
        const item = await this._cache.getItem('key');
        item.set('value');
        await this._cache.save(item);

        __self.assertTrue(await this._cache.deleteItem('key'));
        __self.assertFalse((await this._cache.getItem('key')).isHit);
        __self.assertFalse(await this._cache.hasItem('key'));

        // Requesting deletion of non-existent key should return true
        __self.assertTrue(await this._cache.deleteItem('key2'));
    }

    async testSave() {
        const item = await this._cache.getItem('key');
        item.set('value');

        __self.assertTrue(await this._cache.save(item));
        __self.assertEquals('value', (await this._cache.getItem('key')).get());
    }

    async testSaveExpired() {
        const item = await this._cache.getItem('key');
        item.set('value');
        item.expiresAt(new Date(new Date().valueOf() + 10000));
        __self.assertTrue(await this._cache.save(item));
        item.expiresAt(new Date(new Date().valueOf() - 1000));
        await this._cache.save(item);

        __self.assertFalse(await this._cache.hasItem('key'));
    };

    async testDefaultLifetime() {
        this.setTimeout(30000);
        const cache = this._createCachePool(2);

        let item = await cache.getItem('key.dlt');
        item.set('value');
        await cache.save(item);

        await __jymfony.sleep(1000);
        item = await cache.getItem('key.dlt');
        __self.assertTrue(item.isHit);

        await __jymfony.sleep(2000);
        item = await cache.getItem('key.dlt');
        __self.assertFalse(item.isHit);
    }

    async testExpiration() {
        this.setTimeout(30000);
        await this._cache.save((await this._cache.getItem('k1')).set('v1').expiresAfter(2));
        await this._cache.save((await this._cache.getItem('k2')).set('v2').expiresAfter(366 * 86400));

        await __jymfony.sleep(3000);
        let item = await this._cache.getItem('k1');
        __self.assertFalse(item.isHit);
        __self.assertUndefined(item.get());

        item = await this._cache.getItem('k2');
        __self.assertTrue(item.isHit);
        __self.assertEquals('v2', item.get());
    };

    /**
     * Creates a cache pool for the test suite.
     *
     * @param {int} [defaultLifetime]
     *
     * @returns {StorageInterface}
     *
     * @protected
     * @abstract
     */
    _createCachePool(defaultLifetime = undefined) { // eslint-disable-line no-unused-vars
        throw new Error('You should implement _createCachePool method');
    }
}
