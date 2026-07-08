import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/AppNavigator';
import { getFeed } from '../api/feed';
import PostCard from '../components/PostCard';
import { Post } from '../types';

type Props = NativeStackScreenProps<MainStackParamList, 'Feed'>;

export default function FeedScreen({ navigation }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getFeed();
      setPosts(response.data ?? []);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Guised Feed</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Text style={styles.link}>Search</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('Create Post')}>
        <Text style={styles.createText}>Create Post</Text>
      </TouchableOpacity>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostCard post={item} />}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadFeed} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No posts available.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: '#fff',
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  link: { color: '#1976D2', fontWeight: 'bold' },
  createButton: {
    backgroundColor: '#43A047',
    margin: 12,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  createText: { color: '#fff', fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 50 },
});
