export declare class Publisher {
    private communicator;
    private videoEncoders;
    private audioEncoder;
    private trackManager;
    private supportedVersions;
    private selectedVersion;
    private maxSubscribeId;
    constructor(props: PublisherInitProps);
    registerTrack(track: Track): void;
    startStream({ track, mediaTrack }: {
        track: Track;
        mediaTrack: MediaStreamTrack;
    }): void;
    setup(): void;
    announce(namespace: string[]): void;
    unannounce(namespace: string[]): void;
    private getPublisherPriority;
    private closeStreamsGracefully;
    private getAliasOfSubscribersWithLatestObjectFilter;
    private createSubgroupStream;
    private communicatorMessageHandler;
    private videoEncoderMessageHandler;
    private audioEncoderMessageHandler;
}
