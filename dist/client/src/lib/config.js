export const VIDEO_ENCODER_CONFIGS = {
    'high': {
        codec: 'hvc1.1.6.L120.00',
        width: 3840,
        height: 2160,
        framerate: 30,
        latencyMode: 'realtime',
        hardwareAcceleration: 'no-preference'
    },
    'medium': {
        codec: 'avc1.64002A',
        width: 1920,
        height: 1080,
        bitrate: 2000000,
        framerate: 60,
        latencyMode: 'realtime',
        hardwareAcceleration: 'no-preference'
    },
    'low': {
        codec: 'avc1.64002A',
        width: 720,
        height: 404,
        bitrate: 500000,
        framerate: 30,
        latencyMode: 'realtime',
        hardwareAcceleration: 'no-preference'
    },
};
export const VIDEO_ENCODER_DEFAULT_CONFIG = {
    codec: 'vp8',
    width: 480,
    height: 360,
    framerate: 30,
    scalabilityMode: 'L1T2',
    latencyMode: 'realtime'
};
export const AUDIO_ENCODER_DEFAULT_CONFIG = {
    codec: 'opus', // AAC NOT implemented YET (it is in their roadmap)
    sampleRate: 48000,
    numberOfChannels: 1,
    bitrate: 32000,
};
export const VIDEO_DECODER_DEFAULT_CONFIG = {
    codec: "vp8",
    codedHeight: 360,
    codedWidth: 480,
    colorSpace: { "fullRange": false, "matrix": "smpte170m", "primaries": "bt709", "transfer": "bt709" },
    hardwareAcceleration: "no-preference"
};
export const AUDIO_DECODER_DEFAULT_CONFIG = {
    codec: 'opus', // AAC NOT implemented YET (it is in their roadmap)
    sampleRate: 48000, // To fill later
    numberOfChannels: 1, // To fill later
};
