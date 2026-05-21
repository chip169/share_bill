import React from "react";

import { View, StyleSheet } from "react-native";

import { Card, Text } from "react-native-paper";

export default function BillItemsCard({ bill }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Chi tiết món</Text>

        {bill.items.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text>{item.name}</Text>

            <Text>{item.price.toLocaleString()} đ</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>

          <Text style={styles.totalAmount}>
            {bill.total.toLocaleString()} đ
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",

    marginTop: 14,
    paddingTop: 16,

    flexDirection: "row",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontWeight: "bold",
  },

  totalAmount: {
    color: "green",
    fontWeight: "bold",
    fontSize: 20,
  },
});
