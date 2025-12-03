import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";

export default function AttendanceCircle({ percentage }) {
  return (
    <View style={styles.container}>
      <AnimatedCircularProgress
        size={130}
        width={12}
        fill={percentage}
        tintColor="#1d4ed8"
        backgroundColor="#e5e7eb"
        rotation={0}
      >
        {() => (
          <Text style={styles.percentText}>{percentage}%</Text>
        )}
      </AnimatedCircularProgress>

      <Text style={styles.label}>Monthly Attendance</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 10 },
  percentText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
});
