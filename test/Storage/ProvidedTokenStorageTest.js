import { expect } from 'chai';

const ProvidedTokenStorage = Solido.Atlante.Storage.ProvidedTokenStorage;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class ProvidedTokenStorageTest extends TestCase {
    async testHasOnlyAccessTokenAndRefreshTokenItems() {
        const storage = new ProvidedTokenStorage('access', 'refresh');

        expect(await storage.hasItem('access_token')).to.be.true;
        expect(await storage.hasItem('refresh_token')).to.be.true;
        expect(await storage.hasItem('foobar')).to.be.false;
    }

    async testHasNotItemsByDefault() {
        const storage = new ProvidedTokenStorage();

        expect(await storage.hasItem('access_token')).to.be.false;
        expect(await storage.hasItem('refresh_token')).to.be.false;
        expect(await storage.hasItem('foobar')).to.be.false;
    }

    async testGetItemShouldReturnAnItem() {
        const storage = new ProvidedTokenStorage('access', 'refresh');
        expect((await storage.getItem('access_token')).get()).to.be.eq('access');
        expect((await storage.getItem('refresh_token')).get()).to.be.eq('refresh');
    }
}
