import { expect } from 'chai';

const BadResponse = Solido.Atlante.Requester.Response.BadResponse;
const BadResponsePropertyTree = Solido.Atlante.Requester.Response.BadResponsePropertyTree;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class BadResponseTest extends TestCase {
    testCanCreate() {
        const response = new BadResponse({ 'Content-Type': 'application/json' }, {
            name: 'foo',
            errors: [],
            children: [],
        });

        expect(response.getStatusCode()).to.be.equal(400);

        const errors = response.getErrors();
        expect(errors).to.be.instanceOf(BadResponsePropertyTree);
    }
}
