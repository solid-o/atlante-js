const Headers = Solido.Atlante.Requester.Headers;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class HeadersTest extends TestCase {
    testSetShouldOverwriteExistingHeader() {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');
        h.set('Content-Type', 'bar/baz');

        __self.assertEquals('bar/baz', h.get('Content-Type'));
    }

    testAddShouldNotOverwriteExistingHeader() {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');
        h.add('Content-Type', 'bar/baz');

        __self.assertEquals([ 'foo/bar', 'bar/baz' ], h.get('Content-Type'));
    }

    testHeaderNamesShouldBeNormalized() {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');
        h.add('CONTENT-TYPE', 'bar/baz');

        __self.assertTrue(h.has('CoNtEnT-TyPe'));
        __self.assertEquals([ 'foo/bar', 'bar/baz' ], h.get('content-type'));
    }

    testRemoveShouldUnsetAllTheHeadersWithTheGivenName() {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');
        h.add('Content-Type', 'bar/baz');

        h.remove('content-type');
        __self.assertFalse(h.has('content-type'));
    }

    testGetShouldReturnUndefinedIfHeaderIsNotPresent() {
        const h = new Headers();
        __self.assertUndefined(h.get('Content-Type'));
    }

    testGetShouldReturnTheHeaderValue() {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');
        h.add('Content-Type', 'bar/baz');
        h.add('Content-Type', 'baz/baz');

        __self.assertEquals([ 'foo/bar', 'bar/baz', 'baz/baz' ], h.get('content-type'));
    }

    testGetShouldReturnAllTheHeaderValues() {
        const h = new Headers();
        h.add('Content-Type', 'foo/bar');

        __self.assertEquals('foo/bar', h.get('content-type'));
    }
}
