import { createRequest } from '../../../lib/Requester/Request';

const TestCase = Jymfony.Component.Testing.Framework.TestCase;
const VersionSetterDecorator = Solido.Atlante.Requester.Decorator.VersionSetterDecorator;

export default class VersionSetterDecoratorTest extends TestCase
{
    testNewInstanceIsReturned() {
        const decorator = new VersionSetterDecorator('foo');
        const request = createRequest('GET', '/foo', null, 'foo');
        const decorated = decorator.decorate(request);

        __self.assertNotEquals(request, decorated);
    }

    @dataProvider('provideDecorateCases')
    testDecorate(version, expectedHeaders, givenHeaders) {
        const decorator = new VersionSetterDecorator(version);
        const decorated = decorator.decorate(createRequest('GET', '/example.com', givenHeaders));

        __self.assertEquals(expectedHeaders, decorated.headers.all);
    }

    * provideDecorateCases() {
        yield ['foo', { Accept: 'application/json; version=foo' }, {}];
        yield ['foo', { Accept: 'application/json; version=foo' }, null];
        yield ['bar', { Accept: 'foo/bar; version=bar' }, { Accept: 'foo/bar' }];
    }
}
