export const VIDEO_ENCODER_MOQMI_CONFIG: VideoEncoderConfig = {
  codec: 'avc1.42001e',
  width: 1280,
  height: 720,
  framerate: 30,
  latencyMode: 'realtime',
};
export const VIDEO_ENCODER_DEFAULT_CONFIG: VideoEncoderConfig = {
  codec: 'vp8',
  width: 1280,
  height: 720,
  framerate: 30,
  latencyMode: 'realtime'
};

export const VIDEO_RESOLUTION_OPTIONS = {
  SD: { width: 853, height: 480 },
  HD: { width: 1280, height: 720 },
  FullHD: { width: 1920, height: 1080 },
  '4K': { width: 3840, height: 2160 },
} as const;
export const AUDIO_ENCODER_DEFAULT_CONFIG: AudioEncoderConfig = {
  codec: 'opus',
  sampleRate: 48000,
  numberOfChannels: 1,
  bitrate: 32000,
};

export const VIDEO_DECODER_DEFAULT_CONFIG: VideoDecoderConfig = {
  codec: 'vp8',
  codedWidth: 1280,
  codedHeight: 720,
  colorSpace: { 'fullRange': false, 'matrix': 'smpte170m', 'primaries': 'bt709', 'transfer': 'bt709' },
  hardwareAcceleration: 'no-preference'
};
export const AUDIO_DECODER_DEFAULT_CONFIG: AudioDecoderConfig = {
  codec: 'opus',
  sampleRate: 48000,
  numberOfChannels: 1,
};
