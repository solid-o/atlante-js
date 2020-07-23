declare class ArrayUtils {
    /**
     * Recursively converts all the keys to camel case.
     */
    static toCamelCaseKeys<T = any>(input: T[]): T[];
    static toCamelCaseKeys<T = any>(input: { [key: string]: T }): { [key: string]: T };

    /**
     * Recursively converts all the keys to snake case.
     */
    static toSnakeCaseKeys<T = any>(input: T[]): T[];
    static toSnakeCaseKeys<T = any>(input: { [key: string]: T }): { [key: string]: T };

    /**
     * Sort an object by keys.
     */
    static ksort(input: { [key: string]: any }): { [key: string]: any };

    /**
     * Shuffle array elements
     */
    static shuffle(input: any[]): any[];

    /**
     * Computes the difference between two objects.
     */
    static computePatchObject(originalData: { [key: string]: any }, newData: { [key: string]: any }): { [key: string]: any };
}

export default ArrayUtils;
