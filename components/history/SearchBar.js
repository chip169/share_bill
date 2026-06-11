import React from 'react';
import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import tw from 'twrnc';

const SearchBar = ({ value, onChangeText }) => (
  <View style={tw`px-4 -mt-7 z-10`}>
    <View style={tw`bg-white flex-row items-center gap-3 px-4 h-13 rounded-2xl shadow-md border border-slate-100`}>
      <Search size={18} color="#94a3b8" />
      <TextInput
        style={tw`flex-1 text-slate-700 text-sm h-full`}
        placeholder="Tìm kiếm hóa đơn..."
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  </View>
);

export default SearchBar;