## moqtail
![NPM Version](https://img.shields.io/npm/v/moqtail)

Media over QUIC Transport message serializer/deserializer aiming for browser usages.

## Key Features
- serializer/deserializer for all control messages at `src/messages`
- serializer/deserializer for data streams at `src/dataStreams`
- serializer/deserializer for packagers at `src/packagers`

## client dev
at this point I copy moqtail's src to the client directory with the name "temp" because using serializer/deserializer as local npm package lacks efficiency. When you work on the client directly, don't forget to place temp directory.
