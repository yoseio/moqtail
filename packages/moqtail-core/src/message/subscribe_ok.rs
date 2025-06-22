use crate::coding::{Decode, Encode};

pub struct SubscribeOk {}

impl Encode for SubscribeOk {
    fn encode<B: bytes::BufMut>(&self, _buf: &mut B) {
        todo!()
    }
}

impl<'a> Decode<'a> for SubscribeOk {
    fn decode<B: bytes::Buf>(_buf: &mut B) -> Result<Self, crate::coding::Error> {
        todo!()
    }
}
