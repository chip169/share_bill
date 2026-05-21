import React from "react";

import { StyleSheet } from "react-native";

import { Card, Text } from "react-native-paper";

export default function PaymentCard({ amount, members }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.label}>Mỗi người phải trả</Text>

        <Text style={styles.amount}>{amount.toLocaleString()} đ</Text>

        <Text style={styles.subText}>Chia đều cho {members} người</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,

    marginBottom: 18,

    backgroundColor: "#0284c7",
  },

  label: {
    textAlign: "center",

    color: "white",

    fontSize: 18,
  },

  amount: {
    textAlign: "center",

    color: "white",

    fontSize: 44,

    fontWeight: "bold",

    marginTop: 12,
  },

  subText: {
    textAlign: "center",

    color: "white",

    marginTop: 8,

    fontSize: 16,
  },
});
