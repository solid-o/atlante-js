import { @dataProvider } from '@jymfony/decorators';
import { createRequest } from '../../../lib/Requester/Request';
import { expect } from 'chai';

const TestCase = Jymfony.Component.Testing.Framework.TestCase;
const VersionSetterDecorator = Solido.Atlante.Requester.Decorator.VersionSetterDecorator;

export default class VersionSetterDecoratorTest extends TestCase
{
    testNewInstanceIsReturned() {
        const decorator = new VersionSetterDecorator('foo');
        const request = createRequest('GET', '/foo', null, 'foo');
        const decorated = decorator.decorate(request);

        expect(decorated).to.be.not.equal(request);
    }

    @dataProvider('provideDecorateCases')
    testDecorate(version, expectedHeaders, givenHeaders) {
        const decorator = new VersionSetterDecorator(version);
        const decorated = decorator.decorate(createRequest('GET', '/example.com', givenHeaders));

        expect(decorated.headers.all).to.be.deep.equal(expectedHeaders);
    }

    * provideDecorateCases() {
        yield ['foo', { Accept: 'application/json; version=foo' }, {}];
        yield ['foo', { Accept: 'application/json; version=foo' }, null];
        yield ['bar', { Accept: 'foo/bar; version=bar' }, { Accept: 'foo/bar' }];
    }
}
