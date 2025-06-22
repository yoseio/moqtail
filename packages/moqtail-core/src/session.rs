use crate::coding::{Decode, Encode, VarInt};
use crate::message::{ClientSetup, ControlMessage, Subscribe};
use crate::model::*;
use async_trait::async_trait;
use futures::io::{AsyncRead, AsyncReadExt, AsyncWrite, AsyncWriteExt};

pub struct Session<T: MoqConnection> {
    conn: T,
    control_stream: T::BiStream,
    next_subscribe_id: u64,
}

impl<T: MoqConnection> Session<T> {
    pub async fn new_client(mut conn: T) -> Result<Self, T::Error> {
        let mut control_stream = conn.open_bi().await?;

        let setup = ClientSetup {
            versions: vec![VarInt(1)],
            parameters: Vec::new(),
        };
        let mut buf = bytes::BytesMut::new();
        ControlMessage::ClientSetup(setup).encode(&mut buf);
        control_stream.write_all(&buf).await.map_err(|e| todo!())?;

        let mut read_buf = [0; 1024];
        let n = control_stream
            .read(&mut read_buf)
            .await
            .map_err(|e| todo!())?;
        let mut read_bytes = bytes::Bytes::copy_from_slice(&read_buf[..n]);

        match ControlMessage::decode(&mut read_bytes) {
            Ok(ControlMessage::ServerSetup(_server_setup)) => {
                log::info!("Session established!");
            }
            _ => {
                log::error!("Failed to receive SERVER_SETUP");
            }
        }

        Ok(Self {
            conn,
            control_stream,
            next_subscribe_id: 0,
        })
    }

    pub async fn subscribe(
        &mut self,
        namespace: TrackNamespace,
        name: TrackName,
    ) -> Result<(), T::Error> {
        let sub_id = self.next_subscribe_id;
        self.next_subscribe_id += 1;

        let msg = Subscribe {
        //    subscribe_id: VarInt(sub_id),
        //    track_alias: VarInt(sub_id),
        //    track_namespace: namespace,
        //    track_name: name,
        };

        let mut buf = bytes::BytesMut::new();
        ControlMessage::Subscribe(msg).encode(&mut buf);
        self.control_stream
            .write_all(&buf)
            .await
            .map_err(|e| todo!())?;

        // ここでSUBSCRIBE_OK/ERRORを待つロジックが必要

        Ok(())
    }

    // TODO: イベントをポーリングし、状態を更新する `run` ループを実装
}

pub enum TransportEvent<Bi, Uni, Dgram> {
    BiStream(Bi),
    UniStream(Uni),
    Datagram(Dgram),
    ConnectionClosed,
}

#[async_trait]
pub trait MoqTransport {
    type Connection: MoqConnection;
    type Error: std::error::Error;

    async fn connect(&self, url: &str) -> Result<Self::Connection, Self::Error>;
}

#[async_trait]
pub trait MoqConnection {
    type BiStream: AsyncRead + AsyncWrite + Send + Unpin;
    type UniStream: AsyncWrite + Send + Unpin;
    type Datagram: AsRef<[u8]> + Send;
    type Error: std::error::Error + From<std::io::Error>;

    async fn open_bi(&mut self) -> Result<Self::BiStream, Self::Error>;
    async fn open_uni(&mut self) -> Result<Self::UniStream, Self::Error>;
    async fn send_datagram(&mut self, data: &[u8]) -> Result<(), Self::Error>;
    async fn poll_event(
        &mut self,
    ) -> Result<TransportEvent<Self::BiStream, Self::UniStream, Self::Datagram>, Self::Error>;
}
