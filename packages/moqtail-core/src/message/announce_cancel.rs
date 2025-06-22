use crate::coding::{Decode, Encode};

pub struct AnnounceCancel {}

impl Encode for AnnounceCancel {
    fn encode<B: bytes::BufMut>(&self, _buf: &mut B) {
        todo!()
    }
}

impl<'a> Decode<'a> for AnnounceCancel {
    fn decode<B: bytes::Buf>(_buf: &mut B) -> Result<Self, crate::coding::Error> {
        todo!()
    }
}
