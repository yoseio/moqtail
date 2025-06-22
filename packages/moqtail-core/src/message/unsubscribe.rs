use crate::coding::{Decode, Encode};

pub struct Unsubscribe {}

impl Encode for Unsubscribe {
    fn encode<B: bytes::BufMut>(&self, _buf: &mut B) {
        todo!()
    }
}

impl<'a> Decode<'a> for Unsubscribe {
    fn decode<B: bytes::Buf>(_buf: &mut B) -> Result<Self, crate::coding::Error> {
        todo!()
    }
}
