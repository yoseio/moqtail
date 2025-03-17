// main thread for publisher
// interaction with the component page: video/audio start, stop, pause, resume, 
import { CONTROL_MESSAGE, MOQT_DRAFT08_VERSION, MOQT_DRAFT09_VERSION, MOQT_DRAFT10_VERSION, PARAMETER, serializeAnnounce, serializeClientSetup, serializeSubgroupHeader, serializeSubscribeError, serializeSubscribeOk, serializeUnannounce, SUBSCRIBE_ERROR_REASON, SUBSCRIBE_FILTER, serializeSubgroupObject, serializeEncodedChunk, videoDecoderConfigToExtensionHeader, OBJECT_STATUS, serializeDatagram, audioDecoderConfigToExtensionHeader } from '../temp';
// @ts-ignore
import CommunicatorWorker from './threads/communicator.worker?worker';
// @ts-ignore
import VideoEncoderWorker from './threads/video/encoder.worker?worker';
// @ts-ignore
import AudioEncoderWorker from './threads/audio/encoder.worker?worker';
import { TrackManager } from './trackManager';
import { Mogger } from './utils/mogger';
export class Publisher {
    constructor(props) {
        this.videoEncoders = {};
        this.audioEncoder = {};
        this.trackManager = new TrackManager();
        this.supportedVersions = [MOQT_DRAFT08_VERSION, MOQT_DRAFT09_VERSION, MOQT_DRAFT10_VERSION];
        this.selectedVersion = 0;
        this.maxSubscribeId = 1000;
        this.communicator = new CommunicatorWorker();
        this.communicator.onmessage = this.communicatorMessageHandler.bind(this);
        this.communicator.postMessage({ type: 'startConnection', data: props.serverUrl });
    }
    registerTrack(track) {
        this.trackManager.addTrack(track);
        if (track.type === 'video') {
            this.videoEncoders[track.name] = new VideoEncoderWorker();
            this.videoEncoders[track.name].onmessage = this.videoEncoderMessageHandler.bind(this);
            this.videoEncoders[track.name].postMessage({ type: 'init', data: track });
        }
        else if (track.type === 'audio') {
            this.audioEncoder[track.name] = new AudioEncoderWorker();
            this.audioEncoder[track.name].onmessage = this.audioEncoderMessageHandler.bind(this);
            this.audioEncoder[track.name].postMessage({ type: 'init', data: track });
        }
    }
    startStream({ track, mediaTrack }) {
        if (!this.trackManager.getTrack({ name: track.name })) {
            this.registerTrack(track);
        }
        if (track.type === 'video') {
            const processor = new MediaStreamTrackProcessor({ track: mediaTrack });
            if (!this.videoEncoders[track.name]) {
                Mogger.error(`Video encoder for track ${track.name} not found`);
                return;
            }
            this.videoEncoders[track.name].postMessage({ type: 'capture', data: processor.readable }, [processor.readable]);
        }
        else if (track.type === 'audio') {
            const processor = new MediaStreamTrackProcessor({ track: mediaTrack });
            if (!this.audioEncoder[track.name]) {
                Mogger.error(`Audio encoder for track ${track.name} not found`);
                return;
            }
            this.audioEncoder[track.name].postMessage({ type: 'capture', data: processor.readable }, [processor.readable]);
        }
    }
    setup() {
        this.communicator.postMessage({ type: 'startReadLoop', data: null });
        const msg = serializeClientSetup({
            supportedVersions: this.supportedVersions,
            params: [
                { type: PARAMETER.SETUP.MAX_SUBSCRIBE_ID.KEY, value: this.maxSubscribeId }
            ]
        });
        this.communicator.postMessage({ type: 'sendControlMessage', data: msg });
    }
    announce(namespace) {
        const msg = serializeAnnounce({ trackNamespace: namespace });
        this.communicator.postMessage({ type: 'sendControlMessage', data: msg });
    }
    unannounce(namespace) {
        const msg = serializeUnannounce({ trackNamespace: namespace });
        this.communicator.postMessage({ type: 'sendControlMessage', data: msg });
    }
    getPublisherPriority(trackType, subgroupId = 128) {
        if (trackType === 'audio') {
            return 0;
        }
        else {
            // video is less prioritized than audio (10 is just random)
            // publisher priority must be between 0-255
            return (subgroupId + 10 % 256);
        }
    }
    closeStreamsGracefully(subgroupIds, lastSubgroupId, lastObjectId) {
        const obj = serializeSubgroupObject({
            objectId: lastObjectId,
            extensionHeaders: [],
            objectStatus: OBJECT_STATUS.END_OF_GROUP,
            payload: new Uint8Array(0)
        });
        this.communicator.postMessage({ type: 'sendSubgroupObject', data: { lastSubgroupId, obj } });
        // instead of closing from the publisher, the subscriber close the stream after receicing last object
        // that way, 'short buffer' error in the subscriber can be avoided
        // this.communicator.postMessage({ type: 'closeSubgroupStreams', data: subgroupIds });
    }
    // find all track aliases of subscribers that are interested in the latest object
    getAliasOfSubscribersWithLatestObjectFilter(track) {
        return track.subscribers.filter(sub => sub.filterType === SUBSCRIBE_FILTER.LATEST_OBJECT).map(sub => sub.trackAlias);
    }
    createSubgroupStream(subgroupId, targetTrack) {
        const aliases = this.getAliasOfSubscribersWithLatestObjectFilter(targetTrack);
        Mogger.debug(`Creating subgroup stream for subgroupId ${subgroupId} with aliases ${aliases}`);
        for (const alias of aliases) {
            const subgroupHeader = serializeSubgroupHeader({
                trackAlias: alias,
                subgroupId,
                groupId: targetTrack.largestGroupId,
                publisherPriority: this.getPublisherPriority(targetTrack.type, subgroupId),
            });
            this.communicator.postMessage({ type: 'createSubgroupStream', data: { subgroupId, subgroupHeader } });
        }
    }
    communicatorMessageHandler(message) {
        let msg;
        switch (message.data.type) {
            case `ctrl-${CONTROL_MESSAGE.SERVER_SETUP}`:
                msg = message.data.data;
                if (!this.supportedVersions.includes(msg.selectedVersion)) {
                    Mogger.error('Server does not support any of the versions we support');
                    this.communicator.postMessage({ type: 'closeSession', data: null });
                    break;
                }
                Mogger.info(`Setup successful with version ${msg.selectedVersion}`);
                this.selectedVersion = msg.selectedVersion;
                break;
            case `ctrl-${CONTROL_MESSAGE.ANNOUNCE_OK}`:
                msg = message.data.data;
                Mogger.info(`Announce with namespace ${message.data.data.trackNamespace} successful`);
                break;
            case `ctrl-${CONTROL_MESSAGE.ANNOUNCE_ERROR}`:
                Mogger.error(`Announce error for namespace ${message.data.data.trackNamespace}. reason: ${message.data.data.reasonPhrase}`);
                break;
            case `ctrl-${CONTROL_MESSAGE.SUBSCRIBE}`:
                msg = message.data.data;
                const targetTrack = this.trackManager.getTrack({ name: msg.trackName });
                if (!targetTrack) {
                    const sub_err = serializeSubscribeError({
                        subscribeId: msg.subscribeId,
                        errorCode: SUBSCRIBE_ERROR_REASON.TRACK_DOES_NOT_EXIST,
                        reasonPhrase: '',
                        trackAlias: msg.trackAlias
                    });
                    this.communicator.postMessage({ type: 'sendControlMessage', data: sub_err });
                    break;
                }
                if (targetTrack.subscribers.length == 0) {
                    const targetEncoder = targetTrack.type === 'video' ? this.videoEncoders[targetTrack.name] : this.audioEncoder[targetTrack.name];
                    targetEncoder.postMessage({ type: 'encode', data: null });
                }
                this.trackManager.addSubscriber({
                    name: msg.trackName,
                    subscribeId: msg.subscribeId,
                    trackAlias: msg.trackAlias,
                    filterType: msg.filterType
                });
                const sub_ok = serializeSubscribeOk({ subscribeId: msg.subscribeId, expires: 0, groupOrder: msg.groupOrder || targetTrack.groupOrderPublisherPreference, contentExists: 0 });
                this.communicator.postMessage({ type: 'sendControlMessage', data: sub_ok });
                Mogger.info(`Subscribe with namespace ${msg.trackName} successful`);
                break;
            case 'error':
                Mogger.error(`Publisher communicator: ${message.data.data}`);
                break;
            default:
                Mogger.error(`Unexpected message type from communicator ${message.data.type}`);
                break;
        }
    }
    videoEncoderMessageHandler(message) {
        const data = message.data;
        switch (data.type) {
            // handling the latest encoded video chunk
            case 'videoChunk':
                const videoChunkMsg = data.data;
                const targetTrack = this.trackManager.getTrack({ name: videoChunkMsg.trackName });
                if (!targetTrack) {
                    Mogger.error(`Track ${videoChunkMsg.trackName} not found`);
                    return;
                }
                const group = targetTrack.groups.find(g => g.groupId === targetTrack.largestGroupId);
                let subgroupId = (videoChunkMsg.metadata.temporalLayerId ?? 0) + (targetTrack.largestGroupId !== undefined ? targetTrack.largestGroupId : 0);
                if (videoChunkMsg.metadata.frameType === 'key') {
                    // if key frame, create a new group and subgroup
                    targetTrack.largestGroupId !== undefined ? targetTrack.largestGroupId++ : targetTrack.largestGroupId = 0;
                    targetTrack.largestObjectId = undefined;
                    subgroupId = (videoChunkMsg.metadata.temporalLayerId ?? 0) + (targetTrack.largestGroupId !== undefined ? targetTrack.largestGroupId : 0);
                    targetTrack.groups.push({ groupId: targetTrack.largestGroupId, publishedSubgroupIds: [subgroupId] });
                    this.createSubgroupStream(subgroupId, targetTrack);
                }
                else {
                    // if not a key frame, find the largest group
                    if (!group) {
                        Mogger.error(`groupId ${targetTrack.largestGroupId} not found`);
                        return;
                    }
                    // if this frame is the first object of the subgroup, create a unidirectional stream with SUBGROUP_HEADER
                    if (!group.publishedSubgroupIds.includes(subgroupId)) {
                        this.createSubgroupStream(subgroupId, targetTrack);
                        group.publishedSubgroupIds.push(subgroupId);
                    }
                }
                const videoChunkBytes = serializeEncodedChunk(videoChunkMsg.chunk);
                // finally send object
                targetTrack.largestObjectId !== undefined ? targetTrack.largestObjectId++ : targetTrack.largestObjectId = 0;
                const subgroupObject = serializeSubgroupObject({
                    objectId: targetTrack.largestObjectId,
                    extensionHeaders: videoChunkMsg.metadata.decoderConfig ? [videoDecoderConfigToExtensionHeader(videoChunkMsg.metadata.decoderConfig)] : [],
                    payload: videoChunkBytes
                });
                Mogger.debug(`Sending object with objectId ${targetTrack.largestObjectId} and subgroupId ${subgroupId}. temporalLayerId: ${videoChunkMsg.metadata.temporalLayerId}`);
                this.communicator.postMessage({ type: 'sendSubgroupObject', data: { subgroupObject, subgroupId } });
                // if this is the last object in the group, close existing streams with final objects
                const isLast = targetTrack.largestObjectId + 1 === targetTrack.encoderConfig.keyFrameDuration;
                if (isLast)
                    Mogger.debug(`This is the last object in the group`);
                if (isLast)
                    this.closeStreamsGracefully(group.publishedSubgroupIds, subgroupId, targetTrack.largestObjectId + 1);
                break;
            case 'audioChunk':
                const audioChunkMsg = message.data.data;
                const audioTrack = this.trackManager.getTrack({ name: audioChunkMsg.trackName });
                if (!audioTrack) {
                    Mogger.error(`Track ${audioChunkMsg.trackName} not found`);
                    return;
                }
                if (audioChunkMsg.chunk.type === 'key') {
                    audioTrack.largestGroupId++;
                    audioTrack.largestObjectId = 0;
                }
                const audioChunkBytes = serializeEncodedChunk(audioChunkMsg.chunk);
                const interestedAliases = this.getAliasOfSubscribersWithLatestObjectFilter(audioTrack);
                Mogger.debug(`Sending audio chunk to aliases ${interestedAliases}`);
                for (const alias of interestedAliases) {
                    const datagramObject = serializeDatagram({
                        trackAlias: alias,
                        groupId: audioTrack.largestGroupId,
                        objectId: audioTrack.largestObjectId,
                        publisherPriority: this.getPublisherPriority(audioTrack.type),
                        payload: audioChunkBytes,
                        extensionHeaders: audioChunkMsg.metadata.decoderConfig ? [videoDecoderConfigToExtensionHeader(audioChunkMsg.metadata.decoderConfig)] : [],
                    });
                    this.communicator.postMessage({ type: 'sendDatagram', data: datagramObject });
                }
                audioTrack.largestObjectId++;
                break;
            case 'error':
                Mogger.error(`Error from video encoder: ${message.data.data}`);
                break;
        }
    }
    audioEncoderMessageHandler(message) {
        const data = message.data;
        switch (data.type) {
            // handling the latest encoded audio chunk
            case 'audioChunk':
                const audioChunkMsg = message.data.data;
                const audioTrack = this.trackManager.getTrack({ name: audioChunkMsg.trackName });
                if (!audioTrack) {
                    Mogger.error(`Track ${audioChunkMsg.trackName} not found`);
                    return;
                }
                if (audioChunkMsg.chunk.type === 'key') {
                    audioTrack.largestGroupId++;
                    audioTrack.largestObjectId = 0;
                }
                const audioChunkBytes = serializeEncodedChunk(audioChunkMsg.chunk);
                const interestedAliases = this.getAliasOfSubscribersWithLatestObjectFilter(audioTrack);
                Mogger.debug(`Sending audio chunk to aliases ${interestedAliases}`);
                for (const alias of interestedAliases) {
                    const datagramObject = serializeDatagram({
                        trackAlias: alias,
                        groupId: audioTrack.largestGroupId,
                        objectId: audioTrack.largestObjectId,
                        publisherPriority: this.getPublisherPriority(audioTrack.type),
                        extensionHeaders: audioChunkMsg.metadata.decoderConfig ? [audioDecoderConfigToExtensionHeader(audioChunkMsg.metadata.decoderConfig)] : [],
                        payload: audioChunkBytes,
                    });
                    this.communicator.postMessage({ type: 'sendDatagram', data: datagramObject });
                }
                audioTrack.largestObjectId++;
                break;
            case 'error':
                Mogger.error(`Error from video encoder: ${message.data.data}`);
                break;
        }
    }
}
