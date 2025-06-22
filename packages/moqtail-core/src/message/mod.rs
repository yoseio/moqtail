pub mod announce;
pub mod announce_cancel;
pub mod announce_error;
pub mod announce_ok;
pub mod client_setup;
pub mod fetch;
pub mod fetch_cancel;
pub mod fetch_error;
pub mod fetch_ok;
pub mod goaway;
pub mod max_subscribe_id;
pub mod server_setup;
pub mod subscribe;
pub mod subscribe_announces;
pub mod subscribe_announces_error;
pub mod subscribe_announces_ok;
pub mod subscribe_done;
pub mod subscribe_error;
pub mod subscribe_ok;
pub mod subscribe_update;
pub mod subscribes_blocked;
pub mod track_status;
pub mod track_status_request;
pub mod unannounce;
pub mod unsubscribe;
pub mod unsubscribe_announces;

pub use announce::*;
pub use announce_cancel::*;
pub use announce_error::*;
pub use announce_ok::*;
pub use client_setup::*;
pub use fetch::*;
pub use fetch_cancel::*;
pub use fetch_error::*;
pub use fetch_ok::*;
pub use goaway::*;
pub use max_subscribe_id::*;
pub use server_setup::*;
pub use subscribe::*;
pub use subscribe_announces::*;
pub use subscribe_announces_error::*;
pub use subscribe_announces_ok::*;
pub use subscribe_done::*;
pub use subscribe_error::*;
pub use subscribe_ok::*;
pub use subscribe_update::*;
pub use subscribes_blocked::*;
pub use track_status::*;
pub use track_status_request::*;
pub use unannounce::*;
pub use unsubscribe::*;
pub use unsubscribe_announces::*;

use crate::coding::{Decode, Encode, VarInt};

/// [Control Messages](https://datatracker.ietf.org/doc/html/draft-ietf-moq-transport-10#section-8)
pub enum ControlMessage {
    ClientSetup(ClientSetup),
    ServerSetup(ServerSetup),
    GoAway(GoAway),
    MaxSubscribeId(MaxSubscribeId),
    SubscribesBlocked(SubscribesBlocked),
    Subscribe(Subscribe),
    SubscribeOk(SubscribeOk),
    SubscribeError(SubscribeError),
    Unsubscribe(Unsubscribe),
    SubscribeUpdate(SubscribeUpdate),
    SubscribeDone(SubscribeDone),
    Fetch(Fetch),
    FetchOk(FetchOk),
    FetchError(FetchError),
    FetchCancel(FetchCancel),
    TrackStatusRequest(TrackStatusRequest),
    TrackStatus(TrackStatus),
    Announce(Announce),
    AnnounceOk(AnnounceOk),
    AnnounceError(AnnounceError),
    Unannounce(Unannounce),
    AnnounceCancel(AnnounceCancel),
    SubscribeAnnounces(SubscribeAnnounces),
    SubscribeAnnouncesOk(SubscribeAnnouncesOk),
    SubscribeAnnouncesError(SubscribeAnnouncesError),
    UnsubscribeAnnounces(UnsubscribeAnnounces),
}

pub enum ControlMessageType {
    ClientSetup = 0x40,
    ServerSetup = 0x41,
    GoAway = 0x10,
    MaxSubscribeId = 0x15,
    SubscribesBlocked = 0x1A,
    Subscribe = 0x03,
    SubscribeOk = 0x04,
    SubscribeError = 0x05,
    Unsubscribe = 0x0A,
    SubscribeUpdate = 0x02,
    SubscribeDone = 0x0B,
    Fetch = 0x16,
    FetchOk = 0x18,
    FetchError = 0x19,
    FetchCancel = 0x17,
    TrackStatusRequest = 0x0D,
    TrackStatus = 0x0E,
    Announce = 0x06,
    AnnounceOk = 0x07,
    AnnounceError = 0x08,
    Unannounce = 0x09,
    AnnounceCancel = 0x0C,
    SubscribeAnnounces = 0x11,
    SubscribeAnnouncesOk = 0x12,
    SubscribeAnnouncesError = 0x13,
    UnsubscribeAnnounces = 0x14,
}

impl Encode for ControlMessage {
    fn encode<B: bytes::BufMut>(&self, buf: &mut B) {
        match self {
            ControlMessage::ClientSetup(msg) => {
                VarInt(ControlMessageType::ClientSetup as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::ServerSetup(msg) => {
                VarInt(ControlMessageType::ServerSetup as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::GoAway(msg) => {
                VarInt(ControlMessageType::GoAway as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::MaxSubscribeId(msg) => {
                VarInt(ControlMessageType::MaxSubscribeId as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::SubscribesBlocked(msg) => {
                VarInt(ControlMessageType::SubscribesBlocked as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::Subscribe(msg) => {
                VarInt(ControlMessageType::Subscribe as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::SubscribeOk(msg) => {
                VarInt(ControlMessageType::SubscribeOk as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::SubscribeError(msg) => {
                VarInt(ControlMessageType::SubscribeError as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::Unsubscribe(msg) => {
                VarInt(ControlMessageType::Unsubscribe as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::SubscribeUpdate(msg) => {
                VarInt(ControlMessageType::SubscribeUpdate as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::SubscribeDone(msg) => {
                VarInt(ControlMessageType::SubscribeDone as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::Fetch(msg) => {
                VarInt(ControlMessageType::Fetch as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::FetchOk(msg) => {
                VarInt(ControlMessageType::FetchOk as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::FetchError(msg) => {
                VarInt(ControlMessageType::FetchError as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::FetchCancel(msg) => {
                VarInt(ControlMessageType::FetchCancel as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::TrackStatusRequest(msg) => {
                VarInt(ControlMessageType::TrackStatusRequest as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::TrackStatus(msg) => {
                VarInt(ControlMessageType::TrackStatus as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::Announce(msg) => {
                VarInt(ControlMessageType::Announce as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::AnnounceOk(msg) => {
                VarInt(ControlMessageType::AnnounceOk as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::AnnounceError(msg) => {
                VarInt(ControlMessageType::AnnounceError as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::Unannounce(msg) => {
                VarInt(ControlMessageType::Unannounce as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::AnnounceCancel(msg) => {
                VarInt(ControlMessageType::AnnounceCancel as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::SubscribeAnnounces(msg) => {
                VarInt(ControlMessageType::SubscribeAnnounces as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::SubscribeAnnouncesOk(msg) => {
                VarInt(ControlMessageType::SubscribeAnnouncesOk as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::SubscribeAnnouncesError(msg) => {
                VarInt(ControlMessageType::SubscribeAnnouncesError as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::UnsubscribeAnnounces(msg) => {
                VarInt(ControlMessageType::UnsubscribeAnnounces as u64).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
        }
    }
}

impl<'a> Decode<'a> for ControlMessage {
    fn decode<B: bytes::Buf>(buf: &mut B) -> Result<Self, crate::coding::Error> {
        let msg_type = VarInt::decode(buf)?;
        let _len = VarInt::decode(buf)?.into_inner() as usize;

        match msg_type.into_inner() {
            val if val == ControlMessageType::ClientSetup as u64 => {
                Ok(ControlMessage::ClientSetup(ClientSetup::decode(buf)?))
            }
            val if val == ControlMessageType::ServerSetup as u64 => {
                Ok(ControlMessage::ServerSetup(ServerSetup::decode(buf)?))
            }
            val if val == ControlMessageType::GoAway as u64 => {
                Ok(ControlMessage::GoAway(GoAway::decode(buf)?))
            }
            val if val == ControlMessageType::MaxSubscribeId as u64 => {
                Ok(ControlMessage::MaxSubscribeId(MaxSubscribeId::decode(buf)?))
            }
            val if val == ControlMessageType::SubscribesBlocked as u64 => Ok(
                ControlMessage::SubscribesBlocked(SubscribesBlocked::decode(buf)?),
            ),
            val if val == ControlMessageType::Subscribe as u64 => {
                Ok(ControlMessage::Subscribe(Subscribe::decode(buf)?))
            }
            val if val == ControlMessageType::SubscribeOk as u64 => {
                Ok(ControlMessage::SubscribeOk(SubscribeOk::decode(buf)?))
            }
            val if val == ControlMessageType::SubscribeError as u64 => {
                Ok(ControlMessage::SubscribeError(SubscribeError::decode(buf)?))
            }
            val if val == ControlMessageType::Unsubscribe as u64 => {
                Ok(ControlMessage::Unsubscribe(Unsubscribe::decode(buf)?))
            }
            val if val == ControlMessageType::SubscribeUpdate as u64 => Ok(
                ControlMessage::SubscribeUpdate(SubscribeUpdate::decode(buf)?),
            ),
            val if val == ControlMessageType::SubscribeDone as u64 => {
                Ok(ControlMessage::SubscribeDone(SubscribeDone::decode(buf)?))
            }
            val if val == ControlMessageType::Fetch as u64 => {
                Ok(ControlMessage::Fetch(Fetch::decode(buf)?))
            }
            val if val == ControlMessageType::FetchOk as u64 => {
                Ok(ControlMessage::FetchOk(FetchOk::decode(buf)?))
            }
            val if val == ControlMessageType::FetchError as u64 => {
                Ok(ControlMessage::FetchError(FetchError::decode(buf)?))
            }
            val if val == ControlMessageType::FetchCancel as u64 => {
                Ok(ControlMessage::FetchCancel(FetchCancel::decode(buf)?))
            }
            val if val == ControlMessageType::TrackStatusRequest as u64 => Ok(
                ControlMessage::TrackStatusRequest(TrackStatusRequest::decode(buf)?),
            ),
            val if val == ControlMessageType::TrackStatus as u64 => {
                Ok(ControlMessage::TrackStatus(TrackStatus::decode(buf)?))
            }
            val if val == ControlMessageType::Announce as u64 => {
                Ok(ControlMessage::Announce(Announce::decode(buf)?))
            }
            val if val == ControlMessageType::AnnounceOk as u64 => {
                Ok(ControlMessage::AnnounceOk(AnnounceOk::decode(buf)?))
            }
            val if val == ControlMessageType::AnnounceError as u64 => {
                Ok(ControlMessage::AnnounceError(AnnounceError::decode(buf)?))
            }
            val if val == ControlMessageType::Unannounce as u64 => {
                Ok(ControlMessage::Unannounce(Unannounce::decode(buf)?))
            }
            val if val == ControlMessageType::AnnounceCancel as u64 => {
                Ok(ControlMessage::AnnounceCancel(AnnounceCancel::decode(buf)?))
            }
            val if val == ControlMessageType::SubscribeAnnounces as u64 => Ok(
                ControlMessage::SubscribeAnnounces(SubscribeAnnounces::decode(buf)?),
            ),
            val if val == ControlMessageType::SubscribeAnnouncesOk as u64 => Ok(
                ControlMessage::SubscribeAnnouncesOk(SubscribeAnnouncesOk::decode(buf)?),
            ),
            val if val == ControlMessageType::SubscribeAnnouncesError as u64 => Ok(
                ControlMessage::SubscribeAnnouncesError(SubscribeAnnouncesError::decode(buf)?),
            ),
            val if val == ControlMessageType::UnsubscribeAnnounces as u64 => Ok(
                ControlMessage::UnsubscribeAnnounces(UnsubscribeAnnounces::decode(buf)?),
            ),
            _ => Err(crate::coding::Error::UnknownMessageType(msg_type)),
        }
    }
}
