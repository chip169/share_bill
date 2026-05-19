import React from "react";

import { View, StyleSheet } from "react-native";

import { Card, Text } from "react-native-paper";

import MemberStatusItem from "./MemberStatusItem";

export default function MemberStatusList({ members }) {
  const paidCount = members.filter((member) => member.paid).length;

  const unpaidCount = members.length - paidCount;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.title}>Trạng thái thanh toán</Text>

          <View style={styles.statusRow}>
            <Text style={styles.paid}>{paidCount} đã trả</Text>

            <Text style={styles.unpaid}>{unpaidCount} chưa trả</Text>
          </View>
        </View>

        {members.map((member) => (
          <MemberStatusItem key={member.id} member={member} />
        ))}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,

    marginBottom: 18,
  },

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 20,
  },

  title: {
    fontSize: 24,

    fontWeight: "bold",
  },

  statusRow: {
    flexDirection: "row",
    gap: 10,
  },

  paid: {
    color: "green",
  },

  unpaid: {
    color: "red",
  },
});
