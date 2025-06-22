use crate::coding::{Decode, Encode};

pub struct TrackStatus {}

impl Encode for TrackStatus {
    fn encode<B: bytes::BufMut>(&self, _buf: &mut B) {
        todo!()
    }
}

impl<'a> Decode<'a> for TrackStatus {
    fn decode<B: bytes::Buf>(_buf: &mut B) -> Result<Self, crate::coding::Error> {
        todo!()
    }
}
