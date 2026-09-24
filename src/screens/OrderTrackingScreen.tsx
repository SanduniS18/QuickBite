import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { OrderStatus } from '../types';
import { Ionicons } from '@expo/vector-icons';

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { TabParamList } from '../navigation/TabNavigator';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'TrackingTab'>,
  NativeStackScreenProps<RootStackParamList, 'OrderTracking'>
> | NativeStackScreenProps<RootStackParamList, 'OrderTracking'> | any;


const STATUS_STEPS: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
  {
    status: 'Placed',
    label: 'Order Placed',
    desc: 'Sent to the campus kitchen counter',
    icon: 'receipt-outline',
  },
  {
    status: 'Preparing',
    label: 'Preparing in Kitchen',
    desc: 'Chefs are assembling & cooking your meal',
    icon: 'flame-outline',
  },
  {
    status: 'Ready for pickup',
    label: 'Ready for Pickup',
    desc: 'Hot & ready at the designated counter',
    icon: 'bag-check-outline',
  },
];

export const OrderTrackingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { orders, activeOrder } = useCart();
  const orderId = route.params?.orderId;
  const order = (orderId ? orders.find(o => o.id === orderId) : null) || activeOrder;

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="fast-food-outline" size={60} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>No Active Orders</Text>
          <Text style={styles.emptySub}>
            You don't have any ongoing canteen orders to track right now.
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.backBtnText}>Order Something Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Placed':
        return 0;
      case 'Preparing':
        return 1;
      case 'Ready for pickup':
      case 'Completed':
        return 2;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(order.status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Status Tracker</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Status Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.heroBadgeText}>LIVE KITCHEN STATUS</Text>
          </View>
          <Text style={styles.orderNumberText}>Order {order.id}</Text>
          <Text style={styles.orderStatusHighlight}>{order.status.toUpperCase()}</Text>

          <View style={styles.heroInfoRow}>
            <View style={styles.heroInfoItem}>
              <Text style={styles.heroInfoLabel}>Estimated Ready</Text>
              <Text style={styles.heroInfoValue}>{order.pickupTime}</Text>
            </View>
            <View style={styles.heroInfoItem}>
              <Text style={styles.heroInfoLabel}>Pickup Spot</Text>
              <Text style={styles.heroInfoValue}>{order.pickupLocation.split('-')[0]}</Text>
            </View>
          </View>
        </View>

        {/* Live Stepper: Placed -> Preparing -> Ready for pickup */}
        <View style={styles.stepperCard}>
          <Text style={styles.sectionHeader}>Progress Timeline</Text>

          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;

            return (
              <View key={step.status} style={styles.stepRow}>
                <View style={styles.stepIndicatorCol}>
                  <View
                    style={[
                      styles.stepCircle,
                      isCompleted && styles.stepCircleCompleted,
                      isCurrent && styles.stepCircleCurrent,
                    ]}
                  >
                    <Ionicons
                      name={isCompleted ? (isCurrent ? step.icon : 'checkmark') : step.icon}
                      size={18}
                      color={isCompleted ? '#FFFFFF' : COLORS.textSecondary}
                    />
                  </View>
                  {index < STATUS_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        index < currentStep && styles.stepLineCompleted,
                      ]}
                    />
                  )}
                </View>

                <View style={styles.stepContentCol}>
                  <Text
                    style={[
                      styles.stepTitle,
                      isCurrent && styles.stepTitleCurrent,
                      !isCompleted && styles.stepTitlePending,
                    ]}
                  >
                    {step.label}
                  </Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                  {isCurrent && (
                    <View style={styles.activeTag}>
                      <Text style={styles.activeTagText}>In Progress</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Canteen Pickup Instructions */}
        <View style={styles.instructionsCard}>
          <Ionicons name="information-circle" size={22} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.instructionsTitle}>Pickup Instructions</Text>
            <Text style={styles.instructionsText}>
              Show this screen or quote order #{order.id} at the counter when you arrive.
            </Text>
          </View>
        </View>

        {/* Ordered Items Summary */}
        <View style={styles.itemsCard}>
          <Text style={styles.sectionHeader}>Order Details</Text>
          {order.items.map(ci => (
            <View key={ci.item.id} style={styles.summaryItemRow}>
              <Text style={styles.itemQty}>{ci.quantity}x</Text>
              <Text style={styles.itemName} numberOfLines={1}>
                {ci.item.name}
              </Text>
              <Text style={styles.itemPrice}>
                Rs. {(ci.item.price * ci.quantity).toFixed(0)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalPrice}>Rs. {order.total.toFixed(0)}</Text>
          </View>
        </View>
      </ScrollView>
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
  headerBack: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 6,
    marginBottom: SPACING.sm,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  orderNumberText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  orderStatusHighlight: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginVertical: 4,
    letterSpacing: 0.5,
  },
  heroInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  heroInfoItem: {
    alignItems: 'center',
  },
  heroInfoLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },
  heroInfoValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  stepperCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  stepRow: {
    flexDirection: 'row',
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 40,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: COLORS.accent,
  },
  stepCircleCurrent: {
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  stepLine: {
    width: 3,
    flex: 1,
    minHeight: 40,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  stepLineCompleted: {
    backgroundColor: COLORS.accent,
  },
  stepContentCol: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 24,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  stepTitleCurrent: {
    color: COLORS.primaryDark,
    fontSize: 15,
  },
  stepTitlePending: {
    color: COLORS.textSecondary,
  },
  stepDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  activeTag: {
    backgroundColor: COLORS.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginTop: 6,
  },
  activeTagText: {
    color: COLORS.primaryDark,
    fontSize: 10,
    fontWeight: '700',
  },
  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: 12,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
  },
  instructionsText: {
    fontSize: 12,
    color: '#1E3A8A',
    marginTop: 2,
    lineHeight: 16,
  },
  itemsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemQty: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    width: 28,
  },
  itemName: {
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  totalPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
    marginTop: SPACING.md,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    marginTop: SPACING.lg,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
