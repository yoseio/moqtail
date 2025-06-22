use crate::coding::{Decode, Encode};

pub struct SubscribeAnnounces {}

impl Encode for SubscribeAnnounces {
    fn encode<B: bytes::BufMut>(&self, _buf: &mut B) {
        todo!()
    }
}

impl<'a> Decode<'a> for SubscribeAnnounces {
    fn decode<B: bytes::Buf>(_buf: &mut B) -> Result<Self, crate::coding::Error> {
        todo!()
    }
}
