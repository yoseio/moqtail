import type { Subscribe } from "../temp";
export declare class Subscriber {
    private communicator;
    private supportedVersions;
    private selectedVersion;
    private subscription;
    private videoWaitingForKeyFrame;
    private audioWaitingForKeyFrame;
    private canvasElement;
    private videoCtx;
    private audioCtx;
    constructor(props: SubscriberInitProps);
    setup(): void;
    subscribe(props: Subscribe, trackType: 'video' | 'audio'): void;
    setCanvasElement(canvasElement: HTMLCanvasElement): void;
    setAudioContext(audioCtx: AudioContext): void;
    private getSubscriptionByTrackAlias;
    private generateReadableStreamFromBuffer;
    private audioDataToAudioBuffer;
    private playDecodedAudio;
    communicatorMessageHandler(message: MessageEvent): void;
    decoderMessageHandler(message: MessageEvent): void;
}
