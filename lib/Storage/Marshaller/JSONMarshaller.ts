import Marshaller, { MarshallerInterface } from './MarshallerInterface';

export default
class JSONMarshaller extends implementationOf(Marshaller) implements MarshallerInterface {
    /**
     * @inheritdoc
     */
    marshall(value: any): string {
        return JSON.stringify(value);
    }

    /**
     * @inheritdoc
     */
    unmarshall(value: string): unknown {
        return JSON.parse(value);
    }
}
