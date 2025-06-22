use crate::coding::{Decode, Encode};

pub struct MaxSubscribeId {}

impl Encode for MaxSubscribeId {
    fn encode<B: bytes::BufMut>(&self, _buf: &mut B) {
        todo!()
    }
}

impl<'a> Decode<'a> for MaxSubscribeId {
    fn decode<B: bytes::Buf>(_buf: &mut B) -> Result<Self, crate::coding::Error> {
        todo!()
    }
}
