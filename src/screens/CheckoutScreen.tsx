import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

const PICKUP_SPOTS = [
  'Main Campus Canteen - Counter 1',
  'Science Block Cafe - Pickup Hub',
  'Library Lawn Kiosk',
  'Engineering Wing Eatery',
];

const PAYMENT_METHODS = [
  { id: 'student_pass', name: 'University Student ID SmartCard', icon: 'card' },
  { id: 'lanka_qr', name: 'LankaQR / Genie / FriMi', icon: 'qr-code-outline' },
  { id: 'card', name: 'Debit / Credit Card (Visa/Master)', icon: 'card-outline' },
  { id: 'cash', name: 'Cash on Counter Pickup', icon: 'cash-outline' },
];

export const CheckoutScreen: React.FC<Props> = ({ navigation }) => {
  const { cart, subtotal, tax, total, placeOrder, user } = useCart();
  const [selectedSpot, setSelectedSpot] = useState(PICKUP_SPOTS[0]);
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].name);
  const [notes, setNotes] = useState('');

  const handleConfirmOrder = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart before proceeding.');
      return;
    }

    const order = placeOrder(selectedSpot, selectedPayment);
    navigation.replace('OrderConfirmation', { order });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout & Schedule</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Student Info Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Ordering For</Text>
          </View>
          <View style={styles.userBox}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userMeta}>ID: {user.studentId} • {user.email}</Text>
          </View>
        </View>

        {/* Pickup Location Selector */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Select Pickup Counter</Text>
          </View>
          {PICKUP_SPOTS.map((spot, idx) => {
            const isSelected = selectedSpot === spot;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                onPress={() => setSelectedSpot(spot)}
                activeOpacity={0.8}
              >
                <View style={styles.radio}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {spot}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Payment Method */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          {PAYMENT_METHODS.map(method => {
            const isSelected = selectedPayment === method.name;
            return (
              <TouchableOpacity
                key={method.id}
                style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                onPress={() => setSelectedPayment(method.name)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={method.icon as any}
                  size={20}
                  color={isSelected ? COLORS.primary : COLORS.textSecondary}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {method.name}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={18} color={COLORS.primary} style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Pickup Time Estimate */}
        <View style={styles.estimateBanner}>
          <Ionicons name="timer-outline" size={24} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.estimateTitle}>Estimated Pickup in 12–15 Minutes</Text>
            <Text style={styles.estimateSub}>Orders are freshly prepped upon payment confirmation.</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Summary ({cart.length} item kinds)</Text>
          {cart.map(c => (
            <View key={c.item.id} style={styles.summaryItemRow}>
              <Text style={styles.summaryItemQty}>{c.quantity}x</Text>
              <Text style={styles.summaryItemName} numberOfLines={1}>
                {c.item.name}
              </Text>
              <Text style={styles.summaryItemPrice}>
                Rs. {(c.item.price * c.quantity).toFixed(0)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryTotalRow}>
            <Text style={styles.totalText}>Total Due</Text>
            <Text style={styles.totalPrice}>Rs. {total.toFixed(0)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmOrder} activeOpacity={0.85}>
          <Text style={styles.confirmBtnText}>Confirm Order • Rs. {total.toFixed(0)}</Text>
          <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
    gap: 16,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm + 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  userBox: {
    backgroundColor: '#F8FAFC',
    padding: SPACING.sm + 4,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  userMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  optionRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: COLORS.secondary,
  },
  estimateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: 12,
  },
  estimateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  estimateSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  summaryItemQty: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    width: 28,
  },
  summaryItemName: {
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
  },
  summaryItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
