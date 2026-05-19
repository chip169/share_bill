import React from "react";

import { StyleSheet } from "react-native";

import { Card, Text } from "react-native-paper";

export default function BankInfoCard({ bank }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Thông tin chuyển khoản</Text>

        <Text style={styles.item}>Ngân hàng: {bank.bankName}</Text>

        <Text style={styles.item}>STK: {bank.accountNumber}</Text>

        <Text style={styles.item}>Chủ TK: {bank.owner}</Text>

        <Text style={styles.item}>Nội dung: {bank.transferContent}</Text>
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

  item: {
    marginBottom: 10,
  },
});
