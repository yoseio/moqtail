use crate::coding::{Decode, Encode, VarInt};
use crate::model::TrackNamespace;
use bytes::{Buf, BufMut};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SubscribeAnnouncesOk {
    pub track_namespace_prefix: TrackNamespace,
}

impl Encode for SubscribeAnnouncesOk {
    fn encode<B: bytes::BufMut>(&self, buf: &mut B) {
        VarInt(self.track_namespace_prefix.len() as u64).encode(buf);
        for ns in &self.track_namespace_prefix {
            VarInt(ns.as_bytes().len() as u64).encode(buf);
            buf.put_slice(ns.as_bytes());
        }
    }
}

impl<'a> Decode<'a> for SubscribeAnnouncesOk {
    fn decode<B: bytes::Buf>(buf: &mut B) -> Result<Self, crate::coding::Error> {
        let namespace_len = VarInt::decode(buf)?.into_inner() as usize;
        let mut track_namespace_prefix = Vec::with_capacity(namespace_len);
        for _ in 0..namespace_len {
            let len = VarInt::decode(buf)?.into_inner() as usize;
            if buf.remaining() < len {
                return Err(crate::coding::Error::UnexpectedEnd);
            }
            let bytes = buf.copy_to_bytes(len);
            let s = std::str::from_utf8(&bytes)
                .map_err(|_| crate::coding::Error::UnexpectedEnd)?
                .to_string();
            track_namespace_prefix.push(s);
        }

        Ok(SubscribeAnnouncesOk {
            track_namespace_prefix,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encode_decode_roundtrip() {
        let msg = SubscribeAnnouncesOk {
            track_namespace_prefix: vec!["example".to_string(), "meeting=123".to_string()],
        };

        let mut buf = bytes::BytesMut::new();
        msg.encode(&mut buf);

        let mut bytes = buf.freeze();
        let decoded = SubscribeAnnouncesOk::decode(&mut bytes).unwrap();

        assert_eq!(decoded, msg);
    }
}
