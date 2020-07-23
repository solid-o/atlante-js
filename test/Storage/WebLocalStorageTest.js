const LocalStorage = require('node-localstorage').LocalStorage;
const { tmpdir } = require('os');
localStorage = new LocalStorage(tmpdir() + '/scratch');

const WebLocalStorage = Solido.Atlante.Storage.WebLocalStorage;
const AdapterTestCase = require('./AdapterTestCase');

describe('[Storage] WebLocalStorage', function () {
    AdapterTestCase.shouldPassAdapterTests.call(this);

    this.testBasicUsageWithLongKeys = undefined;
    this._createCachePool = (defaultLifetime = undefined) => {
        return new WebLocalStorage(defaultLifetime);
    };

    this.run();
});
