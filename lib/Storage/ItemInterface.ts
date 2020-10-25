/**
 * ItemInterface defines an interface for interacting with objects inside a storage.
 *
 * Each Item object MUST be associated with a specific key, which can be set
 * according to the implementing system and is typically passed by the
 * ItemInterface object.
 *
 * The ItemInterface object encapsulates the storage and retrieval of
 * items. Each ItemInterface is generated by a StorageInterface object,
 * which is responsible for any required setup as well as associating the object
 * with a unique Key.
 * ItemInterface objects MUST be able to store and retrieve any type
 * of value defined in the Data section of the specification.
 *
 * Calling Libraries MUST NOT instantiate Item objects themselves. They may only
 * be requested from a Storage object via the getItem() method.  Calling Libraries
 * SHOULD NOT assume that an Item created by one Implementing Library is
 * compatible with a Pool from another Implementing Library.
 */
export class ItemInterface {
    // @ts-ignore
    /**
     * The key for the current item.
     *
     * The key is loaded by the Implementing Library, but should be available to
     * the higher level callers when needed.
     */
    // @ts-ignore
    get key(): string { }

    /**
     * Retrieves the value of the item from the cache associated with this object's key.
     *
     * The value returned must be identical to the value originally stored by set().
     *
     * If isHit is false, this method MUST return undefined. Note that undefined
     * is a legitimate cached value, so the isHit property SHOULD be used to
     * differentiate between "undefined value was found" and "no value was found."
     */
    get(): any { }

    /**
     * Confirms if the item lookup resulted in an hit.
     *
     * Note: This method MUST NOT have a race condition between checking isHit
     * and calling get().
     */
    // @ts-ignore
    get isHit(): boolean { }

    /**
     * Sets the value represented by this item.
     *
     * The value argument may be any item that can be serialized by JSON.stringify,
     * although the method of serialization is left up to the Implementing
     * Library.
     */
    // @ts-ignore
    set(value: any): this { }

    /**
     * Sets the expiration time for this item.
     */
    // @ts-ignore
    expiresAt(expiration: Date | undefined | null): this { }

    /**
     * Sets the expiration time for this item.
     */
    // @ts-ignore
    expiresAfter(time: number | undefined): this { }
}

export interface ItemInterface {
}

export default getInterface(ItemInterface);
