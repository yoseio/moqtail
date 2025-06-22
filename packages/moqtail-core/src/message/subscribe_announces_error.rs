use crate::coding::{Decode, Encode};

pub struct SubscribeAnnouncesError {}

impl Encode for SubscribeAnnouncesError {
    fn encode<B: bytes::BufMut>(&self, _buf: &mut B) {
        todo!()
    }
}

impl<'a> Decode<'a> for SubscribeAnnouncesError {
    fn decode<B: bytes::Buf>(_buf: &mut B) -> Result<Self, crate::coding::Error> {
        todo!()
    }
}
