import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  value: string;
  onChange: (text: string) => void;
  onSearch: () => void;
}

export default function SearchBar({ value, onChange, onSearch }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search posts..."
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
        onSubmitEditing={onSearch}
      />

      <TouchableOpacity style={styles.button} onPress={onSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
