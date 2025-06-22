use crate::coding::{Decode, Encode};

pub struct UnsubscribeAnnounces {}

impl Encode for UnsubscribeAnnounces {
    fn encode<B: bytes::BufMut>(&self, _buf: &mut B) {
        todo!()
    }
}

impl<'a> Decode<'a> for UnsubscribeAnnounces {
    fn decode<B: bytes::Buf>(_buf: &mut B) -> Result<Self, crate::coding::Error> {
        todo!()
    }
}
