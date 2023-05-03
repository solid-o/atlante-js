const BadResponsePropertyTree = Solido.Atlante.Requester.Response.BadResponsePropertyTree;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class BadResponsePropertyTreeTest extends TestCase {
    @dataProvider('provideParseCases')
    testParse(content) {
        const parsed = BadResponsePropertyTree.parse(content);
        __self.assertInstanceOf(BadResponsePropertyTree, parsed);
        __self.assertEquals('', parsed.getName());
        __self.assertCount(0, parsed.getErrors());

        const children = parsed.getChildren();
        __self.assertCount(2, children);
        for (const child of children) {
            __self.assertInstanceOf(BadResponsePropertyTree, child);
        }

        __self.assertEquals('foo', children[0].getName());
        __self.assertEquals([ 'Required.' ], children[0].getErrors());
        __self.assertCount(0, children[0].getChildren());

        __self.assertEquals('bar', children[1].getName());
        __self.assertCount(0, children[1].getErrors());

        const subchildren = children[1].getChildren();
        __self.assertCount(1, subchildren);
        for (const child of subchildren) {
            __self.assertInstanceOf(BadResponsePropertyTree, child);
        }

        __self.assertEquals('baz', subchildren[0].getName());
        __self.assertEquals([ 'Bazbar' ], subchildren[0].getErrors());
        __self.assertCount(0, subchildren[0].getChildren());
    }

    * provideParseCases() {
        yield [
            {
                name: '',
                errors: [],
                children: [
                    {
                        name: 'foo',
                        errors: [ 'Required.' ],
                    },
                    {
                        name: 'bar',
                        errors: [],
                        children: [
                            {
                                name: 'baz',
                                errors: [ 'Bazbar' ],
                            },
                        ],
                    },
                ],
            },
        ];
    }

    @dataProvider('provideBadCases')
    testBadCases(content, exceptionClass, message = null) {
        this.expectException(exceptionClass);
        if (null !== message) {
            this.expectExceptionMessage(message);
        }

        BadResponsePropertyTree.parse(content);
    }

    * provideBadCases() {
        yield [ 'foobar', InvalidArgumentException, 'Unexpected response type, object or array expected, string given' ];
        yield [ { name: 'foobar' }, InvalidArgumentException, 'Unable to parse missing `errors` property' ];
        yield [ { errors: [ 'foobar' ] }, InvalidArgumentException, 'Missing `name` property' ];
        yield [ { name: [ 'foo' ], errors: [ 'foobar' ] }, InvalidArgumentException, 'Invalid `name` property type, expected string, object given' ];
        yield [ { errors: 'foo', name: 'foobar' }, InvalidArgumentException, 'Invalid `errors` property type, expected array, string given' ];
        yield [ { name: 'foobar', errors: [], children: 'foobar' }, InvalidArgumentException, 'Invalid `children` property type, expected array, string given' ];
        yield [ { name: 'foobar', errors: [], children: [ 'foobar' ] }, InvalidArgumentException, 'Unexpected response type, object or array expected, string given' ];
    }
}
