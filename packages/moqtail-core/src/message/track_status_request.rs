use crate::coding::{Decode, Encode, VarInt};
use crate::model::{TrackName, TrackNamespace};
use bytes::{Buf, BufMut};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TrackStatusRequest {
    pub track_namespace: TrackNamespace,
    pub track_name: TrackName,
}

impl Encode for TrackStatusRequest {
    fn encode<B: BufMut>(&self, buf: &mut B) {
        VarInt(self.track_namespace.len() as u64).encode(buf);
        for ns in &self.track_namespace {
            VarInt(ns.as_bytes().len() as u64).encode(buf);
            buf.put_slice(ns.as_bytes());
        }
        VarInt(self.track_name.as_bytes().len() as u64).encode(buf);
        buf.put_slice(self.track_name.as_bytes());
    }
}

impl<'a> Decode<'a> for TrackStatusRequest {
    fn decode<B: Buf>(buf: &mut B) -> Result<Self, crate::coding::Error> {
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

        Ok(TrackStatusRequest {
            track_namespace,
            track_name,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encode_decode_roundtrip() {
        let msg = TrackStatusRequest {
            track_namespace: vec!["ns1".to_string(), "ns2".to_string()],
            track_name: "track".to_string(),
        };

        let mut buf = bytes::BytesMut::new();
        msg.encode(&mut buf);

        let mut bytes = buf.freeze();
        let decoded = TrackStatusRequest::decode(&mut bytes).unwrap();
        assert_eq!(decoded, msg);
    }
}
