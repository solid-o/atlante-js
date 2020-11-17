import { AdapterTestCase } from './AdapterTestCase';
import { LocalStorage } from 'node-localstorage';
import { tmpdir } from 'os';

const WebLocalStorage = Solido.Atlante.Storage.WebLocalStorage;

export default class WebLocalStorageTest extends AdapterTestCase {
    before() {
        global.localStorage = new LocalStorage(tmpdir() + '/scratch');
    }

    async testBasicUsageWithLongKeys() {
        this.markTestSkipped();
    }

    _createCachePool(defaultLifetime = undefined) {
        return new WebLocalStorage(defaultLifetime);
    }
}
