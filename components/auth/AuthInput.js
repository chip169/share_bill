import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import tw from "twrnc";

const AuthInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  showToggle = false,
  onToggleSecure,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  onBlur,
  ...props
}) => {
  return (
    <View style={tw`mb-4`}>
      <Text style={tw`text-slate-600 text-sm font-medium mb-2`}>{label}</Text>
      <View style={tw`relative`}>
        <TextInput
          style={tw`border ${error ? "border-red-500" : "border-slate-200"} rounded-xl px-4 py-3.5 text-slate-800 bg-slate-50 ${showToggle ? "pr-12" : ""}`}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onBlur={onBlur}
          {...props}
        />
        {showToggle && (
          <TouchableOpacity
            style={tw`absolute right-4 top-3.5`}
            onPress={onToggleSecure}
          >
            {secureTextEntry ? (
              <Eye size={20} color="#94a3b8" />
            ) : (
              <EyeOff size={20} color="#94a3b8" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={tw`text-red-500 text-xs mt-1 ml-1`}>{error}</Text>}
    </View>
  );
};

export default AuthInput;
