import { expect } from 'chai';

const Headers = Solido.Atlante.Requester.Headers;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class HeadersTest extends TestCase {
    testSetShouldOverwriteExistingHeader() {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');
        h.set('Content-Type', 'bar/baz');

        expect(h.get('Content-Type')).to.be.eq('bar/baz');
    }

    testAddShouldNotOverwriteExistingHeader() {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');
        h.add('Content-Type', 'bar/baz');

        expect(h.get('Content-Type')).to.be.deep.eq([ 'foo/bar', 'bar/baz' ]);
    }

    testHeaderNamesShouldBeNormalized() {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');
        h.add('CONTENT-TYPE', 'bar/baz');

        expect(h.has('CoNtEnT-TyPe')).to.be.true;
        expect(h.get('content-type')).to.be.deep.eq([ 'foo/bar', 'bar/baz' ]);
    }

    testRemoveShouldUnsetAllTheHeadersWithTheGivenName() {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');
        h.add('Content-Type', 'bar/baz');

        h.remove('content-type');
        expect(h.has('content-type')).to.be.false;
    }

    testGetShouldReturnUndefinedIfHeaderIsNotPresent() {
        const h = new Headers();
        expect(h.get('Content-Type')).to.be.undefined;
    }

    testGetShouldReturnTheHeaderValue() {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');
        h.add('Content-Type', 'bar/baz');
        h.add('Content-Type', 'baz/baz');

        expect(h.get('content-type')).to.be.deep.eq([ 'foo/bar', 'bar/baz', 'baz/baz' ]);
    }

    testGetShouldReturnAllTheHeaderValues() {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');

        expect(h.get('content-type')).to.be.eq('foo/bar');
    }
}
