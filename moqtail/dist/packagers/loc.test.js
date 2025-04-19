import { concatBuffer, serializeQuicVarInt, stringToVarBytes } from '../utils/bytes';
import { deserializeVideoDecoderConfig, videoDecoderConfigToExtensionHeader, } from './loc'; // replace './paste' with your actual file path
describe('deserializeVideoDecoderConfig', () => {
    test('correctly deserializes VideoDecoderConfig from buffer', () => {
        const originalConfig = {
            codec: 'vp8',
            codedWidth: 640,
            codedHeight: 480,
            displayAspectWidth: 16,
            displayAspectHeight: 9,
            colorSpace: { primaries: 'bt709', transfer: 'bt709', matrix: 'bt470bg' },
            hardwareAcceleration: 'prefer-hardware',
            description: new Uint8Array([1, 2, 3, 4]).buffer
        };
        // Concatenate all serialized fields into one buffer
        const serializedBuffer = videoDecoderConfigToExtensionHeader(originalConfig).value;
        // Deserialize the buffer back into config object
        const deserializedConfig = deserializeVideoDecoderConfig(serializedBuffer);
        // Verify the deserialized config matches the original
        expect(deserializedConfig.codec).toBe(originalConfig.codec);
        expect(deserializedConfig.codedWidth).toBe(originalConfig.codedWidth);
        expect(deserializedConfig.codedHeight).toBe(originalConfig.codedHeight);
        expect(deserializedConfig.displayAspectWidth).toBe(originalConfig.displayAspectWidth);
        expect(deserializedConfig.displayAspectHeight).toBe(originalConfig.displayAspectHeight);
        expect(deserializedConfig.colorSpace).toEqual(originalConfig.colorSpace);
        expect(deserializedConfig.hardwareAcceleration).toBe(originalConfig.hardwareAcceleration);
        expect(deserializedConfig.description).toEqual(originalConfig.description);
    });
    test('handles missing optional fields gracefully', () => {
        const minimalConfig = {
            codec: 'vp9'
            // other fields intentionally omitted
        };
        // Serialize minimal config (only codec provided)
        const codecBytes = stringToVarBytes(minimalConfig.codec);
        const serializedBuffer = concatBuffer([
            codecBytes,
            serializeQuicVarInt(0),
            serializeQuicVarInt(0),
            serializeQuicVarInt(0),
            serializeQuicVarInt(0),
            stringToVarBytes(''),
            stringToVarBytes(''),
            serializeQuicVarInt(0) // empty description
        ]);
        const deserializedMinimal = deserializeVideoDecoderConfig(serializedBuffer);
        expect(deserializedMinimal.codec).toBe(minimalConfig.codec);
        expect(deserializedMinimal.codedWidth).toBeUndefined();
        expect(deserializedMinimal.codedHeight).toBeUndefined();
        expect(deserializedMinimal.displayAspectWidth).toBeUndefined();
        expect(deserializedMinimal.displayAspectHeight).toBeUndefined();
        expect(deserializedMinimal.colorSpace).toBeUndefined();
        expect(deserializedMinimal.hardwareAcceleration).toBeUndefined();
        expect(deserializedMinimal.description).toBeUndefined();
    });
});
