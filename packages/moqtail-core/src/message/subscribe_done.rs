use crate::coding::{Decode, Encode};

pub struct SubscribeDone {}

impl Encode for SubscribeDone {
    fn encode<B: bytes::BufMut>(&self, _buf: &mut B) {
        todo!()
    }
}

impl<'a> Decode<'a> for SubscribeDone {
    fn decode<B: bytes::Buf>(_buf: &mut B) -> Result<Self, crate::coding::Error> {
        todo!()
    }
}
