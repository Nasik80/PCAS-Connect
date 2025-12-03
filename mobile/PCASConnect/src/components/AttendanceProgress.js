import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AttendanceProgress = ({ percentage = 0, radius = 45, strokeWidth = 10 }) => {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (p) => {
    if (p >= 75) return "#22C55E"; // Green
    if (p >= 60) return "#EAB308"; // Yellow
    return "#EF4444"; // Red
  };

  return (
    <View style={styles.container}>
      <View style={{ transform: [{ rotate: '-90deg' }] }}>
        <Svg width={radius * 2} height={radius * 2}>
          {/* Background Circle */}
          <Circle
            stroke="#E2E8F0"
            fill="transparent"
            strokeWidth={strokeWidth}
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
          />
          {/* Foreground Progress Circle */}
          <Circle
            stroke={getColor(percentage)}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
          />
        </Svg>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.percentageText, { color: getColor(percentage) }]}>
          {percentage}%
        </Text>
        <Text style={styles.label}>Attendance</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 10,
    color: '#64748B',
  }
});

export default AttendanceProgress;