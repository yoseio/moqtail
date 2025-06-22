use crate::coding::{Decode, Encode, VarInt};
use bytes::{Buf, BufMut};
use crate::model::Parameter;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SubscribeOk {
    pub subscribe_id: VarInt,
    pub expires: VarInt,
    pub group_order: u8,
    pub content_exists: u8,
    pub largest_group_id: Option<VarInt>,
    pub largest_object_id: Option<VarInt>,
    pub parameters: Vec<Parameter>,
}

impl Encode for SubscribeOk {
    fn encode<B: BufMut>(&self, buf: &mut B) {
        self.subscribe_id.encode(buf);
        self.expires.encode(buf);
        buf.put_u8(self.group_order);
        buf.put_u8(self.content_exists);
        if self.content_exists == 1 {
            if let Some(gid) = &self.largest_group_id {
                gid.encode(buf);
            }
            if let Some(oid) = &self.largest_object_id {
                oid.encode(buf);
            }
        }
        VarInt(self.parameters.len() as u64).encode(buf);
        for p in &self.parameters {
            p.encode(buf);
        }
    }
}

impl<'a> Decode<'a> for SubscribeOk {
    fn decode<B: Buf>(buf: &mut B) -> Result<Self, crate::coding::Error> {
        let subscribe_id = VarInt::decode(buf)?;
        let expires = VarInt::decode(buf)?;
        if !buf.has_remaining() {
            return Err(crate::coding::Error::UnexpectedEnd);
        }
        let group_order = buf.get_u8();
        if !buf.has_remaining() {
            return Err(crate::coding::Error::UnexpectedEnd);
        }
        let content_exists = buf.get_u8();

        let (largest_group_id, largest_object_id) = if content_exists == 1 {
            let gid = VarInt::decode(buf)?;
            let oid = VarInt::decode(buf)?;
            (Some(gid), Some(oid))
        } else {
            (None, None)
        };

        let num_params = VarInt::decode(buf)?.into_inner() as usize;
        let mut parameters = Vec::new();
        for _ in 0..num_params {
            parameters.push(Parameter::decode(buf)?);
        }

        Ok(SubscribeOk {
            subscribe_id,
            expires,
            group_order,
            content_exists,
            largest_group_id,
            largest_object_id,
            parameters,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encode_decode_roundtrip_no_content() {
        let msg = SubscribeOk {
            subscribe_id: VarInt(1),
            expires: VarInt(0),
            group_order: 1,
            content_exists: 0,
            largest_group_id: None,
            largest_object_id: None,
            parameters: Vec::new(),
        };
        let mut buf = bytes::BytesMut::new();
        msg.encode(&mut buf);

        let mut bytes = buf.freeze();
        let decoded = SubscribeOk::decode(&mut bytes).unwrap();
        assert_eq!(decoded, msg);
    }

    #[test]
    fn encode_decode_roundtrip_with_content() {
        let msg = SubscribeOk {
            subscribe_id: VarInt(2),
            expires: VarInt(10),
            group_order: 2,
            content_exists: 1,
            largest_group_id: Some(VarInt(5)),
            largest_object_id: Some(VarInt(7)),
            parameters: vec![Parameter::DeliveryTimeout(VarInt(3))],
        };
        let mut buf = bytes::BytesMut::new();
        msg.encode(&mut buf);

        let mut bytes = buf.freeze();
        let decoded = SubscribeOk::decode(&mut bytes).unwrap();
        assert_eq!(decoded, msg);
    }
}
