import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '../constants/colors';

const Card = ({ children, title, icon, style }) => {
  return (
    <View style={[styles.card, style]}>
      {(title || icon) && (
        <View style={styles.header}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          {title && <Text style={styles.title}>{title}</Text>}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    marginTop: 4,
  }
});

export default Card;