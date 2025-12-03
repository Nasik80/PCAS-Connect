import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';

const CustomButton = ({ onPress, text, type = "PRIMARY", isLoading = false, icon }) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.container, 
        styles[`container_${type}`],
        isLoading ? styles.container_DISABLED : {}
      ]}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={type === "PRIMARY" ? colors.white : colors.primary} />
      ) : (
        <>
          {icon && icon}
          <Text style={[styles.text, styles[`text_${type}`], icon ? { marginLeft: 10 } : {}]}>
            {text}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    borderRadius: 16, // Modern rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    flexDirection: 'row',
    // Shadow for depth
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4.65,
    elevation: 6,
  },
  container_PRIMARY: {
    backgroundColor: colors.primary,
  },
  container_SECONDARY: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  container_DISABLED: {
    opacity: 0.7,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  text_PRIMARY: {
    color: colors.white,
  },
  text_SECONDARY: {
    color: colors.primary,
  },
});

export default CustomButton;