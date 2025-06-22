use crate::coding::{Decode, Encode, VarInt};
use crate::model::{TrackName, TrackNamespace};
use bytes::{Buf, BufMut};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TrackStatus {
    pub track_namespace: TrackNamespace,
    pub track_name: TrackName,
    pub status_code: VarInt,
    pub last_group_id: VarInt,
    pub last_object_id: VarInt,
}

impl Encode for TrackStatus {
    fn encode<B: bytes::BufMut>(&self, buf: &mut B) {
        VarInt(self.track_namespace.len() as u64).encode(buf);
        for ns in &self.track_namespace {
            VarInt(ns.as_bytes().len() as u64).encode(buf);
            buf.put_slice(ns.as_bytes());
        }
        VarInt(self.track_name.as_bytes().len() as u64).encode(buf);
        buf.put_slice(self.track_name.as_bytes());
        self.status_code.encode(buf);
        self.last_group_id.encode(buf);
        self.last_object_id.encode(buf);
    }
}

impl<'a> Decode<'a> for TrackStatus {
    fn decode<B: bytes::Buf>(buf: &mut B) -> Result<Self, crate::coding::Error> {
        let namespace_len = VarInt::decode(buf)?.into_inner() as usize;
        let mut track_namespace = Vec::with_capacity(namespace_len);
        for _ in 0..namespace_len {
            let len = VarInt::decode(buf)?.into_inner() as usize;
            if buf.remaining() < len {
                return Err(crate::coding::Error::UnexpectedEnd);
            }
            let bytes = buf.copy_to_bytes(len);
            let s = std::str::from_utf8(&bytes)
                .map_err(|_| crate::coding::Error::UnexpectedEnd)?
                .to_string();
            track_namespace.push(s);
        }

        let name_len = VarInt::decode(buf)?.into_inner() as usize;
        if buf.remaining() < name_len {
            return Err(crate::coding::Error::UnexpectedEnd);
        }
        let bytes = buf.copy_to_bytes(name_len);
        let track_name = std::str::from_utf8(&bytes)
            .map_err(|_| crate::coding::Error::UnexpectedEnd)?
            .to_string();

        let status_code = VarInt::decode(buf)?;
        let last_group_id = VarInt::decode(buf)?;
        let last_object_id = VarInt::decode(buf)?;

        Ok(TrackStatus {
            track_namespace,
            track_name,
            status_code,
            last_group_id,
            last_object_id,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encode_decode_roundtrip() {
        let msg = TrackStatus {
            track_namespace: vec!["ns1".to_string(), "ns2".to_string()],
            track_name: "track".to_string(),
            status_code: VarInt(0),
            last_group_id: VarInt(1),
            last_object_id: VarInt(2),
        };

        let mut buf = bytes::BytesMut::new();
        msg.encode(&mut buf);

        let mut bytes = buf.freeze();
        let decoded = TrackStatus::decode(&mut bytes).unwrap();
        assert_eq!(decoded, msg);
    }
}
