use crate::coding::{Decode, Encode, VarInt};
use crate::model::TrackNamespace;
use bytes::{Buf, BufMut};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AnnounceOk {
    pub track_namespace: TrackNamespace,
}

impl Encode for AnnounceOk {
    fn encode<B: BufMut>(&self, buf: &mut B) {
        VarInt(self.track_namespace.len() as u64).encode(buf);
        for ns in &self.track_namespace {
            VarInt(ns.as_bytes().len() as u64).encode(buf);
            buf.put_slice(ns.as_bytes());
        }
    }
}

impl<'a> Decode<'a> for AnnounceOk {
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

        Ok(AnnounceOk { track_namespace })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encode_decode_roundtrip() {
        let msg = AnnounceOk {
            track_namespace: vec!["live".to_string(), "video".to_string()],
        };

        let mut buf = bytes::BytesMut::new();
        msg.encode(&mut buf);

        let mut bytes = buf.freeze();
        let decoded = AnnounceOk::decode(&mut bytes).unwrap();

        assert_eq!(decoded, msg);
    }
}
