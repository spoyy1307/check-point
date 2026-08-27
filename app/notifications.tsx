import React, { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import { COLORS } from "../constants/colors";
import { NotificationCategory, NotificationItem } from "../types/notification";
import { useNotificationStore } from "../lib/notificationStore";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const notifStore = useNotificationStore();
  const allNotifications = notifStore.getAllNotifications();
  const unreadCount = notifStore.getUnreadCount();

  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>("all");
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null);

  // Filtered notifications
  const displayedNotifs = notifStore.getNotificationsByCategory(selectedCategory);

  // Category counts
  const countAll = allNotifications.length;
  const countEmg = allNotifications.filter((n) => n.category === "emergency").length;
  const countAnn = allNotifications.filter((n) => n.category === "announcement").length;
  const countPat = allNotifications.filter((n) => n.category === "patrol").length;

  const handleNotificationPress = (notif: NotificationItem) => {
    notifStore.markAsRead(notif.id);
    setSelectedNotif(notif);
  };

  const handleCallReporter = (phone: string, name: string) => {
    Alert.alert(
      "โทรติดต่อผู้แจ้งเหตุ",
      `ต้องการโทรติดต่อคุณ ${name} ที่หมายเลข ${phone} ใช่หรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "โทรออก",
          onPress: () => {
            Linking.openURL(`tel:${phone.replace(/-/g, "")}`).catch(() => {
              Alert.alert("ไม่สามารถโทรออกได้", "โปรดตรวจสอบการเชื่อมต่อโทรศัพท์");
            });
          }
        }
      ]
    );
  };

  const handleNavigateToScene = (notif: NotificationItem) => {
    if (!notif.incidentData) return;
    const { latitude, longitude, locationName } = notif.incidentData;
    Alert.alert(
      "นำทางไปจุดเกิดเหตุ",
      `พิกัด: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\nสถานที่: ${locationName}\n\nระบบกำลังเปิดแผนที่เส้นทางสนับสนุนความปลอดภัย...`,
      [
        { text: "ปิด", style: "cancel" },
        {
          text: "เปิดแผนที่ภายนอก",
          onPress: () => {
            Linking.openURL(
              `https://maps.google.com/?q=${latitude},${longitude}`
            ).catch(() => {});
          }
        }
      ]
    );
  };

  const handleAcknowledge = (id: string) => {
    notifStore.acknowledgeAnnouncement(id);
    if (selectedNotif && selectedNotif.id === id && selectedNotif.announcementData) {
      setSelectedNotif({
        ...selectedNotif,
        announcementData: {
          ...selectedNotif.announcementData,
          acknowledgedByGuard: true
        }
      });
    }
    Alert.alert("รับทราบประกาศสำเร็จ", "ระบบได้บันทึกการรับทราบคำสั่งของท่านส่งไปยังฝ่ายแอดมินแล้ว");
  };

  return (
    <View style={styles.screen}>
      <TopBar title="การแจ้งเตือนและข่าวสาร" back />

      {/* 1. Header Toolbar (Unread badge & Mark all as read button) */}
      <View style={styles.toolbarRow}>
        <View style={styles.toolbarLeft}>
          <Ionicons name="notifications" size={18} color="#0C4A94" />
          <Text style={styles.toolbarTitle}>
            รายการทั้งหมด ({displayedNotifs.length})
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>ยังไม่อ่าน {unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <Pressable
            style={({ pressed }) => [styles.btnMarkAllRead, pressed && { opacity: 0.7 }]}
            onPress={() => notifStore.markAllAsRead()}
          >
            <Ionicons name="checkmark-done" size={16} color="#0C4A94" />
            <Text style={styles.btnMarkAllReadText}>อ่านทั้งหมด</Text>
          </Pressable>
        )}
      </View>

      {/* 2. Filter Category Pills (แถบกรองหมวดหมู่) */}
      <View style={styles.filterBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <Pressable
            style={[styles.filterPill, selectedCategory === "all" && styles.filterPillActive]}
            onPress={() => setSelectedCategory("all")}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedCategory === "all" && styles.filterPillTextActive
              ]}
            >
              ทั้งหมด ({countAll})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterPill, selectedCategory === "emergency" && styles.filterPillActiveRed]}
            onPress={() => setSelectedCategory("emergency")}
          >
            <Ionicons
              name="warning"
              size={14}
              color={selectedCategory === "emergency" ? "white" : "#DC2626"}
            />
            <Text
              style={[
                styles.filterPillText,
                selectedCategory === "emergency" && styles.filterPillTextActive
              ]}
            >
              เหตุด่วน ({countEmg})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterPill,
              selectedCategory === "announcement" && styles.filterPillActiveBlue
            ]}
            onPress={() => setSelectedCategory("announcement")}
          >
            <Ionicons
              name="megaphone"
              size={14}
              color={selectedCategory === "announcement" ? "white" : "#0C4A94"}
            />
            <Text
              style={[
                styles.filterPillText,
                selectedCategory === "announcement" && styles.filterPillTextActive
              ]}
            >
              ข่าวสารแอดมิน ({countAnn})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.filterPill, selectedCategory === "patrol" && styles.filterPillActivePurple]}
            onPress={() => setSelectedCategory("patrol")}
          >
            <Ionicons
              name="time"
              size={14}
              color={selectedCategory === "patrol" ? "white" : "#7C3AED"}
            />
            <Text
              style={[
                styles.filterPillText,
                selectedCategory === "patrol" && styles.filterPillTextActive
              ]}
            >
              รอบตรวจ ({countPat})
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* 3. Notifications List */}
      <ScrollView
        style={styles.listScrollView}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {displayedNotifs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="notifications-off-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>ไม่มีการแจ้งเตือนในหมวดนี้</Text>
            <Text style={styles.emptySub}>
              เมื่อมีข่าวสารหรือการแจ้งเหตุฉุกเฉิน ข้อมูลจะแสดงที่นี่โดยอัตโนมัติ
            </Text>
          </View>
        ) : (
          displayedNotifs.map((item) => {
            const isEmg = item.category === "emergency";
            const isAnn = item.category === "announcement";
            const isPat = item.category === "patrol";

            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.notifCard,
                  isEmg && styles.cardBorderRed,
                  isAnn && styles.cardBorderBlue,
                  isPat && styles.cardBorderPurple,
                  !item.isRead && styles.cardUnreadHighlight,
                  pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] }
                ]}
                onPress={() => handleNotificationPress(item)}
              >
                {/* Card Header: Category Badge + Timestamp */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderBadgeWrap}>
                    {isEmg && (
                      <View style={styles.badgeCategoryRed}>
                        <Ionicons name="warning" size={13} color="#DC2626" />
                        <Text style={styles.badgeCategoryRedText}>เหตุด่วนสายตรวจ</Text>
                      </View>
                    )}
                    {isAnn && (
                      <View style={styles.badgeCategoryBlue}>
                        <Ionicons name="megaphone" size={13} color="#0C4A94" />
                        <Text style={styles.badgeCategoryBlueText}>ประกาศแอดมิน</Text>
                      </View>
                    )}
                    {isPat && (
                      <View style={styles.badgeCategoryPurple}>
                        <Ionicons name="time" size={13} color="#7C3AED" />
                        <Text style={styles.badgeCategoryPurpleText}>รอบตรวจ</Text>
                      </View>
                    )}

                    {!item.isRead && <View style={styles.dotUnread} />}
                  </View>

                  <Text style={styles.cardTimeText}>
                    {item.timestamp} • {item.date}
                  </Text>
                </View>

                {/* Card Title */}
                <Text style={styles.cardTitle}>{item.title}</Text>

                {/* Card Summary */}
                <Text style={styles.cardSummary} numberOfLines={2}>
                  {item.summary}
                </Text>

                {/* Extra Meta Pill (Location or Publisher) */}
                {isEmg && item.incidentData && (
                  <View style={styles.emgMetaBanner}>
                    <Ionicons name="location" size={14} color="#DC2626" />
                    <Text style={styles.emgMetaText} numberOfLines={1}>
                      {item.incidentData.locationName} (ห่าง ~{item.incidentData.distanceMeters} ม.)
                    </Text>
                  </View>
                )}

                {isAnn && item.announcementData && (
                  <View style={styles.annMetaBanner}>
                    <Ionicons name="shield-checkmark" size={14} color="#0C4A94" />
                    <Text style={styles.annMetaText} numberOfLines={1}>
                      โดย: {item.announcementData.publisherName}
                    </Text>
                    {item.announcementData.acknowledgedByGuard && (
                      <View style={styles.pillAcknowledgedSmall}>
                        <Text style={styles.pillAcknowledgedSmallText}>รับทราบแล้ว ✓</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Thumbnail Preview Strip for Emergency Photos */}
                {isEmg && item.incidentData?.photos && item.incidentData.photos.length > 0 && (
                  <View style={styles.thumbnailStrip}>
                    {item.incidentData.photos.map((photoUri, index) => (
                      <Image
                        key={index}
                        source={{ uri: photoUri }}
                        style={styles.thumbnailImg}
                      />
                    ))}
                    <Text style={styles.thumbnailCountText}>
                      +{item.incidentData.photos.length} รูปหลักฐาน
                    </Text>
                  </View>
                )}

                {/* Bottom Action Footer */}
                <View style={styles.cardFooter}>
                  <Text
                    style={[
                      styles.cardFooterActionText,
                      isEmg && { color: "#DC2626" },
                      isAnn && { color: "#0C4A94" },
                      isPat && { color: "#7C3AED" }
                    ]}
                  >
                    {isEmg
                      ? "แตะดูรูปภาพ & พิกัดช่วยเหลือ ➔"
                      : isAnn
                      ? "แตะอ่านประกาศฉบับเต็ม ➔"
                      : "แตะไปที่รอบตรวจ ➔"}
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* DETAIL MODAL: 1. EMERGENCY INCIDENT BACKUP MODAL (เหตุด่วนเพื่อไปช่วย รปภ. อื่น) */}
      <Modal
        visible={!!selectedNotif && selectedNotif.category === "emergency"}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeaderEmg}>
              <View style={styles.modalHeaderIconWrapRed}>
                <Ionicons name="warning" size={28} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalHeaderTitleRed}>แจ้งเหตุด่วนจากสายตรวจ</Text>
                <Text style={styles.modalHeaderSub}>
                  {selectedNotif?.timestamp} • {selectedNotif?.date}
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedNotif(null)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
              {selectedNotif?.incidentData && (
                <>
                  {/* Reporter Guard Info Card */}
                  <View style={styles.reporterInfoCard}>
                    <View style={styles.reporterAvatarBox}>
                      <Text style={{ fontSize: 24 }}>👮‍♂️</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reporterName}>
                        {selectedNotif.incidentData.reporterName} (รหัส: {selectedNotif.incidentData.reporterId})
                      </Text>
                      <Text style={styles.reporterRole}>
                        เจ้าหน้าที่ รปภ. ผู้แจ้งเหตุ
                      </Text>
                    </View>
                    <Pressable
                      style={styles.btnCallSmall}
                      onPress={() =>
                        handleCallReporter(
                          selectedNotif.incidentData!.reporterPhone,
                          selectedNotif.incidentData!.reporterName
                        )
                      }
                    >
                      <Ionicons name="call" size={16} color="white" />
                      <Text style={styles.btnCallSmallText}>โทรด่วน</Text>
                    </Pressable>
                  </View>

                  {/* Incident Details Card */}
                  <View style={styles.modalDetailCard}>
                    <Text style={styles.modalDetailTitle}>
                      🚨 {selectedNotif.incidentData.incidentType}
                    </Text>

                    <View style={styles.detailRowItem}>
                      <Ionicons name="location" size={18} color="#DC2626" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.detailRowLabel}>สถานที่เกิดเหตุ:</Text>
                        <Text style={styles.detailRowValue}>
                          {selectedNotif.incidentData.locationName}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRowItem}>
                      <Ionicons name="navigate-circle" size={18} color="#0C4A94" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.detailRowLabel}>พิกัด GPS จุดเกิดเหตุจริง:</Text>
                        <Text style={[styles.detailRowValue, { color: "#0C4A94", fontWeight: "900" }]}>
                          {selectedNotif.incidentData.latitude.toFixed(4)},{" "}
                          {selectedNotif.incidentData.longitude.toFixed(4)} (ห่าง ~{selectedNotif.incidentData.distanceMeters} เมตร)
                        </Text>
                      </View>
                    </View>

                    <View style={styles.dividerModal} />

                    <Text style={styles.detailBodyText}>
                      {selectedNotif.content || selectedNotif.summary}
                    </Text>
                  </View>

                  {/* Photos Gallery */}
                  {selectedNotif.incidentData.photos &&
                    selectedNotif.incidentData.photos.length > 0 && (
                      <View style={styles.photoGallerySection}>
                        <Text style={styles.photoGalleryTitle}>
                          📸 รูปภาพหลักฐานจากจุดเกิดเหตุ ({selectedNotif.incidentData.photos.length} รูป)
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                          {selectedNotif.incidentData.photos.map((uri, idx) => (
                            <Pressable
                              key={idx}
                              onPress={() => setActivePhotoUrl(uri)}
                              style={styles.photoThumbWrap}
                            >
                              <Image source={{ uri }} style={styles.photoThumbImg} />
                              <View style={styles.photoThumbZoomIcon}>
                                <Ionicons name="expand" size={14} color="white" />
                              </View>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                </>
              )}
            </ScrollView>

            {/* Modal Bottom Actions */}
            <View style={styles.modalBottomActions}>
              <Pressable
                style={({ pressed }) => [styles.btnActionNavigate, pressed && { opacity: 0.88 }]}
                onPress={() => handleNavigateToScene(selectedNotif!)}
              >
                <Ionicons name="navigate" size={20} color="white" />
                <Text style={styles.btnActionNavigateText}>นำทางไปช่วยเหลือ</Text>
              </Pressable>

              <Pressable
                style={styles.btnActionClose}
                onPress={() => setSelectedNotif(null)}
              >
                <Text style={styles.btnActionCloseText}>ปิดหน้าต่าง</Text>
              </Pressable>
            </View>

            {/* FULLSCREEN PHOTO VIEWER INSIDE EMERGENCY MODAL (Works seamlessly on iOS & Android) */}
            {activePhotoUrl && (
              <View style={styles.fullscreenPhotoBackdrop}>
                {/* Header */}
                <View style={styles.fullscreenPhotoHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fullscreenPhotoTitle}>
                      {selectedNotif?.incidentData?.incidentType || "รูปภาพหลักฐาน"}
                    </Text>
                    <Text style={styles.fullscreenPhotoSub}>
                      พิกัด GPS: {selectedNotif?.incidentData?.latitude.toFixed(4)},{" "}
                      {selectedNotif?.incidentData?.longitude.toFixed(4)}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.btnClosePhotoZoom}
                    onPress={() => setActivePhotoUrl(null)}
                    hitSlop={14}
                  >
                    <Ionicons name="close-circle" size={36} color="white" />
                  </Pressable>
                </View>

                {/* Main Full Image */}
                <View style={styles.fullscreenPhotoWrap}>
                  <Image
                    source={{ uri: activePhotoUrl }}
                    style={styles.fullscreenPhotoImg}
                    resizeMode="contain"
                  />
                </View>

                {/* Footer Watermark */}
                <View style={styles.fullscreenWatermarkBar}>
                  <Ionicons name="shield-checkmark" size={16} color="#4ADE80" />
                  <Text style={styles.fullscreenWatermarkText}>
                    CHECK POINT SECURITY • {selectedNotif?.incidentData?.locationName}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* DETAIL MODAL: 2. ADMIN ANNOUNCEMENT MODAL (ข่าวสารและประกาศจากแอดมิน) */}
      <Modal
        visible={!!selectedNotif && selectedNotif.category === "announcement"}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeaderAnn}>
              <View style={styles.modalHeaderIconWrapBlue}>
                <Ionicons name="megaphone" size={28} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalHeaderTitleBlue}>ประกาศจากฝ่ายบริหาร / แอดมิน</Text>
                <Text style={styles.modalHeaderSub}>
                  {selectedNotif?.timestamp} • {selectedNotif?.date}
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedNotif(null)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
              {selectedNotif && (
                <>
                  {/* Publisher Card */}
                  <View style={styles.publisherCard}>
                    <Ionicons name="business" size={20} color="#0C4A94" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.publisherName}>
                        {selectedNotif.announcementData?.publisherName}
                      </Text>
                      <Text style={styles.publisherRole}>
                        {selectedNotif.announcementData?.publisherRole}
                      </Text>
                    </View>
                  </View>

                  {/* Banner Image (if any) */}
                  {selectedNotif.announcementData?.bannerImage && (
                    <Image
                      source={{ uri: selectedNotif.announcementData.bannerImage }}
                      style={styles.announcementBannerImg}
                    />
                  )}

                  {/* Announcement Content */}
                  <View style={styles.annContentCard}>
                    <Text style={styles.annContentTitle}>{selectedNotif.title}</Text>
                    <View style={styles.dividerModal} />
                    <Text style={styles.annContentBody}>
                      {selectedNotif.content || selectedNotif.summary}
                    </Text>

                    {selectedNotif.announcementData?.validUntil && (
                      <View style={styles.validUntilRow}>
                        <Ionicons name="calendar-outline" size={16} color="#64748B" />
                        <Text style={styles.validUntilText}>
                          มีผลบังคับใช้ถึง: {selectedNotif.announcementData.validUntil}
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </ScrollView>

            {/* Modal Bottom Actions */}
            <View style={styles.modalBottomActions}>
              {selectedNotif?.announcementData?.acknowledgedByGuard ? (
                <View style={styles.acknowledgedBanner}>
                  <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                  <Text style={styles.acknowledgedBannerText}>
                    ท่านได้กดรับทราบประกาศนี้แล้ว ✓
                  </Text>
                </View>
              ) : (
                <Pressable
                  style={({ pressed }) => [styles.btnActionAck, pressed && { opacity: 0.88 }]}
                  onPress={() => handleAcknowledge(selectedNotif!.id)}
                >
                  <Ionicons name="checkbox-outline" size={20} color="white" />
                  <Text style={styles.btnActionAckText}>กดรับทราบประกาศนี้</Text>
                </Pressable>
              )}

              <Pressable
                style={styles.btnActionClose}
                onPress={() => setSelectedNotif(null)}
              >
                <Text style={styles.btnActionCloseText}>ปิดหน้าต่าง</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* DETAIL MODAL: 3. PATROL REMINDER MODAL (แจ้งเตือนรอบตรวจ) */}
      <Modal
        visible={!!selectedNotif && selectedNotif.category === "patrol"}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderPat}>
              <View style={styles.modalHeaderIconWrapPurple}>
                <Ionicons name="time" size={28} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalHeaderTitlePurple}>แจ้งเตือนรอบตรวจจุด</Text>
                <Text style={styles.modalHeaderSub}>
                  {selectedNotif?.timestamp} • {selectedNotif?.date}
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedNotif(null)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {selectedNotif && (
                <View style={styles.modalDetailCard}>
                  <Text style={styles.modalDetailTitle}>{selectedNotif.title}</Text>
                  <Text style={styles.detailBodyText}>
                    {selectedNotif.content || selectedNotif.summary}
                  </Text>

                  {selectedNotif.patrolData && (
                    <View style={styles.patrolMetaBox}>
                      <Text style={styles.patrolMetaRow}>
                        ⏰ เวลาเริ่มตรวจ: {selectedNotif.patrolData.scheduledTime}
                      </Text>
                      <Text style={styles.patrolMetaRow}>
                        📍 จำนวนจุดตรวจ: {selectedNotif.patrolData.totalPoints} จุด
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalBottomActions}>
              <Pressable
                style={({ pressed }) => [styles.btnActionGoPatrol, pressed && { opacity: 0.88 }]}
                onPress={() => {
                  setSelectedNotif(null);
                  router.push("/rounds");
                }}
              >
                <Ionicons name="arrow-forward-circle" size={20} color="white" />
                <Text style={styles.btnActionGoPatrolText}>ไปเลือกรอบตรวจทันที</Text>
              </Pressable>

              <Pressable
                style={styles.btnActionClose}
                onPress={() => setSelectedNotif(null)}
              >
                <Text style={styles.btnActionCloseText}>ปิด</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F7FB"
  },

  // 1. Toolbar Row
  toolbarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8
  },
  toolbarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  toolbarTitle: {
    fontSize: 14.5,
    fontWeight: "900",
    color: COLORS.text
  },
  unreadBadge: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10
  },
  unreadBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "900"
  },
  btnMarkAllRead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CCE0FA"
  },
  btnMarkAllReadText: {
    color: "#0C4A94",
    fontSize: 12,
    fontWeight: "800"
  },

  // 2. Filter Pills
  filterBarContainer: {
    marginBottom: 8
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "white",
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  filterPillActive: {
    backgroundColor: "#0C4A94",
    borderColor: "#0C4A94"
  },
  filterPillActiveRed: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626"
  },
  filterPillActiveBlue: {
    backgroundColor: "#0C4A94",
    borderColor: "#0C4A94"
  },
  filterPillActivePurple: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED"
  },
  filterPillText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#64748B"
  },
  filterPillTextActive: {
    color: "white"
  },

  // 3. List
  listScrollView: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingTop: 4
  },

  // Card
  notifCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#1B2A3F",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  cardBorderRed: {
    borderLeftWidth: 5,
    borderLeftColor: "#DC2626"
  },
  cardBorderBlue: {
    borderLeftWidth: 5,
    borderLeftColor: "#0C4A94"
  },
  cardBorderPurple: {
    borderLeftWidth: 5,
    borderLeftColor: "#7C3AED"
  },
  cardUnreadHighlight: {
    backgroundColor: "#FAFCFF"
  },

  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  cardHeaderBadgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  badgeCategoryRed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  badgeCategoryRedText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "800"
  },
  badgeCategoryBlue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  badgeCategoryBlueText: {
    color: "#0C4A94",
    fontSize: 11,
    fontWeight: "800"
  },
  badgeCategoryPurple: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  badgeCategoryPurpleText: {
    color: "#7C3AED",
    fontSize: 11,
    fontWeight: "800"
  },
  dotUnread: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DC2626"
  },
  cardTimeText: {
    fontSize: 11.5,
    color: "#94A3B8",
    fontWeight: "600"
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
    lineHeight: 21,
    marginBottom: 4
  },
  cardSummary: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19
  },

  emgMetaBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    padding: 8,
    borderRadius: 10,
    marginTop: 8
  },
  emgMetaText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "700",
    flex: 1
  },

  annMetaBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0F6FF",
    padding: 8,
    borderRadius: 10,
    marginTop: 8
  },
  annMetaText: {
    fontSize: 12,
    color: "#0C4A94",
    fontWeight: "700",
    flex: 1
  },
  pillAcknowledgedSmall: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  pillAcknowledgedSmallText: {
    fontSize: 10,
    color: "#16A34A",
    fontWeight: "800"
  },

  thumbnailStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10
  },
  thumbnailImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#E2E8F0"
  },
  thumbnailCountText: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "700"
  },

  cardFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    alignItems: "flex-end"
  },
  cardFooterActionText: {
    fontSize: 12.5,
    fontWeight: "800"
  },

  // Empty State
  emptyCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 12
  },
  emptySub: {
    fontSize: 12.5,
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 20, 35, 0.7)",
    justifyContent: "flex-end"
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10
  },

  modalHeaderEmg: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16
  },
  modalHeaderAnn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16
  },
  modalHeaderPat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16
  },
  modalHeaderIconWrapRed: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center"
  },
  modalHeaderIconWrapBlue: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#0C4A94",
    alignItems: "center",
    justifyContent: "center"
  },
  modalHeaderIconWrapPurple: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center"
  },
  modalHeaderTitleRed: {
    fontSize: 17,
    fontWeight: "900",
    color: "#DC2626"
  },
  modalHeaderTitleBlue: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0C4A94"
  },
  modalHeaderTitlePurple: {
    fontSize: 17,
    fontWeight: "900",
    color: "#7C3AED"
  },
  modalHeaderSub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2
  },
  modalCloseBtn: {
    padding: 6
  },

  // Modal Cards
  reporterInfoCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  reporterAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center"
  },
  reporterName: {
    fontSize: 14.5,
    fontWeight: "900",
    color: COLORS.text
  },
  reporterRole: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 1
  },
  btnCallSmall: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  btnCallSmallText: {
    color: "white",
    fontSize: 12.5,
    fontWeight: "900"
  },

  modalDetailCard: {
    backgroundColor: "#FFF5F5",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 12
  },
  modalDetailTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#991B1B",
    marginBottom: 10
  },
  detailRowItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginVertical: 4
  },
  detailRowLabel: {
    fontSize: 11.5,
    color: "#7F1D1D"
  },
  detailRowValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 1
  },
  dividerModal: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 10
  },
  detailBodyText: {
    fontSize: 13.5,
    color: "#334155",
    lineHeight: 20
  },

  photoGallerySection: {
    marginTop: 4,
    marginBottom: 14
  },
  photoGalleryTitle: {
    fontSize: 13.5,
    fontWeight: "900",
    color: COLORS.text
  },
  photoThumbWrap: {
    marginRight: 10,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative"
  },
  photoThumbImg: {
    width: 90,
    height: 90,
    borderRadius: 12
  },
  photoThumbZoomIcon: {
    position: "absolute",
    right: 4,
    bottom: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 6,
    padding: 4
  },

  // Announcement Modal specifics
  publisherCard: {
    backgroundColor: "#F0F6FF",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#CCE0FA"
  },
  publisherName: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0C4A94"
  },
  publisherRole: {
    fontSize: 12,
    color: "#475569",
    marginTop: 1
  },
  announcementBannerImg: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    marginBottom: 12
  },
  annContentCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12
  },
  annContentTitle: {
    fontSize: 15.5,
    fontWeight: "900",
    color: COLORS.text
  },
  annContentBody: {
    fontSize: 13.5,
    color: "#334155",
    lineHeight: 21
  },
  validUntilRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0"
  },
  validUntilText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600"
  },
  acknowledgedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#86EFAC"
  },
  acknowledgedBannerText: {
    fontSize: 13.5,
    color: "#16A34A",
    fontWeight: "900"
  },

  // Patrol specifics
  patrolMetaBox: {
    backgroundColor: "#F5F3FF",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    gap: 4
  },
  patrolMetaRow: {
    fontSize: 13,
    fontWeight: "800",
    color: "#7C3AED"
  },

  // Modal Actions
  modalBottomActions: {
    marginTop: 12,
    gap: 8
  },
  btnActionNavigate: {
    backgroundColor: "#DC2626",
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  btnActionNavigateText: {
    color: "white",
    fontSize: 15.5,
    fontWeight: "900"
  },
  btnActionAck: {
    backgroundColor: "#0C4A94",
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0C4A94",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  btnActionAckText: {
    color: "white",
    fontSize: 15.5,
    fontWeight: "900"
  },
  btnActionGoPatrol: {
    backgroundColor: "#7C3AED",
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  btnActionGoPatrolText: {
    color: "white",
    fontSize: 15.5,
    fontWeight: "900"
  },
  btnActionClose: {
    backgroundColor: "#F1F5F9",
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  btnActionCloseText: {
    color: "#475569",
    fontSize: 13.5,
    fontWeight: "800"
  },

  // Photo Zoom Overlay
  fullscreenPhotoBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10, 15, 25, 0.96)",
    zIndex: 9999,
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderRadius: 26
  },
  fullscreenPhotoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.15)"
  },
  fullscreenPhotoTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "900"
  },
  fullscreenPhotoSub: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600"
  },
  btnClosePhotoZoom: {
    padding: 4
  },
  fullscreenPhotoWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12
  },
  fullscreenPhotoImg: {
    width: "100%",
    height: "100%",
    borderRadius: 16
  },
  fullscreenWatermarkBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12
  },
  fullscreenWatermarkText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "800"
  }
});
