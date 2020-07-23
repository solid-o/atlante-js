const ProvidedTokenStorage = Solido.Atlante.Storage.ProvidedTokenStorage;
const { expect } = require('chai');

describe('[Storage] ProvidedTokenStorage', function () {
    it ('has only access_token and refresh_token items', async () => {
        const storage = new ProvidedTokenStorage('access', 'refresh');

        expect(await storage.hasItem('access_token')).to.be.true;
        expect(await storage.hasItem('refresh_token')).to.be.true;
        expect(await storage.hasItem('foobar')).to.be.false;
    });

    it ('has no items by default', async () => {
        const storage = new ProvidedTokenStorage();

        expect(await storage.hasItem('access_token')).to.be.false;
        expect(await storage.hasItem('refresh_token')).to.be.false;
        expect(await storage.hasItem('foobar')).to.be.false;
    });

    it ('getItem should return an item', async () => {
        const storage = new ProvidedTokenStorage('access', 'refresh');
        expect((await storage.getItem('access_token')).get()).to.be.eq('access');
        expect((await storage.getItem('refresh_token')).get()).to.be.eq('refresh');
    });
});
