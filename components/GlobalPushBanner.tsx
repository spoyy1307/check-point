import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { NotificationItem } from "../types/notification";
import { soundHelper } from "../lib/soundHelper";
import { notificationStore } from "../lib/notificationStore";

const BANNER_HEIGHT = 96;

export default function GlobalPushBanner() {
  const insets = useSafeAreaInsets();
  const [currentNotif, setCurrentNotif] = useState<NotificationItem | null>(null);
  const translateY = useRef(new Animated.Value(-200)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const dismissBanner = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    Animated.spring(translateY, {
      toValue: -200,
      useNativeDriver: true,
      bounciness: 0
    }).start(() => {
      setCurrentNotif(null);
    });
  };

  const showBanner = (notif: NotificationItem) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCurrentNotif(notif);

    // Play sound and haptic
    if (notif.category === "emergency") {
      soundHelper.playSound("siren");
      Vibration.vibrate([0, 150, 80, 150]);
    } else {
      soundHelper.playSound("beep");
      Vibration.vibrate([0, 80, 50, 80]);
    }

    // Slide down animation
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 60
    }).start();

    // Auto dismiss after 6 seconds
    timeoutRef.current = setTimeout(() => {
      dismissBanner();
    }, 6000);
  };

  useEffect(() => {
    return notificationStore.subscribeBanner((notif) => {
      showBanner(notif);
    });
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy < -5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -20) {
          dismissBanner();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

  if (!currentNotif) return null;

  const getCategoryConfig = () => {
    switch (currentNotif.category) {
      case "emergency":
        return {
          icon: "warning" as const,
          color: "#DC2626",
          bgColor: "#FEE2E2",
          badgeLabel: "เหตุด่วนฉุกเฉิน"
        };
      case "patrol":
        return {
          icon: "alarm" as const,
          color: "#0C4A94",
          bgColor: "#EAF2FF",
          badgeLabel: "รอบตรวจจุด"
        };
      case "announcement":
      default:
        return {
          icon: "megaphone" as const,
          color: "#2563EB",
          bgColor: "#EFF6FF",
          badgeLabel: "ประกาศแอดมิน"
        };
    }
  };

  const config = getCategoryConfig();

  const handleBannerPress = () => {
    dismissBanner();
    if (currentNotif.category === "patrol" && currentNotif.patrolData?.roundId) {
      router.push({
        pathname: "/checkpoint",
        params: { round: currentNotif.patrolData.roundId.toString() }
      });
    } else {
      router.push("/notifications");
    }
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.wrapper,
        {
          top: insets.top > 0 ? insets.top + 6 : 14,
          transform: [{ translateY }]
        }
      ]}
    >
      <Pressable
        style={({ pressed }) => [styles.bannerCard, pressed && styles.bannerPressed]}
        onPress={handleBannerPress}
      >
        {/* Top Mini Header (App Icon + App Name + Time) */}
        <View style={styles.headerRow}>
          <View style={styles.appBrandGroup}>
            <View style={[styles.categoryIconWrap, { backgroundColor: config.bgColor }]}>
              <Ionicons name={config.icon} size={15} color={config.color} />
            </View>
            <Text style={styles.appName}>CHECK POINT</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={[styles.badgeLabel, { color: config.color }]}>
              {config.badgeLabel}
            </Text>
          </View>
          <Text style={styles.timeAgo}>เมื่อสักครู่</Text>
        </View>

        {/* Notification Content */}
        <View style={styles.contentRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {currentNotif.title}
            </Text>
            <Text style={styles.summary} numberOfLines={2}>
              {currentNotif.summary}
            </Text>
          </View>

          <View style={styles.actionArrowWrap}>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </View>
        </View>

        {/* Drag handle */}
        <View style={styles.dragBarContainer}>
          <View style={styles.dragBar} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 999999,
    elevation: 9999
  },
  bannerCard: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    borderWidth: 1.5,
    borderColor: "#CCE0FA",
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10
  },
  bannerPressed: {
    transform: [{ scale: 0.98 }]
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6
  },
  appBrandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  categoryIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  appName: {
    fontSize: 11.5,
    fontWeight: "900",
    color: COLORS.blue,
    letterSpacing: 0.5
  },
  dotSeparator: {
    fontSize: 11,
    color: "#94A3B8"
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: "800"
  },
  timeAgo: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600"
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  title: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 2
  },
  summary: {
    fontSize: 12.5,
    color: "#475569",
    lineHeight: 17
  },
  actionArrowWrap: {
    paddingLeft: 4
  },
  dragBarContainer: {
    alignItems: "center",
    marginTop: 6
  },
  dragBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0"
  }
});
