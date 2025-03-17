import type { GROUP_ORDER, SUBSCRIBE_FILTER, ExtensionHeader, OBJECT_STATUS } from './temp';
import type { Track } from './lib/trackManager';

declare global {
  type ObjectValueList<T extends Record<any, any>> = T[keyof T];
  type PublisherInitProps = {
    serverUrl: string,
  };
  type SubscriberInitProps = {
    serverUrl: string,
    jitterBufferFrameSize?: number,
  };
  type MyEncoderConfig = {
    encoderConfig: VideoEncoderConfig | AudioEncoderConfig,
    keyFrameDuration?: number,
  }
  type Track = {
    namespace: string[];
    name: string;
    groups: Group[];
    groupOrderPublisherPreference: number = GROUP_ORDER.ASCENDING;
    objectForwardingPrefereces: 'Subgroup' | 'Datagram';
    largestGroupId?: number;
    largestObjectId?: number;
    isTrackEnded?: boolean;
    encoderConfig?: MyEncoderConfig;
    type: 'video' | 'audio';
    subscribers: { subscribeId: number, trackAlias: number, filterType: SUBSCRIBE_FILTER }[];
  }
  type ThreadMessage = {
    type: string,
    data: any,
  }
}

export {}
