const InMemoryStorage = Solido.Atlante.Storage.InMemoryStorage;
const AdapterTestCase = require('./AdapterTestCase');

describe('[Storage] InMemoryStorage', function () {
    AdapterTestCase.shouldPassAdapterTests.call(this);

    this.testBasicUsageWithLongKeys = undefined;
    this._createCachePool = (defaultLifetime = undefined) => {
        return new InMemoryStorage(defaultLifetime);
    };

    this.run();
});
