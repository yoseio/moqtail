use crate::coding::{Decode, Encode};

pub struct TrackStatusRequest {}

impl Encode for TrackStatusRequest {
    fn encode<B: bytes::BufMut>(&self, _buf: &mut B) {
        todo!()
    }
}

impl<'a> Decode<'a> for TrackStatusRequest {
    fn decode<B: bytes::Buf>(_buf: &mut B) -> Result<Self, crate::coding::Error> {
        todo!()
    }
}
