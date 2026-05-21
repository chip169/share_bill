import React from "react";

import { View, ScrollView, StyleSheet } from "react-native";

import { Button } from "react-native-paper";

import BillInfoCard from "../components/bill/BillInfoCard";

import BillItemsCard from "../components/bill/BillItemsCard";

import PaymentCard from "../components/bill/PaymentCard";

import MemberStatusList from "../components/bill/MemberStatusList";

import BankInfoCard from "../components/bill/BankInfoCard";

import data from "../database.json";

export default function BillDetailScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BillInfoCard bill={data.bill} />

        <BillItemsCard bill={data.bill} />

        <PaymentCard
          amount={data.bill.splitAmount}
          members={data.bill.members}
        />

        <MemberStatusList members={data.members} />

        <BankInfoCard bank={data.bank} />
      </ScrollView>

      {/* BUTTON FIXED BÊN DƯỚI */}

      <View style={styles.bottomButtonContainer}>
        <Button
          mode="contained"
          icon="qrcode"
          contentStyle={styles.buttonContent}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Xem mã QR thanh toán
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  scrollContent: {
    padding: 16,

    paddingBottom: 120,
  },

  bottomButtonContainer: {
    position: "absolute",

    bottom: 0,
    left: 0,
    right: 0,

    padding: 16,

    backgroundColor: "white",

    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  button: {
    borderRadius: 16,
  },

  buttonContent: {
    height: 56,
  },

  buttonLabel: {
    fontSize: 16,
  },
});
