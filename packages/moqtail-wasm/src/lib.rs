use moqtail_core::session::{MoqTransport, MoqConnection, TransportEvent};
use async_trait::async_trait;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;

#[derive(Debug, thiserror::Error)]
pub enum WasmError {
    #[error("JavaScript error: {0:?}")]
    Js(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

impl From<JsValue> for WasmError {
    fn from(v: JsValue) -> Self {
        Self::Js(format!("{:?}", v))
    }
}

pub struct WasmTransport;

impl WasmTransport {
    pub fn new() -> Self { Self }
}

pub struct WasmConnection {
    transport: web_sys::WebTransport,
}

#[async_trait(?Send)]
impl MoqTransport for WasmTransport {
    type Connection = WasmConnection;
    type Error = WasmError;

    async fn connect(&self, url: &str) -> Result<Self::Connection, Self::Error> {
        let transport = web_sys::WebTransport::new(url)?;
        JsFuture::from(transport.ready()).await?;
        Ok(WasmConnection { transport })
    }
}

#[async_trait(?Send)]
impl MoqConnection for WasmConnection {
    type BiStream = IntoAsyncRead<wasm_streams::readable::ReadableStream>; // Simplified for example
    type UniStream = IntoAsyncWrite<wasm_streams::writable::WritableStream>;
    type Datagram = bytes::Bytes;
    type Error = WasmError;

    async fn open_bi(&mut self) -> Result<Self::BiStream, Self::Error> {
        let stream = JsFuture::from(self.transport.create_bidirectional_stream()).await?;
        let bi_stream: web_sys::WebTransportBidirectionalStream = stream.into();

        // `wasm-streams` を使ってJSのストリームをRustの非同期ストリームに変換
        // `readable` のみを返す単純な例。実際には送受信の両方が必要。
        let rs = bi_stream.readable().into_stream();
        Ok(rs.into_async_read())
    }

    async fn open_uni(&mut self) -> Result<Self::UniStream, Self::Error> {
        let stream = JsFuture::from(self.transport.create_unidirectional_stream()).await?;
        let uni_stream: web_sys::WritableStream = stream.into();
        let ws = uni_stream.into_sink();
        Ok(ws.into_async_write())
    }

    async fn send_datagram(&mut self, data: &[u8]) -> Result<(), Self::Error> {
        let datagram_writer = self.transport.datagrams().writable().get_writer()?;
        JsFuture::from(datagram_writer.write_with_chunk(data)).await?;
        datagram_writer.release_lock();
        Ok(())
    }

    async fn poll_event(&mut self) -> Result<TransportEvent<Self::BiStream, Self::UniStream, Self::Datagram>, Self::Error> {
        // Wasmでのイベントポーリングは複雑。
        // `select`のような機能がないため、通常は複数のFutureを`race`するか、
        // `Stream`をマージして処理する。
        // ここでは概念を示すための未実装のプレースホルダー。
        unimplemented!("Polling events in Wasm requires a more complex setup, likely merging multiple streams.");
    }
}

// ロギングやパニックフックを初期化するためのユーティリティ関数
#[wasm_bindgen]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}
