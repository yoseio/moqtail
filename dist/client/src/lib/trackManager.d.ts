import type { SUBSCRIBE_FILTER } from "../temp";
export declare class TrackManager {
    private tracks;
    addTrack(track: Track): void;
    addTracks(tracks: Track[]): void;
    getTrack({ name }: {
        name: string;
    }): Track | undefined;
    getAllTracks(): Track[];
    addSubscriber({ name, subscribeId, trackAlias, filterType }: {
        name: string;
        subscribeId: number;
        trackAlias: number;
        filterType: SUBSCRIBE_FILTER;
    }): void;
}
