import Storage from 'dom-storage';

const AdapterTestCase = Solido.Atlante.Tests.Storage.AdapterTestCase;
const WebLocalStorage = Solido.Atlante.Storage.WebLocalStorage;

export default
@timeSensitive()
class WebLocalStorageTest extends AdapterTestCase {
    before() {
        global.localStorage = new Storage(null, { strict: true });
    }

    async testBasicUsageWithLongKeys() {
        this.markTestSkipped();
    }

    _createCachePool(defaultLifetime = undefined) {
        return new WebLocalStorage(defaultLifetime);
    }
}
