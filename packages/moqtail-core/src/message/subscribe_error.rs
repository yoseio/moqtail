use crate::coding::{Decode, Encode};

pub struct SubscribeError {}

impl Encode for SubscribeError {
    fn encode<B: bytes::BufMut>(&self, _buf: &mut B) {
        todo!()
    }
}

impl<'a> Decode<'a> for SubscribeError {
    fn decode<B: bytes::Buf>(_buf: &mut B) -> Result<Self, crate::coding::Error> {
        todo!()
    }
}
