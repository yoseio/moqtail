use crate::coding::{Decode, Encode, VarInt};
use crate::model::TrackNamespace;
use bytes::{Buf, BufMut};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Unannounce {
    pub track_namespace: TrackNamespace,
}

impl Encode for Unannounce {
    fn encode<B: bytes::BufMut>(&self, buf: &mut B) {
        VarInt(self.track_namespace.len() as u64).encode(buf);
        for ns in &self.track_namespace {
            VarInt(ns.as_bytes().len() as u64).encode(buf);
            buf.put_slice(ns.as_bytes());
        }
    }
}

impl<'a> Decode<'a> for Unannounce {
    fn decode<B: bytes::Buf>(buf: &mut B) -> Result<Self, crate::coding::Error> {
        let len = VarInt::decode(buf)?.into_inner() as usize;
        let mut track_namespace = Vec::with_capacity(len);
        for _ in 0..len {
            let l = VarInt::decode(buf)?.into_inner() as usize;
            if buf.remaining() < l {
                return Err(crate::coding::Error::UnexpectedEnd);
            }
            let bytes = buf.copy_to_bytes(l);
            let s = std::str::from_utf8(&bytes)
                .map_err(|_| crate::coding::Error::UnexpectedEnd)?
                .to_string();
            track_namespace.push(s);
        }

        Ok(Unannounce { track_namespace })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encode_decode_roundtrip() {
        let msg = Unannounce {
            track_namespace: vec!["ns1".to_string(), "ns2".to_string()],
        };

        let mut buf = bytes::BytesMut::new();
        msg.encode(&mut buf);

        let mut bytes = buf.freeze();
        let decoded = Unannounce::decode(&mut bytes).unwrap();

        assert_eq!(decoded, msg);
    }
}
