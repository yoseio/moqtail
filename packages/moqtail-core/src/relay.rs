use std::collections::{HashMap, HashSet};

use crate::coding::VarInt;
use crate::model::{FullTrackName, Object, ObjectId, TrackAlias, TrackNamespace};

/// Simple in-memory relay implementation.
///
/// The relay stores published objects in a cache and forwards them to
/// subscribed receivers. This is a greatly simplified representation of the
/// behaviour described in draft-ietf-moq-transport section 7.
#[derive(Default)]
pub struct Relay {
    /// Mapping of namespaces to publishers that announced them
    namespace_publishers: HashMap<TrackNamespace, HashSet<usize>>,
    /// Namespaces announced by each publisher
    publisher_namespaces: HashMap<usize, HashSet<TrackNamespace>>,
    /// Active subscriptions per track
    subscriptions: HashMap<FullTrackName, Vec<usize>>, // track -> subscriber ids
    /// Upstream subscription state per track and publisher
    upstream_subscribed: HashMap<FullTrackName, HashSet<usize>>, // track -> publishers
    /// Cached objects keyed by track and object id
    cache: HashMap<(FullTrackName, ObjectId), bytes::Bytes>,
    /// Delivered objects per subscriber (for testing)
    subscribers: HashMap<usize, Vec<Object>>, // subscriber id -> received objects
    /// Authorized namespaces per subscriber
    authorized_subscribers: HashMap<usize, HashSet<TrackNamespace>>,
    /// Authorized namespaces per publisher
    authorized_publishers: HashMap<usize, HashSet<TrackNamespace>>,
    /// Mapping of (publisher, track alias) to full track name
    publisher_track_aliases: HashMap<(usize, TrackAlias), FullTrackName>,
    /// Mapping of (subscriber, full track) to track alias used by that subscriber
    subscriber_track_aliases: HashMap<(usize, FullTrackName), TrackAlias>,
    next_subscriber_id: usize,
    next_publisher_id: usize,
}

impl Relay {
    /// Create a new empty relay.
    pub fn new() -> Self {
        Self::default()
    }

    /// Register a new publisher and return its identifier.
    pub fn add_publisher(&mut self) -> usize {
        let id = self.next_publisher_id;
        self.next_publisher_id += 1;
        self.publisher_namespaces.insert(id, HashSet::new());
        self.authorized_publishers.insert(id, HashSet::new());
        id
    }

    /// Record that a publisher announced a namespace.
    pub fn announce(&mut self, publisher: usize, ns: TrackNamespace) {
        self.publisher_namespaces
            .entry(publisher)
            .or_default()
            .insert(ns.clone());
        self.namespace_publishers
            .entry(ns)
            .or_default()
            .insert(publisher);
    }

    /// Remove an announced namespace for a specific publisher.
    pub fn unannounce(&mut self, publisher: usize, ns: &TrackNamespace) {
        if let Some(set) = self.publisher_namespaces.get_mut(&publisher) {
            set.remove(ns);
        }
        if let Some(set) = self.namespace_publishers.get_mut(ns) {
            set.remove(&publisher);
            if set.is_empty() {
                self.namespace_publishers.remove(ns);
            }
        }
    }

    /// Register a new subscriber and return its identifier.
    pub fn add_subscriber(&mut self) -> usize {
        let id = self.next_subscriber_id;
        self.next_subscriber_id += 1;
        self.subscribers.insert(id, Vec::new());
        self.authorized_subscribers.entry(id).or_default();
        id
    }

    /// Subscribe a subscriber to a full track name.
    /// Authorize a subscriber for a namespace.
    pub fn authorize_subscriber(&mut self, subscriber: usize, ns: TrackNamespace) {
        self.authorized_subscribers
            .entry(subscriber)
            .or_default()
            .insert(ns);
    }

    /// Authorize a publisher for a namespace.
    pub fn authorize_publisher(&mut self, publisher: usize, ns: TrackNamespace) {
        self.authorized_publishers
            .entry(publisher)
            .or_default()
            .insert(ns);
    }

    /// Announce a track with a specific alias from a publisher.
    /// Returns `true` if the publisher was authorized for the namespace.
    pub fn announce_track(
        &mut self,
        publisher: usize,
        alias: TrackAlias,
        track: FullTrackName,
    ) -> bool {
        if let Some(allowed) = self.authorized_publishers.get(&publisher) {
            if !allowed.contains(&track.namespace) {
                return false;
            }
        }
        self.announce(publisher, track.namespace.clone());
        self.publisher_track_aliases
            .insert((publisher, alias), track);
        true
    }

    /// Subscribe a subscriber to a full track name with the alias used by the subscriber.
    /// Returns `true` if authorized.
    pub fn subscribe(
        &mut self,
        subscriber: usize,
        track: FullTrackName,
        alias: TrackAlias,
    ) -> bool {
        if let Some(allowed) = self.authorized_subscribers.get(&subscriber) {
            if !allowed.contains(&track.namespace) {
                return false;
            }
        }
        self.subscriptions
            .entry(track.clone())
            .or_default()
            .push(subscriber);
        self.subscriber_track_aliases
            .insert((subscriber, track), alias);
        true
    }

    /// Whether this relay needs to perform an upstream subscription for the
    /// given track. This returns true only if there are no existing
    /// subscriptions for the track.
    pub fn should_subscribe_upstream(&self, publisher: usize, track: &FullTrackName) -> bool {
        !self
            .upstream_subscribed
            .get(track)
            .map_or(false, |set| set.contains(&publisher))
    }

    /// Mark that an upstream subscription for the given publisher and track has been performed.
    pub fn mark_upstream_subscribed(&mut self, publisher: usize, track: &FullTrackName) {
        self.upstream_subscribed
            .entry(track.clone())
            .or_default()
            .insert(publisher);
    }

    /// Publish an object directly to a track. This updates the cache and forwards
    /// the object to all subscribers of the track using each subscriber's alias.
    pub fn publish_to_track(
        &mut self,
        track: &FullTrackName,
        id: ObjectId,
        payload: bytes::Bytes,
    ) {
        let key = (track.clone(), id);
        self.cache.insert(key.clone(), payload.clone());

        if let Some(subs) = self.subscriptions.get(track) {
            for s in subs {
                if let Some(list) = self.subscribers.get_mut(s) {
                    let alias = self
                        .subscriber_track_aliases
                        .get(&(*s, track.clone()))
                        .copied()
                        .unwrap_or(VarInt(*s as u64));
                    list.push(Object {
                        track_alias: alias,
                        id,
                        publisher_priority: 128,
                        payload: payload.clone(),
                    });
                }
            }
        }
    }

    /// Publish an object using the publisher's track alias.
    pub fn publish_object(
        &mut self,
        publisher: usize,
        alias: TrackAlias,
        id: ObjectId,
        payload: bytes::Bytes,
    ) {
        if let Some(track) = self.publisher_track_aliases.get(&(publisher, alias)).cloned() {
            self.publish_to_track(&track, id, payload);
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
        let publisher = relay.add_publisher();
        relay.authorize_publisher(publisher, track.namespace.clone());
        assert!(relay.announce_track(publisher, VarInt(0), track.clone()));
        let sub = relay.add_subscriber();
        relay.authorize_subscriber(sub, track.namespace.clone());
        assert!(relay.subscribe(sub, track.clone(), VarInt(0)));

        let sub1 = relay.add_subscriber();
        relay.authorize_subscriber(sub1, track.namespace.clone());
        assert!(relay.should_subscribe_upstream(publisher, &track));
        assert!(relay.subscribe(sub1, track.clone(), VarInt(1)));
        relay.mark_upstream_subscribed(publisher, &track);
        assert!(!relay.should_subscribe_upstream(publisher, &track));

        let obj_id = ObjectId { group: VarInt(1), object: VarInt(1) };
        relay.publish_object(publisher, VarInt(0), obj_id, bytes::Bytes::from_static(b"data"));

        assert_eq!(relay.delivered(sub1).len(), 1);
        assert_eq!(relay.fetch(&track, &obj_id).unwrap(), bytes::Bytes::from_static(b"data"));

        let sub2 = relay.add_subscriber();
        relay.authorize_subscriber(sub2, track.namespace.clone());
        assert!(relay.subscribe(sub2, track.clone(), VarInt(2)));
        relay.publish_object(publisher, VarInt(0), ObjectId { group: VarInt(1), object: VarInt(2) }, bytes::Bytes::from_static(b"data2"));

        assert_eq!(relay.delivered(sub1).len(), 2);
        assert_eq!(relay.delivered(sub2).len(), 1);
    }

    #[test]
    fn update_cached_object() {
        let mut relay = Relay::new();
        let track = make_track();
        let publisher = relay.add_publisher();
        relay.authorize_publisher(publisher, track.namespace.clone());
        assert!(relay.announce_track(publisher, VarInt(0), track.clone()));

        let obj_id = ObjectId { group: VarInt(1), object: VarInt(1) };
        relay.publish_object(publisher, VarInt(0), obj_id, bytes::Bytes::from_static(b"a"));
        relay.publish_object(publisher, VarInt(0), obj_id, bytes::Bytes::from_static(b"b"));
        assert_eq!(relay.fetch(&track, &obj_id).unwrap(), bytes::Bytes::from_static(b"b"));
    }

    #[test]
    fn multiple_publishers_same_namespace() {
        let mut relay = Relay::new();
        let track = make_track();
        let pub1 = relay.add_publisher();
        let pub2 = relay.add_publisher();
        relay.authorize_publisher(pub1, track.namespace.clone());
        relay.authorize_publisher(pub2, track.namespace.clone());
        assert!(relay.announce_track(pub1, VarInt(0), track.clone()));
        assert!(relay.announce_track(pub2, VarInt(0), track.clone()));

        let sub = relay.add_subscriber();
        relay.authorize_subscriber(sub, track.namespace.clone());
        assert!(relay.subscribe(sub, track.clone(), VarInt(0)));

        // mark upstream subscription only once per publisher
        relay.mark_upstream_subscribed(pub1, &track);
        relay.mark_upstream_subscribed(pub2, &track);

        let obj_id = ObjectId { group: VarInt(1), object: VarInt(1) };
        relay.publish_object(pub1, VarInt(0), obj_id, bytes::Bytes::from_static(b"first"));
        // duplicate object from another publisher should update cache
        relay.publish_object(pub2, VarInt(0), obj_id, bytes::Bytes::from_static(b"second"));

        assert_eq!(relay.fetch(&track, &obj_id).unwrap(), bytes::Bytes::from_static(b"second"));
        assert_eq!(relay.delivered(sub).len(), 2);
    }

    #[test]
    fn subscriber_authorization() {
        let mut relay = Relay::new();
        let track = make_track();
        let sub = relay.add_subscriber();
        // Do not authorize subscriber
        assert!(!relay.subscribe(sub, track.clone(), VarInt(0)));
    }

    #[test]
    fn publisher_authorization() {
        let mut relay = Relay::new();
        let track = make_track();
        let pub_id = relay.add_publisher();
        // Publisher not authorized for namespace
        assert!(!relay.announce_track(pub_id, VarInt(0), track.clone()));
        relay.authorize_publisher(pub_id, track.namespace.clone());
        assert!(relay.announce_track(pub_id, VarInt(0), track));
    }
}
