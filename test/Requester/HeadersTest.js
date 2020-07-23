const Headers = Solido.Atlante.Requester.Headers;
const { expect } = require('chai');

describe('[Requester] Headers', function () {
    it ('set should overwrite existing header', () => {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');
        h.set('Content-Type', 'bar/baz');

        expect(h.get('Content-Type')).to.be.eq('bar/baz');
    });

    it ('add should not overwrite existing header', () => {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');
        h.add('Content-Type', 'bar/baz');

        expect(h.get('Content-Type')).to.be.deep.eq([ 'foo/bar', 'bar/baz' ]);
    });

    it ('header names should be normalized', () => {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');
        h.add('CONTENT-TYPE', 'bar/baz');

        expect(h.has('CoNtEnT-TyPe')).to.be.true;
        expect(h.get('content-type')).to.be.deep.eq([ 'foo/bar', 'bar/baz' ]);
    });

    it ('remove should unset all the headers with the given name', () => {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');
        h.add('Content-Type', 'bar/baz');

        h.remove('content-type');
        expect(h.has('content-type')).to.be.false;
    });

    it ('get should return undefined if header is not present', () => {
        const h = new Headers();
        expect(h.get('Content-Type')).to.be.undefined;
    });

    it ('get should return the header value', () => {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');
        h.add('Content-Type', 'bar/baz');
        h.add('Content-Type', 'baz/baz');

        expect(h.get('content-type')).to.be.deep.eq([ 'foo/bar', 'bar/baz', 'baz/baz' ]);
    });

    it ('get should return all the header values', () => {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');

        expect(h.get('content-type')).to.be.eq('foo/bar');
    });
});
