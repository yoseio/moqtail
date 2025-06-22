use crate::coding::{Decode, Encode, VarInt};
use crate::model::{Parameter, TrackNamespace};
use bytes::{Buf, BufMut};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SubscribeAnnounces {
    pub track_namespace_prefix: TrackNamespace,
    pub parameters: Vec<Parameter>,
}

impl Encode for SubscribeAnnounces {
    fn encode<B: BufMut>(&self, buf: &mut B) {
        VarInt(self.track_namespace_prefix.len() as u64).encode(buf);
        for ns in &self.track_namespace_prefix {
            VarInt(ns.as_bytes().len() as u64).encode(buf);
            buf.put_slice(ns.as_bytes());
        }
        VarInt(self.parameters.len() as u64).encode(buf);
        for p in &self.parameters {
            p.encode(buf);
        }
    }
}

impl<'a> Decode<'a> for SubscribeAnnounces {
    fn decode<B: Buf>(buf: &mut B) -> Result<Self, crate::coding::Error> {
        let len = VarInt::decode(buf)?.into_inner() as usize;
        let mut track_namespace_prefix = Vec::with_capacity(len);
        for _ in 0..len {
            let l = VarInt::decode(buf)?.into_inner() as usize;
            if buf.remaining() < l {
                return Err(crate::coding::Error::UnexpectedEnd);
            }
            let bytes = buf.copy_to_bytes(l);
            let ns = std::str::from_utf8(&bytes)
                .map_err(|_| crate::coding::Error::UnexpectedEnd)?
                .to_string();
            track_namespace_prefix.push(ns);
        }

        let num_params = VarInt::decode(buf)?.into_inner() as usize;
        let mut parameters = Vec::with_capacity(num_params);
        for _ in 0..num_params {
            parameters.push(Parameter::decode(buf)?);
        }

        Ok(SubscribeAnnounces {
            track_namespace_prefix,
            parameters,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encode_decode_roundtrip() {
        let msg = SubscribeAnnounces {
            track_namespace_prefix: vec!["ns1".to_string(), "ns2".to_string()],
            parameters: vec![Parameter::AuthorizationInfo("auth".into())],
        };

        let mut buf = bytes::BytesMut::new();
        msg.encode(&mut buf);

        let mut bytes = buf.freeze();
        let decoded = SubscribeAnnounces::decode(&mut bytes).unwrap();

        assert_eq!(decoded, msg);
    }
}
