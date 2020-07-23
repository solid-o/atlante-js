import Marshaller, { MarshallerInterface } from './MarshallerInterface';

export default
class NullMarshaller extends implementationOf(Marshaller) implements MarshallerInterface {
    /**
     * @inheritdoc
     */
    marshall(value: any): string {
        return value.toString();
    }

    /**
     * @inheritdoc
     */
    unmarshall(value: string): any {
        return value;
    }
}
