import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { TabParamList } from '../navigation/TabNavigator';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { Order } from '../types';
import { Ionicons } from '@expo/vector-icons';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'ProfileTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, orders, logoutUser } = useCart();

  const handleLogout = () => {
    logoutUser();
    navigation.replace('Login');
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderHistoryCard}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
    >
      <View style={styles.orderTopRow}>
        <View>
          <Text style={styles.historyOrderId}>{item.id}</Text>
          <Text style={styles.historyDate}>{item.createdAt} • {item.pickupLocation.split('-')[0]}</Text>
        </View>
        <View
          style={[
            styles.historyStatusPill,
            item.status === 'Ready for pickup'
              ? { backgroundColor: '#DCFCE7' }
              : item.status === 'Preparing'
              ? { backgroundColor: '#FEF3C7' }
              : { backgroundColor: '#E0E7FF' },
          ]}
        >
          <Text
            style={[
              styles.historyStatusText,
              item.status === 'Ready for pickup'
                ? { color: '#166534' }
                : item.status === 'Preparing'
                ? { color: '#B45309' }
                : { color: '#3730A3' },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.itemsSummary}>
        {item.items.map(i => `${i.quantity}x ${i.item.name}`).join(', ')}
      </Text>

      <View style={styles.orderBottomRow}>
        <Text style={styles.orderHistoryTotal}>Rs. {item.total.toFixed(0)}</Text>
        <View style={styles.trackLink}>
          <Text style={styles.trackLinkText}>View Status</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileId}>
            {user.isGuest ? 'Guest Access' : `Student ID: ${user.studentId}`}
          </Text>
          <Text style={styles.profileEmail}>{user.email}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{orders.length}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>
                Rs. {orders.reduce((acc, curr) => acc + curr.total, 0).toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Campus Spend</Text>
            </View>
          </View>
        </View>

        {/* Order History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Order History & Activity</Text>
            <Text style={styles.orderCountBadge}>{orders.length}</Text>
          </View>

          {orders.length === 0 ? (
            <View style={styles.emptyHistoryBox}>
              <Ionicons name="receipt-outline" size={36} color={COLORS.textSecondary} />
              <Text style={styles.emptyHistoryText}>No past orders yet</Text>
              <Text style={styles.emptyHistorySub}>Orders placed in this session will appear here.</Text>
            </View>
          ) : (
            <FlatList
              data={orders}
              renderItem={renderOrderItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 10 }}
            />
          )}
        </View>

        {/* App Settings / Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingsGroup}>
            <View style={styles.settingRow}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.settingLabel}>Canteen Order Alerts</Text>
              <Text style={styles.settingValue}>Enabled</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Ionicons name="fast-food-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.settingLabel}>Dietary Preference</Text>
              <Text style={styles.settingValue}>All Menus</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
    gap: SPACING.lg,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  profileId: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  profileEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  orderCountBadge: {
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyHistoryBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyHistoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  emptyHistorySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  orderHistoryCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyOrderId: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  historyDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  historyStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  historyStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemsSummary: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 16,
  },
  orderBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  orderHistoryTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  trackLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trackLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  settingsGroup: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: 10,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  settingValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    gap: 8,
  },
  logoutBtnText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '700',
  },
});
