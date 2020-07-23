const expect = require('chai').expect;

exports.shouldPassAdapterTests = function () {
    this.timeout(60000);

    beforeEach(() => {
        this._cache = this._createCachePool();
    });

    afterEach(async () => {
        if (this._cache) {
            await this._cache.clear();
        }
    });

    this.testBasicUsage = async () => {
        let item = await this._cache.getItem('key');
        item.set('4711');
        await this._cache.save(item);

        item = await this._cache.getItem('key2');
        item.set('4712');
        await this._cache.save(item);

        const fooItem = await this._cache.getItem('key');
        expect(fooItem.isHit).to.be.true;
        expect(fooItem.get()).to.be.equal('4711');

        const barItem = await this._cache.getItem('key2');
        expect(barItem.isHit).to.be.true;
        expect(barItem.get()).to.be.equal('4712');

        await this._cache.deleteItem('key');
        expect((await this._cache.getItem('key')).isHit).to.be.false;
        expect((await this._cache.getItem('key2')).isHit).to.be.true;

        await this._cache.deleteItem('key2');
        expect((await this._cache.getItem('key')).isHit).to.be.false;
        expect((await this._cache.getItem('key2')).isHit).to.be.false;
    };

    this.testBasicUsageWithLongKeys = async () => {
        const key = 'a'.repeat(300);

        let item = await this._cache.getItem(key);
        expect(item.isHit).to.be.false;
        expect(item.key).to.be.equal(key);
        item.set('value');
        expect(await this._cache.save(item)).to.be.true;

        item = await this._cache.getItem(key);
        expect(item.isHit).to.be.true;
        expect(item.key).to.be.equal(key);
        expect(item.get()).to.be.equal('value');

        expect(await this._cache.deleteItem(key)).to.be.true;

        item = await this._cache.getItem(key);
        expect(item.isHit).to.be.false;
    };

    this.testItemModifiersReturnsSelf = async () => {
        const item = await this._cache.getItem('key');

        expect(item.set('4711')).to.be.equal(item);
        expect(item.expiresAfter(2)).to.be.equal(item);
        expect(item.expiresAt(new Date(new Date().valueOf() + 7200000))).to.be.equal(item);
    };

    this.testGetItem = async () => {
        let item = await this._cache.getItem('key');
        item.set('value');
        await this._cache.save(item);

        item = await this._cache.getItem('key');
        expect(item.isHit).to.be.true;
        expect(item.key).to.be.equal('key');
        expect(item.get()).to.be.equal('value');

        item = await this._cache.getItem('key2');
        expect(item.isHit).to.be.false;
        expect(item.get()).to.be.undefined;
    };

    this.testHasItem = async () => {
        const item = await this._cache.getItem('key');
        item.set('value');
        await this._cache.save(item);

        expect(await this._cache.hasItem('key')).to.be.true;
        expect(await this._cache.hasItem('key2')).to.be.false;
    };

    this.testClear = async () => {
        const item = await this._cache.getItem('key');
        item.set('value');
        await this._cache.save(item);

        expect(await this._cache.clear()).to.be.true;
        expect((await this._cache.getItem('key')).isHit).to.be.false;
        expect(await this._cache.hasItem('key2')).to.be.false;
    };

    this.testDeleteItem = async () => {
        const item = await this._cache.getItem('key');
        item.set('value');
        await this._cache.save(item);

        expect(await this._cache.deleteItem('key')).to.be.true;
        expect((await this._cache.getItem('key')).isHit).to.be.false;
        expect(await this._cache.hasItem('key')).to.be.false;

        // Requesting deletion of non-existent key should return true
        expect(await this._cache.deleteItem('key2')).to.be.true;
    };

    this.testSave = async () => {
        const item = await this._cache.getItem('key');
        item.set('value');

        expect(await this._cache.save(item)).to.be.true;
        expect((await this._cache.getItem('key')).get()).to.be.equal('value');
    };

    this.testSaveExpired = async () => {
        const item = await this._cache.getItem('key');
        item.set('value');
        item.expiresAt(new Date(new Date().valueOf() + 10000));
        expect(await this._cache.save(item)).to.be.true;
        item.expiresAt(new Date(new Date().valueOf() - 1000));
        await this._cache.save(item);

        expect(await this._cache.hasItem('key')).to.be.false;
    };

    this.testDefaultLifetime = async () => {
        const cache = this._createCachePool(2);

        let item = await cache.getItem('key.dlt');
        item.set('value');
        await cache.save(item);

        await __jymfony.sleep(1000);
        item = await cache.getItem('key.dlt');
        expect(item.isHit).to.be.true;

        await __jymfony.sleep(2000);
        item = await cache.getItem('key.dlt');
        expect(item.isHit).to.be.false;
    };

    this.testExpiration = async () => {
        await this._cache.save((await this._cache.getItem('k1')).set('v1').expiresAfter(2));
        await this._cache.save((await this._cache.getItem('k2')).set('v2').expiresAfter(366 * 86400));

        await __jymfony.sleep(3000);
        let item = await this._cache.getItem('k1');
        expect(item.isHit).to.be.false;
        expect(item.get()).to.be.undefined;

        item = await this._cache.getItem('k2');
        expect(item.isHit).to.be.true;
        expect(item.get()).to.be.equal('v2');
    };

    this.run = () => {
        it('should work', this.testBasicUsage);
        it('should use default lifetime', this.testDefaultLifetime);
        it('should respect expiration', this.testExpiration);
        it('should work with long keys', this.testBasicUsageWithLongKeys);
        it('modifiers should returns same object (fluid interface)', this.testItemModifiersReturnsSelf);
        it('getItem should work', this.testGetItem);
        it('hasItem should work', this.testHasItem);
        it('clear should work', this.testClear);
        it('deleteItem should work', this.testDeleteItem);
        it('save should work', this.testSave);
        it('save should discard expired items', this.testSaveExpired);
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
    this._createCachePool = (defaultLifetime = undefined) => { // eslint-disable-line no-unused-vars
        throw new Error('You should implement _createCachePool method');
    };
};
