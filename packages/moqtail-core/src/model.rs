use crate::coding::VarInt;

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
pub enum SetupParameter {
    Path(String),
    MaxSubscribeId(VarInt),
    Unknown { ty: VarInt, value: bytes::Bytes },
}

impl crate::coding::Encode for SetupParameter {
    fn encode<B: bytes::BufMut>(&self, buf: &mut B) {
        match self {
            SetupParameter::Path(path) => {
                VarInt(1).encode(buf);
                VarInt(path.as_bytes().len() as u64).encode(buf);
                buf.put_slice(path.as_bytes());
            }
            SetupParameter::MaxSubscribeId(id) => {
                VarInt(2).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                id.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put_slice(&tmp);
            }
            SetupParameter::Unknown { ty, value } => {
                ty.encode(buf);
                VarInt(value.len() as u64).encode(buf);
                buf.put_slice(value);
            }
        }
    }
}

impl<'a> crate::coding::Decode<'a> for SetupParameter {
    fn decode<B: bytes::Buf>(buf: &mut B) -> Result<Self, crate::coding::Error> {
        let ty = VarInt::decode(buf)?;
        match ty.into_inner() {
            0x01 => {
                let len = VarInt::decode(buf)?.into_inner() as usize;
                if buf.remaining() < len {
                    return Err(crate::coding::Error::UnexpectedEnd);
                }
                let bytes = buf.copy_to_bytes(len);
                let path = std::str::from_utf8(&bytes)
                    .map_err(|_| crate::coding::Error::UnexpectedEnd)?
                    .to_string();
                Ok(SetupParameter::Path(path))
            }
            0x02 => {
                let _len = VarInt::decode(buf)?;
                let val = VarInt::decode(buf)?;
                Ok(SetupParameter::MaxSubscribeId(val))
            }
            _ => {
                let len = VarInt::decode(buf)?.into_inner() as usize;
                if buf.remaining() < len {
                    return Err(crate::coding::Error::UnexpectedEnd);
                }
                let bytes = buf.copy_to_bytes(len);
                Ok(SetupParameter::Unknown { ty, value: bytes })
            }
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Parameter {
    AuthorizationInfo(String),
    DeliveryTimeout(VarInt),
    MaxCacheDuration(VarInt),
    Unknown { ty: VarInt, value: bytes::Bytes },
}

impl crate::coding::Encode for Parameter {
    fn encode<B: bytes::BufMut>(&self, buf: &mut B) {
        match self {
            Parameter::AuthorizationInfo(info) => {
                VarInt(0x02).encode(buf);
                VarInt(info.as_bytes().len() as u64).encode(buf);
                buf.put_slice(info.as_bytes());
            }
            Parameter::DeliveryTimeout(v) => {
                VarInt(0x03).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                v.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put_slice(&tmp);
            }
            Parameter::MaxCacheDuration(v) => {
                VarInt(0x04).encode(buf);
                let mut tmp = bytes::BytesMut::new();
                v.encode(&mut tmp);
                VarInt(tmp.len() as u64).encode(buf);
                buf.put_slice(&tmp);
            }
            Parameter::Unknown { ty, value } => {
                ty.encode(buf);
                VarInt(value.len() as u64).encode(buf);
                buf.put_slice(value);
            }
        }
    }
}

impl<'a> crate::coding::Decode<'a> for Parameter {
    fn decode<B: bytes::Buf>(buf: &mut B) -> Result<Self, crate::coding::Error> {
        let ty = VarInt::decode(buf)?;
        match ty.into_inner() {
            0x02 => {
                let len = VarInt::decode(buf)?.into_inner() as usize;
                if buf.remaining() < len {
                    return Err(crate::coding::Error::UnexpectedEnd);
                }
                let bytes = buf.copy_to_bytes(len);
                let info = std::str::from_utf8(&bytes)
                    .map_err(|_| crate::coding::Error::UnexpectedEnd)?
                    .to_string();
                Ok(Parameter::AuthorizationInfo(info))
            }
            0x03 => {
                let _len = VarInt::decode(buf)?;
                let val = VarInt::decode(buf)?;
                Ok(Parameter::DeliveryTimeout(val))
            }
            0x04 => {
                let _len = VarInt::decode(buf)?;
                let val = VarInt::decode(buf)?;
                Ok(Parameter::MaxCacheDuration(val))
            }
            _ => {
                let len = VarInt::decode(buf)?.into_inner() as usize;
                if buf.remaining() < len {
                    return Err(crate::coding::Error::UnexpectedEnd);
                }
                let bytes = buf.copy_to_bytes(len);
                Ok(Parameter::Unknown { ty, value: bytes })
            }
        }
    }
}
