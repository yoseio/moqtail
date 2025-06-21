use crate::coding::{Decode, Encode, VarInt};
use bytes::{Buf, BufMut};
use std::collections::HashMap;

pub type TrackNamespace = Vec<String>;

pub type TrackName = String;

pub type TrackAlias = VarInt;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct FullTrackName {
    pub namespace: TrackNamespace,
    pub name: TrackName,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct ObjectId {
    pub group: VarInt,
    pub object: VarInt,
}

#[derive(Debug, Clone)]
pub struct Object {
    pub track_alias: TrackAlias,
    pub id: ObjectId,
    pub publisher_priority: u8,
    pub payload: bytes::Bytes,
}

#[derive(Debug, Clone)]
pub struct Subscribe {
    pub subscribe_id: VarInt,
    pub track_alias: TrackAlias,
    pub track_namespace: TrackNamespace,
    pub track_name: TrackName,
    // ... その他のフィールド (FilterType, Priorityなど)
}

#[derive(Debug, Clone)]
pub struct SubscribeOk {
    pub subscribe_id: VarInt,
    pub expires_ms: VarInt,
    // ... その他のフィールド
}

#[derive(Debug, Clone)]
pub struct SubscribeError {
    pub subscribe_id: VarInt,
    pub error_code: VarInt,
    pub reason_phrase: String,
}

#[derive(Debug, Clone, Default)]
pub struct ClientSetup {
    pub supported_versions: Vec<VarInt>,
    pub params: HashMap<VarInt, Vec<u8>>,
}

#[derive(Debug, Clone, Default)]
pub struct ServerSetup {
    pub selected_version: VarInt,
    pub params: HashMap<VarInt, Vec<u8>>,
}

#[derive(Debug, Clone)]
pub enum ControlMessage {
    ClientSetup(ClientSetup),
    ServerSetup(ServerSetup),
    Subscribe(Subscribe),
    SubscribeOk(SubscribeOk),
    SubscribeError(SubscribeError),
    Announce(String), // Simplified for now
    GoAway(String),   // Simplified for now
                      // TODO: 他のすべてのメッセージタイプを追加
}

impl Encode for ControlMessage {
    fn encode<B: BufMut>(&self, buf: &mut B) {
        match self {
            ControlMessage::ClientSetup(msg) => {
                VarInt(0x40).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            ControlMessage::Subscribe(msg) => {
                VarInt(0x03).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                msg.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put(tmp);
            }
            // TODO: 他のメッセージのエンコードを実装
            _ => unimplemented!(),
        }
    }
}

impl<'a> Decode<'a> for ControlMessage {
    fn decode<B: Buf>(buf: &mut B) -> Result<Self, crate::coding::Error> {
        let msg_type = VarInt::decode(buf)?;
        let _len = VarInt::decode(buf)?;

        match msg_type.into_inner() {
            0x41 => Ok(ControlMessage::ServerSetup(ServerSetup::decode(buf)?)),
            0x04 => Ok(ControlMessage::SubscribeOk(SubscribeOk::decode(buf)?)),
            0x05 => Ok(ControlMessage::SubscribeError(SubscribeError::decode(buf)?)),
            // TODO: 他のメッセージのデコードを実装
            _ => Err(crate::coding::Error::UnknownMessageType(msg_type)),
        }
    }
}

impl Encode for ClientSetup {
    fn encode<B: BufMut>(&self, buf: &mut B) {
        VarInt(self.supported_versions.len() as u64).encode(buf);
        for version in &self.supported_versions {
            version.encode(buf);
        }
        // TODO: パラメータのエンコード
        VarInt(0).encode(buf); // No params for now
    }
}

impl<'a> Decode<'a> for ServerSetup {
    fn decode<B: Buf>(buf: &mut B) -> Result<Self, crate::coding::Error> {
        let selected_version = VarInt::decode(buf)?;
        // TODO: パラメータのデコード
        let num_params = VarInt::decode(buf)?.into_inner();
        if num_params > 0 {
            // ... パラメータを読み飛ばすロジック (未実装)
        }
        Ok(ServerSetup {
            selected_version,
            params: HashMap::new(),
        })
    }
}

impl Encode for Subscribe {
    fn encode<B: BufMut>(&self, buf: &mut B) {
        self.subscribe_id.encode(buf);
        self.track_alias.encode(buf);
        // ... 他フィールドのエンコード
    }
}
impl<'a> Decode<'a> for SubscribeOk {
    fn decode<B: Buf>(buf: &mut B) -> Result<Self, crate::coding::Error> {
        Ok(Self {
            subscribe_id: VarInt::decode(buf)?,
            expires_ms: VarInt::decode(buf)?,
        })
    }
}

impl<'a> Decode<'a> for SubscribeError {
    fn decode<B: Buf>(buf: &mut B) -> Result<Self, crate::coding::Error> {
        Ok(Self {
            subscribe_id: VarInt::decode(buf)?,
            error_code: VarInt::decode(buf)?,
            reason_phrase: String::new(), // Simplified
        })
    }
}
