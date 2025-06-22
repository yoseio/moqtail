use std::collections::{HashMap, HashSet};

use crate::model::{FullTrackName, Object, ObjectId, TrackNamespace};
use crate::coding::VarInt;

/// Simple in-memory relay implementation.
///
/// The relay stores published objects in a cache and forwards them to
/// subscribed receivers. This is a greatly simplified representation of the
/// behaviour described in draft-ietf-moq-transport section 7.
#[derive(Default)]
pub struct Relay {
    announced: HashSet<TrackNamespace>,
    subscriptions: HashMap<FullTrackName, Vec<usize>>, // track -> subscriber ids
    cache: HashMap<(FullTrackName, ObjectId), bytes::Bytes>,
    subscribers: HashMap<usize, Vec<Object>>, // subscriber id -> received objects
    next_subscriber_id: usize,
}

impl Relay {
    /// Create a new empty relay.
    pub fn new() -> Self {
        Self::default()
    }

    /// Record that a publisher announced a namespace.
    pub fn announce(&mut self, ns: TrackNamespace) {
        self.announced.insert(ns);
    }

    /// Remove an announced namespace.
    pub fn unannounce(&mut self, ns: &TrackNamespace) {
        self.announced.remove(ns);
    }

    /// Register a new subscriber and return its identifier.
    pub fn add_subscriber(&mut self) -> usize {
        let id = self.next_subscriber_id;
        self.next_subscriber_id += 1;
        self.subscribers.insert(id, Vec::new());
        id
    }

    /// Subscribe a subscriber to a full track name.
    pub fn subscribe(&mut self, subscriber: usize, track: FullTrackName) {
        self.subscriptions.entry(track).or_default().push(subscriber);
    }

    /// Whether this relay needs to perform an upstream subscription for the
    /// given track. This returns true only if there are no existing
    /// subscriptions for the track.
    pub fn should_subscribe_upstream(&self, track: &FullTrackName) -> bool {
        !self.subscriptions.contains_key(track)
    }

    /// Publish an object to the relay. The object is cached and forwarded to all
    /// active subscribers for the object's track.
    pub fn publish(&mut self, track: &FullTrackName, id: ObjectId, payload: bytes::Bytes) {
        let key = (track.clone(), id);
        self.cache.insert(key.clone(), payload.clone());
        if let Some(subs) = self.subscriptions.get(track) {
            for s in subs {
                if let Some(list) = self.subscribers.get_mut(s) {
                    list.push(Object {
                        track_alias: VarInt(*s as u64),
                        id,
                        publisher_priority: 0,
                        payload: payload.clone(),
                    });
                }
            }
        }
    }

    /// Fetch an object from the relay's cache.
    pub fn fetch(&self, track: &FullTrackName, id: &ObjectId) -> Option<bytes::Bytes> {
        self.cache.get(&(track.clone(), *id)).cloned()
    }

    /// Retrieve the list of objects delivered to a subscriber. This is used in
    /// tests to verify forwarding behaviour.
    pub fn delivered(&self, subscriber: usize) -> &[Object] {
        self.subscribers.get(&subscriber).map(Vec::as_slice).unwrap_or(&[])
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_track() -> FullTrackName {
        FullTrackName {
            namespace: vec![bytes::Bytes::from_static(b"ns")],
            name: bytes::Bytes::from_static(b"name"),
        }
    }

    #[test]
    fn cache_and_forward() {
        let mut relay = Relay::new();
        let track = make_track();
        relay.announce(track.namespace.clone());

        let sub1 = relay.add_subscriber();
        assert!(relay.should_subscribe_upstream(&track));
        relay.subscribe(sub1, track.clone());
        assert!(!relay.should_subscribe_upstream(&track));

        let obj_id = ObjectId { group: VarInt(1), object: VarInt(1) };
        relay.publish(&track, obj_id, bytes::Bytes::from_static(b"data"));

        assert_eq!(relay.delivered(sub1).len(), 1);
        assert_eq!(relay.fetch(&track, &obj_id).unwrap(), bytes::Bytes::from_static(b"data"));

        let sub2 = relay.add_subscriber();
        relay.subscribe(sub2, track.clone());
        relay.publish(&track, ObjectId { group: VarInt(1), object: VarInt(2) }, bytes::Bytes::from_static(b"data2"));

        assert_eq!(relay.delivered(sub1).len(), 2);
        assert_eq!(relay.delivered(sub2).len(), 1);
    }

    #[test]
    fn update_cached_object() {
        let mut relay = Relay::new();
        let track = make_track();
        relay.announce(track.namespace.clone());

        let obj_id = ObjectId { group: VarInt(1), object: VarInt(1) };
        relay.publish(&track, obj_id, bytes::Bytes::from_static(b"a"));
        relay.publish(&track, obj_id, bytes::Bytes::from_static(b"b"));
        assert_eq!(relay.fetch(&track, &obj_id).unwrap(), bytes::Bytes::from_static(b"b"));
    }
}
