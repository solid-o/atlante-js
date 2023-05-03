const AdapterTestCase = Solido.Atlante.Tests.Storage.AdapterTestCase;
const InMemoryStorage = Solido.Atlante.Storage.InMemoryStorage;

export default
@timeSensitive()
class InMemoryStorageTest extends AdapterTestCase {
    async testBasicUsageWithLongKeys() {
        this.markTestSkipped();
    }

    _createCachePool(defaultLifetime = undefined) {
        return new InMemoryStorage(defaultLifetime);
    }
}
