import type { SUBSCRIBE_FILTER } from "../temp";

export class TrackManager {
  private tracks: Track[] = [];
  public addTrack(track: Track) {
    this.tracks.push(track);
  }
  public addTracks(tracks: Track[]) {
    this.tracks.push(...tracks);
  }
  public getTrack({ name }: { name: string }): Track | undefined {
    return this.tracks.find(track => track.name === name);
  }
  public getAllTracks() {
    return this.tracks;
  }
  public addSubscriber({ name, subscribeId, trackAlias, filterType }: { name: string, subscribeId: number, trackAlias: number, filterType: SUBSCRIBE_FILTER }) {
    const track = this.getTrack({ name });
    if (!track) throw new Error(`Track not found: ${name}`);
    track.subscribers.push({ subscribeId, trackAlias, filterType });
  }
  public removeSubscriber(subscribeId: number): Track[] {
    let emptyTracks: Track[] = [];
    this.tracks.forEach(track => {
      track.subscribers = track.subscribers.filter(subscriber => subscriber.subscribeId !== subscribeId);
      if (track.subscribers.length === 0) emptyTracks.push(track);
    });
    return emptyTracks;
  }
}
