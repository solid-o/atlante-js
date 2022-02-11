/**
 * @final
 */
export default class BadResponsePropertyTree {
    private name: string;
    private errors: string[] = [];
    private children: BadResponsePropertyTree[] = [];

    static parse(content: Record<string, any> | string): BadResponsePropertyTree {
        const obj = new BadResponsePropertyTree();

        if (isString(content)) {
            throw new globalThis.InvalidArgumentException('Unexpected response type, object or array expected, string given');
        }

        const errors = content.errors ?? null;
        if (null === errors) {
            throw new globalThis.InvalidArgumentException('Unable to parse missing `errors` property');
        }

        if (! Array.isArray(errors)) {
            throw new globalThis.InvalidArgumentException(`Invalid \`errors\` property type, expected array, ${typeof errors} given`);
        }

        obj.errors = errors;

        const name = content.name ?? null;
        if (null === name) {
            throw new globalThis.InvalidArgumentException('Missing `name` property');
        }

        if (! isString(name)) {
            throw new globalThis.InvalidArgumentException(`Invalid \`name\` property type, expected string, ${typeof name} given`);
        }

        obj.name = name;

        const children = content.children ?? [];
        if (! Array.isArray(children)) {
            throw new globalThis.InvalidArgumentException(`Invalid \`children\` property type, expected array, ${typeof children} given`);
        }

        obj.children = children.map(BadResponsePropertyTree.parse);

        return obj;
    }

    getName(): string {
        return this.name;
    }

    getErrors(): string[] {
        return this.errors;
    }

    getChildren(): BadResponsePropertyTree[] {
        return this.children;
    }

    /**
     * @internal Use static `parse` method instead
     */
    private constructor() {
    }
}
