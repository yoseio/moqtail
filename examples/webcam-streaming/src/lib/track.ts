export class TrackManager {
  private tracks: Track[] = [];
  public addTrack(track: Track) {
    this.tracks.push(track);
  }
  public addTracks(tracks: Track[]) {
    this.tracks.push(...tracks);
  }
  public getTrack({ namespace, name }: { namespace: string[], name: string }): Track | undefined {
    return this.tracks.find(track => track.name === name && track.namespace === namespace);
  }
  public getAllTracks() {
    return this.tracks;
  }
}
