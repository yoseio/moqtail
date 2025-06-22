use crate::coding::{Decode, Encode};

pub struct Fetch {}

impl Encode for Fetch {
    fn encode<B: bytes::BufMut>(&self, _buf: &mut B) {
        todo!()
    }
}

impl<'a> Decode<'a> for Fetch {
    fn decode<B: bytes::Buf>(_buf: &mut B) -> Result<Self, crate::coding::Error> {
        todo!()
    }
}
