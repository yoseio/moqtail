use crate::coding::{Decode, Encode, VarInt};
use crate::model::{GroupOrder, Parameter, TrackName, TrackNamespace};
use bytes::{Buf, BufMut};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FetchType {
    Standalone = 0x1,
    Joining = 0x2,
}

impl From<VarInt> for FetchType {
    fn from(v: VarInt) -> Self {
        match v.into_inner() {
            0x2 => FetchType::Joining,
            _ => FetchType::Standalone,
        }
    }
}

impl From<FetchType> for VarInt {
    fn from(ft: FetchType) -> Self {
        VarInt(ft as u64)
    }
}

#[derive(Debug, Clone)]
pub struct Fetch {
    pub subscribe_id: VarInt,
    pub subscriber_priority: u8,
    pub group_order: GroupOrder,
    pub fetch_type: FetchType,
    pub track_namespace: Option<TrackNamespace>,
    pub track_name: Option<TrackName>,
    pub start_group: Option<VarInt>,
    pub start_object: Option<VarInt>,
    pub end_group: Option<VarInt>,
    pub end_object: Option<VarInt>,
    pub joining_subscribe_id: Option<VarInt>,
    pub preceding_group_offset: Option<VarInt>,
    pub parameters: Vec<Parameter>,
}

impl Encode for Fetch {
    fn encode<B: BufMut>(&self, buf: &mut B) {
        self.subscribe_id.encode(buf);
        buf.put_u8(self.subscriber_priority);
        buf.put_u8(self.group_order.into());
        VarInt::from(self.fetch_type).encode(buf);

        match self.fetch_type {
            FetchType::Standalone => {
                if let Some(ns) = &self.track_namespace {
                    VarInt(ns.len() as u64).encode(buf);
                    for part in ns {
                        VarInt(part.as_bytes().len() as u64).encode(buf);
                        buf.put_slice(part.as_bytes());
                    }
                } else {
                    VarInt(0).encode(buf);
                }

                if let Some(name) = &self.track_name {
                    VarInt(name.as_bytes().len() as u64).encode(buf);
                    buf.put_slice(name.as_bytes());
                } else {
                    VarInt(0).encode(buf);
                }
                self.start_group.unwrap_or(VarInt(0)).encode(buf);
                self.start_object.unwrap_or(VarInt(0)).encode(buf);
                self.end_group.unwrap_or(VarInt(0)).encode(buf);
                self.end_object.unwrap_or(VarInt(0)).encode(buf);
            }
            FetchType::Joining => {
                self.joining_subscribe_id.unwrap_or(VarInt(0)).encode(buf);
                self.preceding_group_offset.unwrap_or(VarInt(0)).encode(buf);
            }
        }

        VarInt(self.parameters.len() as u64).encode(buf);
        for p in &self.parameters {
            p.encode(buf);
        }
    }
}

impl<'a> Decode<'a> for Fetch {
    fn decode<B: Buf>(buf: &mut B) -> Result<Self, crate::coding::Error> {
        let subscribe_id = VarInt::decode(buf)?;

        if !buf.has_remaining() {
            return Err(crate::coding::Error::UnexpectedEnd);
        }
        let subscriber_priority = buf.get_u8();

        if !buf.has_remaining() {
            return Err(crate::coding::Error::UnexpectedEnd);
        }
        let group_order = GroupOrder::from(buf.get_u8());

        let fetch_type = FetchType::from(VarInt::decode(buf)?);

        let (
            track_namespace,
            track_name,
            start_group,
            start_object,
            end_group,
            end_object,
            joining_subscribe_id,
            preceding_group_offset,
        ) = match fetch_type {
            FetchType::Standalone => {
                let ns_len = VarInt::decode(buf)?.into_inner() as usize;
                let mut ns = Vec::with_capacity(ns_len);
                for _ in 0..ns_len {
                    let len = VarInt::decode(buf)?.into_inner() as usize;
                    if buf.remaining() < len {
                        return Err(crate::coding::Error::UnexpectedEnd);
                    }
                    let bytes = buf.copy_to_bytes(len);
                    let s = std::str::from_utf8(&bytes)
                        .map_err(|_| crate::coding::Error::UnexpectedEnd)?
                        .to_string();
                    ns.push(s);
                }

                let name_len = VarInt::decode(buf)?.into_inner() as usize;
                if buf.remaining() < name_len {
                    return Err(crate::coding::Error::UnexpectedEnd);
                }
                let bytes = buf.copy_to_bytes(name_len);
                let name = std::str::from_utf8(&bytes)
                    .map_err(|_| crate::coding::Error::UnexpectedEnd)?
                    .to_string();

                let start_group = VarInt::decode(buf)?;
                let start_object = VarInt::decode(buf)?;
                let end_group = VarInt::decode(buf)?;
                let end_object = VarInt::decode(buf)?;

                (
                    Some(ns),
                    Some(name),
                    Some(start_group),
                    Some(start_object),
                    Some(end_group),
                    Some(end_object),
                    None,
                    None,
                )
            }
            FetchType::Joining => {
                let join_id = VarInt::decode(buf)?;
                let offset = VarInt::decode(buf)?;
                (
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    Some(join_id),
                    Some(offset),
                )
            }
        };

        let num_params = VarInt::decode(buf)?.into_inner() as usize;
        let mut parameters = Vec::with_capacity(num_params);
        for _ in 0..num_params {
            parameters.push(Parameter::decode(buf)?);
        }

        Ok(Fetch {
            subscribe_id,
            subscriber_priority,
            group_order,
            fetch_type,
            track_namespace,
            track_name,
            start_group,
            start_object,
            end_group,
            end_object,
            joining_subscribe_id,
            preceding_group_offset,
            parameters,
        })
    }
}
