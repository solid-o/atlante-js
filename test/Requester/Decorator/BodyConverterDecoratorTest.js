import { createRequest } from '../../../lib/Requester/Request';

const BodyConverterDecorator = Solido.Atlante.Requester.Decorator.BodyConverterDecorator;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class BodyConverterDecoratorTest extends TestCase {
    testNewInstanceIsReturned() {
        const decorator = new BodyConverterDecorator();
        const request = createRequest('GET', '/foo', null, 'foo');
        const decorated = decorator.decorate(request);

        __self.assertEquals(request, decorated);
        __self.assertFalse(request === decorated);
    }

    @dataProvider('provideDecorateCases')
    testDecorateBody(given, expected) {
        const decorator = new BodyConverterDecorator();
        const request = createRequest('GET', '/example.com', null, given);
        const decorated = decorator.decorate(request);

        const body = decorated.body;
        __self.assertEquals(expected, isFunction(body) ? body() : body);
    }

    * provideDecorateCases() {
        yield [ 'foobar', 'foobar' ];

        const a = { foo: 'bar', bar: ['foo', 'foobar'], fuz: true };
        yield [ a, JSON.stringify(a) ];
        yield [ new Date('2020-11-18T19:38:16.430Z'), '"2020-11-18T19:38:16.430Z"' ];
        yield [ () => 'foobar', '"foobar"' ];

        yield [
            function * () {
                yield 'foo';
                yield 'bar';
            },
            '["foo","bar"]',
        ];

        yield [ null, null ];
    }

    testDeferredCallable() {
        const decorator = new BodyConverterDecorator();
        decorator.decorate(createRequest('GET', '/example.com', null, () => {
            throw new RuntimeException('This exception should not be triggered');
        }));
    }

    @dataProvider('provideContents')
    testContentType(givenHeaders, expectedHeaders, expectedContent) {
        const decorator = new BodyConverterDecorator();
        const request = createRequest('GET', '/example.com', givenHeaders, { foo: 'bar', bar: ['bar', 'bar'] });
        const decorated = decorator.decorate(request);

        const body = decorated.body;
        __self.assertEquals(expectedContent, isFunction(body) ? body() : body);
    }

    * provideContents() {
        yield [ {'content-type': 'application/json'}, {'content-type': 'application/json'}, '{"foo":"bar","bar":["bar","bar"]}' ];
        yield [ null, {'content-type': 'application/json'}, '{"foo":"bar","bar":["bar","bar"]}' ];
        yield [ null, {'content-type': 'application/merge-patch+json'}, '{"foo":"bar","bar":["bar","bar"]}' ];
        yield [ {'x-foo': 'bar'}, {'content-type': 'application/json', 'x-foo': 'bar'}, '{"foo":"bar","bar":["bar","bar"]}' ];
        yield [ {'content-type': 'application/x-www-form-urlencoded'}, {'content-type': 'application/x-www-form-urlencoded'}, 'foo=bar&bar%5B0%5D=bar&bar%5B1%5D=bar' ];
        yield [ {'content-type': 'application/merge-patch+x-www-form-urlencoded'}, {'content-type': 'application/merge-patch+x-www-form-urlencoded'}, 'foo=bar&bar%5B0%5D=bar&bar%5B1%5D=bar' ];
    }

    testUnexpectedContentType() {
        const decorator = new BodyConverterDecorator();
        const request = createRequest('GET', '/example.com', {'content-type': 'multipart/form-data'}, { foo: 'bar' });
        const decorated = decorator.decorate(request);

        this.expectException(UnexpectedValueException);
        this.expectExceptionMessage('Unable to convert Request content body: expected "application/json", "application/x-www-form-urlencoded", "application/merge-patch+json" or "application/merge-patch+x-www-form-urlencoded" `content-type` header, "multipart/form-data" given');

        const body = decorated.body;
        if (! isFunction(body)) {
            return;
        }

        body();
    }
}
