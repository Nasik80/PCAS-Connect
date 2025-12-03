import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { colors } from '../constants/colors';
import { Eye, EyeOff } from 'lucide-react-native';

const CustomInput = ({ 
  value, 
  setValue, 
  placeholder, 
  secureTextEntry, 
  isPassword,
  keyboardType = 'default'
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        secureTextEntry={isPassword && !showPassword}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      {isPassword && (
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.icon}>
          {showPassword ? (
            <EyeOff color={colors.textSecondary} size={20} />
          ) : (
            <Eye color={colors.textSecondary} size={20} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    width: '100%',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12, // Increase for larger touch target
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
  },
  icon: {
    marginLeft: 10,
  }
});

export default CustomInput;