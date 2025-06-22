use crate::coding::{Decode, Encode, VarInt};
use crate::message::{
    ClientSetup, ControlMessage, ServerSetup, Subscribe, SubscribeError, SubscribeOk,
};
use crate::model::*;
use async_trait::async_trait;
use futures::io::{AsyncRead, AsyncReadExt, AsyncWrite, AsyncWriteExt};

/// Error codes used when closing a session.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SessionCloseCode {
    NoError = 0x0,
    InternalError = 0x1,
    Unauthorized = 0x2,
    ProtocolViolation = 0x3,
    DuplicateTrackAlias = 0x4,
    ParameterLengthMismatch = 0x5,
    TooManySubscribes = 0x6,
    GoawayTimeout = 0x10,
    ControlMessageTimeout = 0x11,
    DataStreamTimeout = 0x12,
}

impl From<SessionCloseCode> for VarInt {
    fn from(v: SessionCloseCode) -> Self {
        VarInt(v as u64)
    }
}

pub struct Session<T: MoqConnection> {
    conn: T,
    control_stream: T::BiStream,
    version: VarInt,
    next_subscribe_id: u64,
}

impl<T: MoqConnection> Session<T> {
    /// Establish a new session as a client.
    ///
    /// This opens the control stream, sends a [`ClientSetup`] message and waits
    /// for the corresponding [`ServerSetup`].
    pub async fn new_client(mut conn: T) -> Result<Self, T::Error> {
        let mut control_stream = conn.open_bi().await?;

        // advertise support for version 1 with no additional parameters
        let setup = ClientSetup {
            versions: vec![VarInt(1)],
            parameters: Vec::new(),
        };

        let mut buf = bytes::BytesMut::new();
        ControlMessage::ClientSetup(setup).encode(&mut buf);
        control_stream.write_all(&buf).await?;

        // Read the SERVER_SETUP message. For simplicity we allocate a buffer
        // large enough for typical handshake messages.
        let mut read_buf = [0u8; 1024];
        let n = control_stream.read(&mut read_buf).await?;
        let mut read_bytes = bytes::Bytes::copy_from_slice(&read_buf[..n]);

        let version = match ControlMessage::decode(&mut read_bytes) {
            Ok(ControlMessage::ServerSetup(ServerSetup { selected_version, .. })) => {
                log::info!("Session established using version {}", selected_version.0);
                selected_version
            }
            Ok(_other) => {
                log::error!("Unexpected control message during setup");
                return Err(std::io::Error::new(std::io::ErrorKind::Other, "protocol error").into());
            }
            Err(_) => {
                log::error!("Failed to decode SERVER_SETUP");
                return Err(std::io::Error::new(std::io::ErrorKind::Other, "protocol error").into());
            }
        };

        Ok(Self {
            conn,
            control_stream,
            version,
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
            subscribe_id: VarInt(sub_id),
            track_alias: VarInt(sub_id),
            track_namespace: namespace,
            track_name: name,
            subscriber_priority: 0,
            group_order: GroupOrder::Publisher,
            filter_type: SubscribeFilter::LatestObject,
            start_group: None,
            start_object: None,
            end_group: None,
            parameters: Vec::new(),
        };

        let mut buf = bytes::BytesMut::new();
        ControlMessage::Subscribe(msg).encode(&mut buf);
        self.control_stream.write_all(&buf).await?;

        // Wait for a response on the control stream. In a fully fledged
        // implementation we would handle interleaved messages, but for now we
        // simply expect the next message to correspond to this subscribe.
        let mut read_buf = [0u8; 1024];
        let n = self.control_stream.read(&mut read_buf).await?;
        let mut bytes = bytes::Bytes::copy_from_slice(&read_buf[..n]);

        match ControlMessage::decode(&mut bytes) {
            Ok(ControlMessage::SubscribeOk(SubscribeOk { subscribe_id, .. }))
                if subscribe_id.0 == sub_id =>
            {
                Ok(())
            }
            Ok(ControlMessage::SubscribeError(SubscribeError { reason_phrase, .. })) => {
                log::error!("subscribe failed: {}", reason_phrase);
                Err(std::io::Error::new(std::io::ErrorKind::Other, reason_phrase).into())
            }
            Ok(_other) => {
                log::error!("unexpected control message");
                Err(std::io::Error::new(std::io::ErrorKind::Other, "protocol error").into())
            }
            Err(_) => Err(std::io::Error::new(std::io::ErrorKind::Other, "decode error").into()),
        }
    }

    /// Simple event loop that polls the underlying transport for new events.
    /// The current implementation only drains events and logs unexpected ones.
    pub async fn run(&mut self) -> Result<(), T::Error> {
        loop {
            match T::poll_event(&mut self.conn).await? {
                TransportEvent::BiStream(_) => {
                    // Only one bidirectional stream (the control stream) is used
                    // in the current draft. Receiving another is a protocol violation.
                    log::warn!("unexpected bidirectional stream received");
                }
                TransportEvent::UniStream(mut _s) => {
                    // Handling of data streams is out of scope for this example.
                }
                TransportEvent::Datagram(_d) => {
                    // Datagram support is optional; ignore for now.
                }
                TransportEvent::ConnectionClosed => break,
            }
        }
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
