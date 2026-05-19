import React from "react";

import { View, StyleSheet } from "react-native";

import { Card, Text } from "react-native-paper";

export default function BillInfoCard({ bill }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>{bill.title}</Text>

        <InfoRow label="Ngày tạo" value={bill.createdAt} />

        <InfoRow label="Người tạo" value={bill.creator} />

        <InfoRow label="Số thành viên" value={`${bill.members} người`} />
      </Card.Content>
    </Card>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>

      <Text>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  label: {
    color: "#6b7280",
  },
});
