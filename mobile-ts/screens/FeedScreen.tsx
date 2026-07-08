import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { MainStackParamList } from '../navigation/AppNavigator';
import { getFeed } from '../api/feed';
import { search } from '../api/search';

import SearchBar from '../components/SearchBar';
import PostCard from '../components/PostCard';

import { Post } from '../types';

type Props = NativeStackScreenProps<MainStackParamList, 'Feed'>;

export default function FeedScreen({ navigation }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getFeed();

      setPosts(response.data ?? []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleSearch() {
    if (!query.trim()) {
      loadFeed();
      return;
    }

    try {
      setLoading(true);

      const response = await search(query);

      setPosts(response.data ?? []);
    } catch (error) {
      console.log(error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Discover</Text>

        <Text style={styles.subtitle}>
          Explore, search and discover community posts.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
        />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              setQuery('');
              loadFeed();
            }}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                {query ? 'No matching posts' : 'No posts yet'}
              </Text>

              <Text style={styles.emptySubtitle}>
                {query
                  ? 'Try searching with another keyword.'
                  : 'Create the first post and start the conversation.'}
              </Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Create Post')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
searchButton: {
    backgroundColor: '#EEF2FF',
},
  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 15,
    lineHeight: 22,
  },

  searchContainer: {
    paddingHorizontal: 0,
    marginBottom: 8,
    
    
  },

  list: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120,
  },

  emptyContainer: {
    marginTop: 120,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },

  emptySubtitle: {
    marginTop: 10,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  },

  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#111827',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 8,
  },

  fabText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '300',
    marginTop: -3,
  },
});