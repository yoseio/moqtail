import type { ExtensionHeader, OBJECT_STATUS } from 'moqtail';
import type { Track } from './lib/track';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }
  interface PublisherInitProps {
    serverUrl: string,
    tracks: Track[],
    authInfo: string
  };
  interface SubscriberInitProps {
    namespace: string[],
    videoTrackName: string,
    audioTrackName: string,
    authInfo: string,
    jitterBufferFrameSize?: number
  };
  interface MyEncoderConfig {
    encoderConfig: VideoEncoderConfig | AudioEncoderConfig,
    keyFrameDuration?: number,
  }
  interface Track {
    public namespace?: string[] = [];
    public name?: string = '';
    public groups?: Group[] = [];
    public objectForwardingPrefereces?: 'Subgroup' | 'Datagram';
    public largestGroupId?: number = 0;
    public largestObjectId?: number = 0;
    public isTrackEnded?: boolean = false;
    public encoderConfig?: MyEncoderConfig;
  }
  interface ThreadMessage {
    type: string,
    data: any,
  }
  interface Group {
    groupId: number,
    objects: Object[],
  }
  interface Object {
    objectId: number,
    groupId: number,
    publisherPriority: number,
    forwardingPreference: "Subgroup" | "Datagram",
    subgroupId?: number,
    obejctStatus?: OBJECT_STATUS,
    extensionHeaders?: ExtensionHeader[],
    payload?: Uint8Array,
  }
}

export {}
