import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { viewPost, react, reply } from '../api/interaction';
import { Post } from '../types';

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  async function handleView() {
    try {
      await viewPost(post.id);
    } catch {
      // best-effort logging; don't block the UI on failure
    }
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
    <TouchableOpacity activeOpacity={0.9} onPress={handleView}>
      <View style={styles.card}>
        <Text style={styles.author}>{post.user?.name}</Text>
        <Text style={styles.content}>{post.text_content}</Text>

        {post.image_url ? (
          <Image source={{ uri: post.image_url }} style={styles.image} />
        ) : null}

        <View style={styles.stats}>
          <Text>Authenticity: {(post.authenticity_score ?? 0).toFixed(2)}</Text>
          <Text>Score: {(post.score ?? post.semantic_score ?? 0).toFixed(2)}</Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button} onPress={handleReaction}>
            <Text style={styles.buttonText}>👍 React</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleReply}>
            <Text style={styles.buttonText}>💬 Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
  },
  author: { fontSize: 17, fontWeight: 'bold' },
  content: { marginTop: 10, fontSize: 16, lineHeight: 24 },
  image: { width: '100%', height: 220, marginTop: 15, borderRadius: 10 },
  stats: { marginTop: 15 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  button: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
