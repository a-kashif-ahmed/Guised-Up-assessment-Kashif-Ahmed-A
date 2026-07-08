import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { viewPost, react, reply } from '../api/interaction';
import { Post } from '../types';

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  async function handleView() {
    try {
      await viewPost(post.id);
    } catch {}
  }

  async function handleReaction() {
    try {
      await react(post.id);
    } catch {}
  }

  async function handleReply() {
    try {
      await reply(post.id);
    } catch {}
  }

  return (
    <TouchableOpacity activeOpacity={0.92} onPress={handleView}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(post.user?.name ?? '?').charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.authorContainer}>
            <Text style={styles.author}>
              {post.user?.name ?? 'Anonymous'}
            </Text>

            <Text style={styles.timestamp}>
              Community Member
            </Text>
          </View>
        </View>

        <Text style={styles.content}>
          {post.text_content}
        </Text>

        {post.image_url ? (
          <Image
            source={{ uri: post.image_url }}
            style={styles.image}
          />
        ) : null}

        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Authenticity</Text>

            <Text style={styles.badgeValue}>
              {(post.authenticity_score ?? 0).toFixed(2)}
            </Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Score</Text>

            <Text style={styles.badgeValue}>
              {(post.score ?? post.semantic_score ?? 0).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleReaction}
          >
            <Text style={styles.primaryButtonText}>
              Like
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleReply}
          >
            <Text style={styles.secondaryButtonText}>
              Reply
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 3,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  authorContainer: {
    marginLeft: 14,
  },

  author: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  timestamp: {
    marginTop: 2,
    fontSize: 13,
    color: '#6B7280',
  },

  content: {
    marginTop: 18,
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
  },

  image: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    marginTop: 18,
  },

  badges: {
    flexDirection: 'row',
    marginTop: 18,
  },

  badge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
  },

  badgeLabel: {
    fontSize: 11,
    color: '#6B7280',
  },

  badgeValue: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  actions: {
    flexDirection: 'row',
    marginTop: 22,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginRight: 10,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 15,
  },
});