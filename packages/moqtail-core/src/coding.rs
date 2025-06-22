use bytes::{Buf, BufMut};
use std::fmt;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("unexpected end of buffer")]
    UnexpectedEnd,
    #[error("unknown message type: {0}")]
    UnknownMessageType(VarInt),
    #[error("message length mismatch")]
    MessageLengthMismatch,
}

/// [Variable-Length Integer Encoding](https://datatracker.ietf.org/doc/html/rfc9000#name-variable-length-integer-enc)
#[derive(Default, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct VarInt(pub u64);

impl VarInt {
    pub fn into_inner(self) -> u64 {
        self.0
    }
}

impl From<u64> for VarInt {
    fn from(v: u64) -> Self {
        Self(v)
    }
}

impl fmt::Debug for VarInt {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        self.0.fmt(f)
    }
}
impl fmt::Display for VarInt {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        self.0.fmt(f)
    }
}

pub trait Encode {
    fn encode<B: BufMut>(&self, buf: &mut B);
}

pub trait Decode<'a>: Sized {
    fn decode<B: Buf>(buf: &mut B) -> Result<Self, Error>;
}

impl Encode for VarInt {
    fn encode<B: BufMut>(&self, buf: &mut B) {
        let val = self.0;
        if val < 2u64.pow(6) {
            buf.put_u8(val as u8);
        } else if val < 2u64.pow(14) {
            buf.put_u16(0b01 << 14 | val as u16);
        } else if val < 2u64.pow(30) {
            buf.put_u32(0b10 << 30 | val as u32);
        } else if val < 2u64.pow(62) {
            buf.put_u64(0b11 << 62 | val);
        } else {
            panic!("VarInt value too large");
        }
    }
}

impl<'a> Decode<'a> for VarInt {
    fn decode<B: Buf>(buf: &mut B) -> Result<Self, Error> {
        if !buf.has_remaining() {
            return Err(Error::UnexpectedEnd);
        }
        let first = buf.get_u8();
        let tag = first >> 6;
        let val = (first & 0x3f) as u64;

        Ok(Self(match tag {
            0b00 => val,
            0b01 => (val << 8 | buf.get_u8() as u64),
            0b10 => (val << 24 | buf.get_u32() as u64) >> 8,
            0b11 => (val << 56 | buf.get_u64() as u64) >> 8,
            _ => unreachable!(),
        }))
    }
}
