import { @dataProvider } from '@jymfony/decorators';
import { expect } from 'chai';

const BadResponsePropertyTree = Solido.Atlante.Requester.Response.BadResponsePropertyTree;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class BadResponsePropertyTreeTest extends TestCase {
    @dataProvider('provideParseCases')
    testParse(content) {
        const parsed = BadResponsePropertyTree.parse(content);
        expect(parsed).to.be.instanceOf(BadResponsePropertyTree);
        expect(parsed.getName()).to.be.equal('');
        expect(parsed.getErrors()).to.have.length(0);

        const children = parsed.getChildren();
        expect(children).to.have.length(2);
        for (const child of children) {
            expect(child).to.be.instanceOf(BadResponsePropertyTree);
        }

        expect(children[0].getName()).to.be.equal('foo');
        expect(children[0].getErrors()).to.be.deep.equal(['Required.']);
        expect(children[0].getChildren()).to.have.length(0);

        expect(children[1].getName()).to.be.equal('bar');
        expect(children[1].getErrors()).to.have.length(0);

        const subchildren = children[1].getChildren();
        expect(subchildren).to.have.length(1);
        for (const child of subchildren) {
            expect(child).to.be.instanceOf(BadResponsePropertyTree);
        }

        expect(subchildren[0].getName()).to.be.equal('baz');
        expect(subchildren[0].getErrors()).to.be.deep.equal(['Bazbar']);
        expect(subchildren[0].getChildren()).to.have.length(0);
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
        if (message !== null) {
            this.expectExceptionMessage(message);
        }

        BadResponsePropertyTree.parse(content);
    }

    * provideBadCases() {
        yield [ 'foobar', InvalidArgumentException, 'Unexpected response type, object or array expected, string given' ];
        yield [ { name: 'foobar' }, InvalidArgumentException, 'Unable to parse missing `errors` property' ];
        yield [ { errors: ['foobar'] }, InvalidArgumentException, 'Missing `name` property' ];
        yield [ { name: ['foo'], errors: ['foobar'] }, InvalidArgumentException, 'Invalid `name` property type, expected string, object given' ];
        yield [ { errors: 'foo', name: 'foobar' }, InvalidArgumentException, 'Invalid `errors` property type, expected array, string given' ];
        yield [ { name: 'foobar', errors: [], children: 'foobar' }, InvalidArgumentException, 'Invalid `children` property type, expected array, string given' ];
        yield [ { name: 'foobar', errors: [], children: ['foobar'] }, InvalidArgumentException, 'Unexpected response type, object or array expected, string given' ];
    }
}
