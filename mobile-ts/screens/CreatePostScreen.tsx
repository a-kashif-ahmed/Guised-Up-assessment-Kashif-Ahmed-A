import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/AppNavigator';
import { createPost } from '../api/posts';

type Props = NativeStackScreenProps<MainStackParamList, 'Create Post'>;

export default function CreatePostScreen({ navigation }: Props) {
  const [textContent, setTextContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreatePost() {
    if (!textContent.trim()) {
      Alert.alert('Validation', 'Post content is required.');
      return;
    }

    try {
      setLoading(true);

      await createPost(textContent, imageUrl || null);

      Alert.alert('Success', 'Your post has been published.');

      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message ?? 'Unable to create post.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Create Post</Text>

        <Text style={styles.subtitle}>
          Share your thoughts with the community.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Post</Text>

          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={7}
            placeholder="What's on your mind?"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
            value={textContent}
            onChangeText={setTextContent}
          />

          <Text style={styles.label}>Image URL</Text>

          <TextInput
            style={styles.input}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            value={imageUrl}
            onChangeText={setImageUrl}
          />

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            disabled={loading}
            onPress={handleCreatePost}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Publishing...' : 'Publish Post'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    padding: 24,
    paddingBottom: 50,
  },

  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 22,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },

  textArea: {
    minHeight: 180,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 22,
  },

  input: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 28,
  },

  button: {
    height: 56,
    backgroundColor: '#111827',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#111827',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});