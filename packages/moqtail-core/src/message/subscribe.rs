use crate::coding::{Decode, Encode};

pub struct Subscribe {}

impl Encode for Subscribe {
    fn encode<B: bytes::BufMut>(&self, _buf: &mut B) {
        todo!()
    }
}

impl<'a> Decode<'a> for Subscribe {
    fn decode<B: bytes::Buf>(_buf: &mut B) -> Result<Self, crate::coding::Error> {
        todo!()
    }
}
