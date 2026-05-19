import React from "react";

import { View, StyleSheet, Text } from "react-native";

import { Avatar, IconButton } from "react-native-paper";

export default function MemberStatusItem({ member }) {
  return (
    <View
      style={[
        styles.container,

        {
          backgroundColor: member.paid ? "#edf7f1" : "#fdeeee",
        },
      ]}
    >
      <View style={styles.left}>
        <Avatar.Text size={52} label={member.name[0]} style={styles.avatar} />

        <View>
          <Text style={styles.name}>{member.name}</Text>

          <Text style={styles.code}>{member.code}</Text>
        </View>
      </View>

      <IconButton
        icon={member.paid ? "check-circle-outline" : "close-circle-outline"}
        iconColor={member.paid ? "#16a34a" : "#dc2626"}
        size={28}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    padding: 18,

    borderRadius: 18,

    marginBottom: 14,
  },

  left: {
    flexDirection: "row",

    alignItems: "center",

    gap: 14,
  },

  avatar: {
    backgroundColor: "#0ea5e9",
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
  },

  code: {
    color: "#6b7280",
    marginTop: 2,
  },
});
