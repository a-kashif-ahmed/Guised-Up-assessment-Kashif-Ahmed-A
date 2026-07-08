import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { fetchFeedPage, searchPosts } from '../api/feed';

// Replace with real auth token from your auth context/store.
const AUTH_TOKEN = 'REPLACE_WITH_SANCTUM_TOKEN';

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function PostCard({ post, onReact }) {
  const authorName = post.user?.name || 'Unknown';
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>{authorName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.username}>{authorName}</Text>
          <Text style={styles.timeAgo}>{timeAgo(post.created_at)}</Text>
        </View>
      </View>

      <Text style={styles.postText}>{post.text_content}</Text>

      <TouchableOpacity style={styles.reactionButton} onPress={() => onReact(post.id)}>
        <Text style={styles.reactionText}>◈ React</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function FeedScreen() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const isFetching = useRef(false);

  const loadFeed = useCallback(async (pageToLoad) => {
    if (isFetching.current) return;
    isFetching.current = true;
    pageToLoad === 1 ? setLoading(true) : setLoadingMore(true);
    setError(null);

    try {
      const result = await fetchFeedPage(pageToLoad, AUTH_TOKEN);
      setPosts((prev) => (pageToLoad === 1 ? result.data : [...prev, ...result.data]));
      setHasMore(result.has_more);
      setPage(pageToLoad);
    } catch (err) {
      setError('Could not load your feed. Pull down to try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  }, []);

  React.useEffect(() => {
    loadFeed(1);
  }, [loadFeed]);

  const handleSearch = async (text) => {
    setQuery(text);
    if (!text.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const result = await searchPosts(text, AUTH_TOKEN);
      setSearchResults(result.data);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleReact = (postId) => {
    // Fire-and-forget interaction log; UI doesn't block on this.
    fetch(`${process.env.API_BASE_URL || 'http://localhost:8000/api'}/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({ post_id: postId, type: 'reaction' }),
    }).catch(() => {});
  };

  const handleEndReached = () => {
    if (!hasMore || loadingMore || query.trim()) return;
    loadFeed(page + 1);
  };

  const listData = query.trim() ? searchResults : posts;
  const isShowingSearch = Boolean(query.trim());

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search: 'funny travel stories from last week'"
          placeholderTextColor="#8a8a8f"
          value={query}
          onChangeText={handleSearch}
        />
        {searching && <ActivityIndicator size="small" color="#6c5ce7" />}
      </View>

      {loading && !isShowingSearch ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#6c5ce7" />
          <Text style={styles.stateText}>Loading your feed…</Text>
        </View>
      ) : error && !isShowingSearch ? (
        <View style={styles.centerState}>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadFeed(1)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : listData && listData.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.stateText}>
            {isShowingSearch ? 'No matching posts found.' : 'No posts yet. Check back soon.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={listData || []}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <PostCard post={item} onReact={handleReact} />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={{ marginVertical: 16 }} color="#6c5ce7" /> : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f13',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#1c1c22',
    borderRadius: 14,
  },
  searchInput: {
    flex: 1,
    color: '#f2f2f5',
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#1c1c22',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6c5ce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitial: {
    color: '#fff',
    fontWeight: '600',
  },
  headerText: {
    flex: 1,
  },
  username: {
    color: '#f2f2f5',
    fontWeight: '600',
    fontSize: 14,
  },
  timeAgo: {
    color: '#8a8a8f',
    fontSize: 12,
    marginTop: 1,
  },
  postText: {
    color: '#d6d6db',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 12,
  },
  reactionButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#26262e',
    borderRadius: 10,
  },
  reactionText: {
    color: '#a29bfe',
    fontSize: 13,
    fontWeight: '500',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  stateText: {
    color: '#8a8a8f',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  retryButton: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: '#6c5ce7',
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});
