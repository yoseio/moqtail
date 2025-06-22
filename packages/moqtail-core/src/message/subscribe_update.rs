use crate::coding::{Decode, Encode};

pub struct SubscribeUpdate {}

impl Encode for SubscribeUpdate {
    fn encode<B: bytes::BufMut>(&self, _buf: &mut B) {
        todo!()
    }
}

impl<'a> Decode<'a> for SubscribeUpdate {
    fn decode<B: bytes::Buf>(_buf: &mut B) -> Result<Self, crate::coding::Error> {
        todo!()
    }
}
