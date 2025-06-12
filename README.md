[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/kota-yata/moqtail)

## moqtail
moqtail is a client implementation of Media over QUIC Transport protocol (MoQT).

This is the root directory of the moqtail projects. The core library lives under the `moqtail-core` workspace. Run `yarn install` to create symbolic links so you can develop the client and core packages together.

### Repository Structure

- **bytes/**
  - Utility code and helpers for handling low-level byte operations, encoding, and decoding. Used internally by client/ and moqtail-core/.

- **client/**
  - Contains a reference client implementation and example usage of moqtail.

- **moqtail-core/**
  - The main core library, providing serializers/deserializers for MOQT control messages, data streams, and packagers.
