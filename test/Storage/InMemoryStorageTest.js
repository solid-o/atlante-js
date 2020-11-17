import { AdapterTestCase } from './AdapterTestCase';
const InMemoryStorage = Solido.Atlante.Storage.InMemoryStorage;

export default class InMemoryStorageTest extends AdapterTestCase {
    async testBasicUsageWithLongKeys() {
        this.markTestSkipped();
    }

    _createCachePool(defaultLifetime = undefined) {
        return new InMemoryStorage(defaultLifetime);
    }
}
