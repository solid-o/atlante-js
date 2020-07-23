export interface MarshallerInterface {
}

export class MarshallerInterface {
    /**
     * Serializes a value into a string.
     */
    // @ts-ignore
    marshall(value: any): string { }

    /**
     * Converts a serialized value into its original representation.
     */
    unmarshall(value: string): any { }
}

export default getInterface(MarshallerInterface);
