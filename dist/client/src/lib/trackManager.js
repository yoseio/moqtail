export class TrackManager {
    constructor() {
        this.tracks = [];
    }
    addTrack(track) {
        this.tracks.push(track);
    }
    addTracks(tracks) {
        this.tracks.push(...tracks);
    }
    getTrack({ name }) {
        return this.tracks.find(track => track.name === name);
    }
    getAllTracks() {
        return this.tracks;
    }
    addSubscriber({ name, subscribeId, trackAlias, filterType }) {
        const track = this.getTrack({ name });
        if (!track)
            throw new Error(`Track not found: ${name}`);
        track.subscribers.push({ subscribeId, trackAlias, filterType });
    }
}
