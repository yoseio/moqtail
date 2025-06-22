use wasm_bindgen::prelude::*;
use moqtail_wasm::{WasmTransport, WasmConnection};
use moqtail_core::session::{Session, SessionCloseCode, MoqTransport};
use moqtail_core::model::{TrackNamespace, TrackName};
use bytes::Bytes;

// Initialize panic hook for better error messages in the browser
#[wasm_bindgen]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

fn js_err<E: core::fmt::Debug>(e: E) -> JsValue {
    JsValue::from_str(&format!("{:?}", e))
}

#[wasm_bindgen]
pub struct MoqtClient {
    session: Session<WasmConnection>,
}

#[wasm_bindgen]
impl MoqtClient {
    #[wasm_bindgen(constructor)]
    pub async fn new(url: String) -> Result<MoqtClient, JsValue> {
        let transport = WasmTransport::new();
        let conn = transport.connect(&url).await.map_err(js_err)?;
        let session = Session::new_client(conn, None).await.map_err(js_err)?;
        Ok(MoqtClient { session })
    }

    pub async fn subscribe(&mut self, namespace: String, name: String) -> Result<(), JsValue> {
        let ns: TrackNamespace = namespace
            .split('/')
            .filter(|s| !s.is_empty())
            .map(|s| Bytes::from(s.to_string()))
            .collect();
        let tn: TrackName = Bytes::from(name);
        self.session.subscribe(ns, tn).await.map_err(js_err)
    }

    pub async fn close(&mut self) -> Result<(), JsValue> {
        self.session
            .close(SessionCloseCode::NoError, "closing")
            .await
            .map_err(js_err)
    }
}
