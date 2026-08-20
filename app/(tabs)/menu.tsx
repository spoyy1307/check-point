import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";
import TopBar from "../../components/TopBar";

const menu = [
  ["ข้อมูลส่วนตัว","person-outline"],
  ["ตั้งค่าแอปพลิเคชัน","settings-outline"],
  ["คู่มือการใช้งาน","help-circle-outline"],
  ["ติดต่อผู้ดูแลระบบ","people-outline"],
  ["ออกจากระบบ","log-out-outline"]
] as const;

export default function MenuScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}
    >
      <TopBar title="เมนู" />
      <View style={styles.profile}>
        <View style={styles.avatar}><Text style={styles.avatarText}>รปภ.</Text></View>
        <View>
          <Text style={styles.name}>พงษ์พล อุกานต์ภัทรกุล</Text>
          <Text style={styles.muted}>รปภ. ประจำกะ</Text>
          <Text style={styles.muted}>รหัสพนักงาน: 00123</Text>
        </View>
      </View>
      <View style={styles.list}>
        {menu.map(([title, icon]) => (
          <Pressable style={styles.row} key={title}>
            <Ionicons name={icon} size={25} color={COLORS.text} />
            <Text style={styles.rowText}>{title}</Text>
            <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:COLORS.background},
  profile:{margin:14,padding:16,borderRadius:16,backgroundColor:"white",borderWidth:1,borderColor:COLORS.border,flexDirection:"row",alignItems:"center",gap:12},
  avatar:{width:60,height:60,borderRadius:30,backgroundColor:COLORS.blueSoft,alignItems:"center",justifyContent:"center"},
  avatarText:{color:COLORS.blue,fontWeight:"900"},
  name:{fontWeight:"900",color:COLORS.text,fontSize:16},
  muted:{color:COLORS.muted,marginTop:2},
  list:{paddingHorizontal:14,gap:8},
  row:{minHeight:58,paddingHorizontal:14,borderRadius:13,backgroundColor:"white",borderWidth:1,borderColor:COLORS.border,flexDirection:"row",alignItems:"center"},
  rowText:{flex:1,fontWeight:"800",color:COLORS.text,marginLeft:10}
});
