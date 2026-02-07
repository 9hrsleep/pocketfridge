// app/(tabs)/profile.tsx

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFridge } from "../../contexts/FridgeContext";

/* ────────────────────────────────────────────── */
/* Hard-coded analytics data                      */
/* ────────────────────────────────────────────── */
const HARDCODED_WEEKLY_ANALYTICS = [
  { week: "01/02", date: "2026-01-02", total: 105.86 },
  { week: "01/09", date: "2026-01-09", total: 70.65 },
  { week: "01/17", date: "2026-01-17", total: 97.32 },
  { week: "01/28", date: "2026-01-28", total: 60.54 },
];

/* ────────────────────────────────────────────── */
/* XY Line Chart (midpoint-based segments)        */
/* - padded plot                                 */
/* - y grid + labels (0..130)                     */
/* - line passes through dot centers              */
/* ────────────────────────────────────────────── */
function WeeklyLineChart({
  data,
  labels,
  yMax = 130,
}: {
  data: number[];
  labels: string[];
  yMax?: number;
}) {
  const [width, setWidth] = useState(0);

  const CHART_H = 160;
  const PAD_X = 16;
  const PAD_TOP = 14;
  const PAD_BOTTOM = 30;

  const plotW = Math.max(width - PAD_X * 2, 1);
  const plotH = CHART_H - PAD_TOP - PAD_BOTTOM;

  const clamp = (v: number) => Math.max(0, Math.min(yMax, v));

  // Center coords for each dot
  const points = data.map((v, i) => {
    const cx =
      data.length === 1
        ? PAD_X + plotW / 2
        : PAD_X + (i / (data.length - 1)) * plotW;

    const cy = PAD_TOP + ((yMax - clamp(v)) / yMax) * plotH;
    return { cx, cy };
  });

  // Build segments using midpoint so rotation (center pivot) is correct
  const segments = points.slice(0, -1).map((p, i) => {
    const n = points[i + 1];

    const dx = n.cx - p.cx;
    const dy = n.cy - p.cy;

    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const midX = (p.cx + n.cx) / 2;
    const midY = (p.cy + n.cy) / 2;

    return { midX, midY, length, angle };
  });

  const yTicks = [0, 32, 65, 97, 130];

  return (
    <View style={styles.lineChartOuter}>
      {/* Y-axis labels */}
      <View style={styles.yAxis}>
        {yTicks
          .slice()
          .reverse()
          .map((t) => (
            <Text key={t} style={styles.yAxisLabel}>
              {t}
            </Text>
          ))}
      </View>

      {/* Chart box */}
      <View
        style={styles.lineChartBox}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        {/* Grid lines */}
        {yTicks.map((t) => {
          const y = PAD_TOP + ((yMax - t) / yMax) * plotH;
          return (
            <View key={`grid_${t}`} style={[styles.gridLine, { top: y }]} />
          );
        })}

        {/* Line segments (centered on midpoints) */}
        {segments.map((s, i) => (
          <View
            key={`seg_${i}`}
            style={[
              styles.lineSeg,
              {
                left: s.midX - s.length / 2,
                top: s.midY - 1, // center 2px line on dot center
                width: s.length,
                transform: [{ rotateZ: `${s.angle}rad` }],
              },
            ]}
          />
        ))}

        {/* Dots */}
        {points.map((p, i) => (
          <View
            key={`dot_${i}`}
            style={[
              styles.dot,
              {
                left: p.cx - 6,
                top: p.cy - 6,
              },
            ]}
          />
        ))}

        {/* X-axis labels */}
        <View style={[styles.xLabelsRow, { paddingHorizontal: PAD_X }]}>
          {labels.map((lab, i) => (
            <Text key={`x_${i}`} style={styles.xLabel}>
              {lab}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

/* ────────────────────────────────────────────── */
/* Profile Screen                                 */
/* ────────────────────────────────────────────── */
export default function Profile() {
  const name = "Andrew Carnegie";
  const { receipts } = useFridge();

  const receiptList = useMemo(() => {
    return Object.values(receipts).sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [receipts]);

  const analyticsData = HARDCODED_WEEKLY_ANALYTICS;
  const totals = analyticsData.map((w) => w.total);
  const labels = analyticsData.map((w) => w.week);

  const thisWeek = analyticsData.at(-1)!.total;
  const lastWeek = analyticsData.at(-2)!.total;
  const deltaPct = ((thisWeek - lastWeek) / lastWeek) * 100;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 120 }, // 👈 space for tab bar
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#3D8D15", "#74AF36"]}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 0.57, y: 1 }}
          style={styles.headerGradient}
        />

        <View style={styles.card}>
          <View style={styles.avatarWrap}>
            <Image
              source={require("../../assets/images/profilepic.png")}
              style={styles.avatar}
            />
          </View>

          <Text style={styles.name}>{name}</Text>

          <View style={styles.dashedDivider} />

          <Text style={styles.sectionHeader}>Analytics</Text>
          <View style={styles.innerCard}>
            <View style={styles.compareRow}>
              <View style={styles.compareBox}>
                <Text style={styles.compareLabel}>This week</Text>
                <Text style={styles.compareValue}>${thisWeek.toFixed(2)}</Text>
              </View>
              <View style={styles.compareBox}>
                <Text style={styles.compareLabel}>Last week</Text>
                <Text style={styles.compareValue}>${lastWeek.toFixed(2)}</Text>
              </View>
              <View style={styles.compareBox}>
                <Text style={styles.compareLabel}>Change</Text>
                <Text style={styles.compareValue}>
                  {deltaPct >= 0 ? "+" : ""}
                  {deltaPct.toFixed(0)}%
                </Text>
              </View>
            </View>

            <WeeklyLineChart data={totals} labels={labels} yMax={130} />
          </View>

          {/* Weekly totals breakdown */}
          <View style={styles.weeklyBreakdown}>
            {analyticsData.map((w, i) => (
              <View
                key={w.date}
                style={[styles.weekRow, i === 0 && { borderTopWidth: 0 }]}
              >
                <Text style={styles.weekDate}>{w.week}/2026</Text>
                <Text style={styles.weekAmount}>${w.total.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionHeader, { marginTop: 18 }]}>
            Past Receipts
          </Text>

          <View style={styles.innerCard}>
            {receiptList.length === 0 ? (
              <Text style={styles.muted}>
                No receipt images yet — scan from the Camera tab.
              </Text>
            ) : (
              receiptList.map((r) => (
                <View key={r.id} style={styles.receiptBlock}>
                  {/* Date only (each image has its own total underneath) */}
                  <View style={styles.receiptHeaderRow}>
                    <Text style={styles.receiptDate}>{r.date}</Text>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.receiptsRow}
                  >
                    {r.receiptImages.map(
                      (img: { uri: string; totalCost: number }, idx: number) => (
                        <View
                          key={`${r.id}_${idx}`}
                          style={styles.receiptThumbWrap}
                        >
                          <Image
                            source={{ uri: img.uri }}
                            style={styles.receiptThumb}
                          />
                          <Text style={styles.receiptThumbTotal}>
                            ${img.totalCost.toFixed(2)}
                          </Text>
                        </View>
                      )
                    )}
                  </ScrollView>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ────────────────────────────────────────────── */
/* Styles                                         */
/* ────────────────────────────────────────────── */
const CARD_BORDER = "#E5E7EB";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingBottom: 28 },

  headerGradient: { height: 180, width: "100%" },

  card: {
    width: "100%",
    backgroundColor: "#FCFEEF",
    borderTopWidth: 1,
    borderColor: CARD_BORDER,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 22,
    alignItems: "center",
    marginTop: -18,
  },

  // Weekly totals breakdown
  weeklyBreakdown: {
    width: "100%",
    marginTop: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: CARD_BORDER,
  },

  weekDate: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "700",
  },

  weekAmount: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "800",
  },

  avatarWrap: {
    position: "absolute",
    top: -75,
    width: 125,
    height: 125,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: CARD_BORDER,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 4 },
    }),
  },

  avatar: { width: "100%", height: "100%" },

  name: {
    paddingVertical: 5,
    fontSize: 32,
    fontFamily: "Offbit-DotBold",
    color: "#285B23",
    textAlign: "center",
    letterSpacing: 0.6,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  dashedDivider: {
    width: "100%",
    marginTop: 16,
    marginBottom: 14,
    borderTopWidth: 2,
    borderStyle: "dashed",
    borderColor: "#9CA3AF",
  },

  sectionHeader: {
    width: "100%",
    fontSize: 25,
    fontFamily: "Offbit-DotBold",
    color: "#285B23",
    marginBottom: 10,
    paddingVertical: 10,
  },

  innerCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 18,
    padding: 14,
  },

  compareRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  compareBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#F9FAFB",
  },
  compareLabel: { fontSize: 11, color: "#6B7280" },
  compareValue: { fontSize: 14, fontWeight: "800", color: "#111827" },

  lineChartOuter: { width: "100%", flexDirection: "row", marginTop: 10 },
  yAxis: {
    width: 34,
    height: 160,
    justifyContent: "space-between",
    paddingVertical: 14,
    marginRight: 8,
  },
  yAxisLabel: { fontSize: 10, color: "#6B7280", textAlign: "right" },

  lineChartBox: {
    flex: 1,
    height: 160,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    position: "relative",
    overflow: "hidden",
  },

  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  lineSeg: {
    position: "absolute",
    height: 2,
    backgroundColor: "#74AF36",
    borderRadius: 1,
  },

  dot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#74AF36",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  xLabelsRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  xLabel: { fontSize: 10, color: "#6B7280" },

  muted: { color: "#6B7280", fontSize: 14 },

  receiptBlock: { marginTop: 12 },
  receiptHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  receiptDate: { color: "#111827", fontSize: 14, fontWeight: "700" },
  receiptTotal: { color: "#111827", fontSize: 14, fontWeight: "700" },

  receiptsRow: { gap: 12 },

  receiptThumbWrap: { width: 140 },
  receiptThumbTotal: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
  },

  receiptThumb: {
    width: 140,
    height: 190,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: "#F3F4F6",
  },
});