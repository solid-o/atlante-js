const ProvidedTokenStorage = Solido.Atlante.Storage.ProvidedTokenStorage;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class ProvidedTokenStorageTest extends TestCase {
    async testHasOnlyAccessTokenAndRefreshTokenItems() {
        const storage = new ProvidedTokenStorage('access', 'refresh');

        __self.assertTrue(await storage.hasItem('access_token'));
        __self.assertTrue(await storage.hasItem('refresh_token'));
        __self.assertFalse(await storage.hasItem('foobar'));
    }

    async testHasNotItemsByDefault() {
        const storage = new ProvidedTokenStorage();

        __self.assertFalse(await storage.hasItem('access_token'));
        __self.assertFalse(await storage.hasItem('refresh_token'));
        __self.assertFalse(await storage.hasItem('foobar'));
    }

    async testGetItemShouldReturnAnItem() {
        const storage = new ProvidedTokenStorage('access', 'refresh');
        __self.assertEquals('access', (await storage.getItem('access_token')).get());
        __self.assertEquals('refresh', (await storage.getItem('refresh_token')).get());
    }
}
