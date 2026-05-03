// src/app/(dashboard)/dashboard/reports/page.tsx
"use client";

import { useState } from "react";
import {
  Grid,
  Card,
  Text,
  Box,
  Group,
  Button,
  Badge,
  Paper,
  Stack,
  Table,
  Tabs,
  ThemeIcon,
  Select,
  ActionIcon,
} from "@mantine/core";
import { AreaChart, BarChart } from "@mantine/charts";
import {
  MdBarChart,
  MdDownload,
  MdWaterDrop,
  MdThermostat,
  MdHistory,
  MdCalendarToday,
  MdPrint,
} from "react-icons/md";
import { PageHeader, StatCard } from "@/components/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import classes from "./reports.module.css";

// ── Mock data

const MOISTURE_DATA = [
  { time: "00:00", zoneA: 72, zoneB: 55 },
  { time: "02:00", zoneA: 68, zoneB: 50 },
  { time: "04:00", zoneA: 62, zoneB: 44 },
  { time: "06:00", zoneA: 58, zoneB: 38 },
  { time: "06:30", zoneA: 80, zoneB: 72 }, // irrigation
  { time: "08:00", zoneA: 78, zoneB: 70 },
  { time: "10:00", zoneA: 74, zoneB: 65 },
  { time: "12:00", zoneA: 68, zoneB: 58 },
  { time: "14:00", zoneA: 61, zoneB: 51 },
  { time: "16:00", zoneA: 55, zoneB: 44 },
  { time: "17:00", zoneA: 74, zoneB: 68 }, // irrigation
  { time: "20:00", zoneA: 70, zoneB: 63 },
  { time: "23:00", zoneA: 66, zoneB: 58 },
];

const WATER_USAGE_WEEK = [
  { day: "Mon", usage: 210 },
  { day: "Tue", usage: 185 },
  { day: "Wed", usage: 240 },
  { day: "Thu", usage: 195 },
  { day: "Fri", usage: 220 },
  { day: "Sat", usage: 175 },
  { day: "Sun", usage: 245 },
];

const HISTORY_ROWS = [
  {
    id: "1",
    date: "2025-01-15",
    zone: "A",
    start: "06:30 AM",
    duration: 20,
    water: 45,
    by: "schedule",
  },
  {
    id: "2",
    date: "2025-01-15",
    zone: "B",
    start: "06:50 AM",
    duration: 15,
    water: 32,
    by: "schedule",
  },
  {
    id: "3",
    date: "2025-01-15",
    zone: "A",
    start: "05:15 PM",
    duration: 20,
    water: 46,
    by: "automation",
  },
  {
    id: "4",
    date: "2025-01-14",
    zone: "C",
    start: "06:30 AM",
    duration: 30,
    water: 68,
    by: "schedule",
  },
  {
    id: "5",
    date: "2025-01-14",
    zone: "A",
    start: "10:12 AM",
    duration: 10,
    water: 22,
    by: "manual",
  },
  {
    id: "6",
    date: "2025-01-13",
    zone: "B",
    start: "06:45 AM",
    duration: 15,
    water: 33,
    by: "automation",
  },
];

const TRIGGER_COLORS: Record<string, { bg: string; color: string }> = {
  schedule: { bg: "#E6F4D9", color: "#2B601E" },
  automation: { bg: "#eff6ff", color: "#2563eb" },
  manual: { bg: "#fef9ee", color: "#d97706" },
};

export default function ReportsPage() {
  useRequireAuth();
  const [filterZone, setFilterZone] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      // Simple CSV export
      const csv = [
        "Date,Zone,Start Time,Duration (min),Water Used (L),Triggered By",
        ...HISTORY_ROWS.map(
          (r) =>
            `${r.date},${r.zone},${r.start},${r.duration},${r.water},${r.by}`,
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `irrigation-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 800);
  };

  const filtered = filterZone
    ? HISTORY_ROWS.filter((r) => r.zone === filterZone)
    : HISTORY_ROWS;
  const totalToday = HISTORY_ROWS.filter((r) => r.date === "2025-01-15").reduce(
    (s, r) => s + r.water,
    0,
  );
  const totalWeek = WATER_USAGE_WEEK.reduce((s, r) => s + r.usage, 0);
  const avgMoisture = Math.round(
    MOISTURE_DATA.reduce((s, r) => s + r.zoneA, 0) / MOISTURE_DATA.length,
  );
  const avgTemp = 26.5;

  return (
    <Box>
      <PageHeader
        title="Reports"
        breadcrumb="Analytics"
        subtitle="Water usage, soil trends, and irrigation history"
        actions={
          <Group gap="sm">
            <ActionIcon
              variant="light"
              color="brand"
              size="lg"
              onClick={() => window.print()}
            >
              <MdPrint size={18} />
            </ActionIcon>
            <Button
              leftSection={<MdDownload size={16} />}
              color="brand"
              style={{ backgroundColor: "#46A908" }}
              onClick={handleExport}
              loading={exporting}
              size="sm"
            >
              Export Report
            </Button>
          </Group>
        }
      />

      <Box p="xl">
        {/* Summary cards */}
        <Grid gutter="md" mb="xl">
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <StatCard
              label="Water Used Today"
              value={totalToday}
              unit="L"
              //icon={<MdWaterDrop size={20} />}
              accentColor="#46A908"
              iconColor="#46A908"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <StatCard
              label="Water Used This Week"
              value={totalWeek}
              unit="L"
              //icon={<MdWaterDrop size={20} />}
              accentColor="#2B601E"
              iconColor="#2B601E"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <StatCard
              label="Avg Soil Moisture"
              value={avgMoisture}
              unit="%"
              //icon={<MdBarChart size={20} />}
              accentColor="#725438"
              iconColor="#725438"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <StatCard
              label="Avg Temperature"
              value={avgTemp}
              unit="°C"
              //icon={<MdThermostat size={20} />}
              accentColor="#f97316"
              iconColor="#f97316"
            />
          </Grid.Col>
        </Grid>

        <Tabs defaultValue="moisture" color="brand">
          <Tabs.List
            mb="xl"
            className={classes.tabList}
            ff="var(--font-nunito), sans-serif"
          >
            <Tabs.Tab value="moisture" leftSection={<MdWaterDrop size={14} />}>
              Soil Moisture Trend
            </Tabs.Tab>
            <Tabs.Tab value="usage" leftSection={<MdBarChart size={14} />}>
              Water Usage
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<MdHistory size={14} />}>
              Irrigation History
            </Tabs.Tab>
          </Tabs.List>

          {/* ─ Soil Moisture Tab ─ */}
          <Tabs.Panel value="moisture">
            <Card withBorder radius="md" p="xl" mb="xl">
              <Group justify="space-between" mb="xl">
                <Box>
                  <Text
                    fw={700}
                    fz="md"
                    c="#1E2B18"
                    style={{ letterSpacing: "-0.2px" }}
                  >
                    Soil Moisture Over Time
                  </Text>
                  <Text fz="xs" c="dimmed">
                    Today - both zones compared
                  </Text>
                </Box>
                <Group gap="md">
                  <Group gap="xs">
                    <Box
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        backgroundColor: "#46A908",
                      }}
                    />
                    <Text fz="xs" c="dimmed">
                      Zone A
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <Box
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        backgroundColor: "#A88D66",
                      }}
                    />
                    <Text fz="xs" c="dimmed">
                      Zone B
                    </Text>
                  </Group>
                </Group>
              </Group>
              <AreaChart
                h={280}
                data={MOISTURE_DATA}
                dataKey="time"
                series={[
                  { name: "zoneA", color: "#46A908", label: "Zone A" },
                  { name: "zoneB", color: "#A88D66", label: "Zone B" },
                ]}
                curveType="natural"
                gridAxis="y"
                tickLine="none"
                fillOpacity={0.15}
                withDots={false}
                yAxisProps={{ domain: [0, 100] }}
                ff="var(--font-nunito), sans-serif"
              />
            </Card>

            <Paper
              withBorder
              radius="md"
              p="md"
              style={{ backgroundColor: "#F5F8F2", borderColor: "#E3EDD9" }}
            >
              <Group gap="sm">
                <MdCalendarToday size={16} color="#46A908" />
                <Text fz="sm" c="dimmed">
                  Peaks at 06:30 and 17:00 correspond to scheduled irrigation
                  cycles. Zone A maintains higher moisture due to clay-rich soil
                  composition.
                </Text>
              </Group>
            </Paper>
          </Tabs.Panel>

          {/* ─ Water Usage Tab ─ */}
          <Tabs.Panel value="usage">
            <Card withBorder radius="md" p="xl" mb="xl">
              <Group justify="space-between" mb="xl">
                <Box>
                  <Text fw={700} fz="md" c="#1E2B18">
                    Weekly Water Usage
                  </Text>
                  <Text fz="xs" c="dimmed">
                    Total litres consumed per day this week
                  </Text>
                </Box>
                <Badge
                  style={{
                    backgroundColor: "#E6F4D9",
                    color: "#2B601E",
                    fontWeight: 700,
                  }}
                >
                  {totalWeek} L total
                </Badge>
              </Group>
              <BarChart
                h={280}
                data={WATER_USAGE_WEEK}
                dataKey="day"
                series={[
                  { name: "usage", color: "#46A908", label: "Water Used (L)" },
                ]}
                tickLine="none"
                gridAxis="y"
                barProps={{ radius: 4 }}
                ff="var(--font-nunito), sans-serif"
              />
            </Card>

            <Grid gutter="md">
              {[
                {
                  label: "Average Daily Usage",
                  value: `${Math.round(totalWeek / 7)} L`,
                },
                { label: "Highest Day", value: "245 L (Sun)" },
                { label: "Lowest Day", value: "175 L (Sat)" },
                { label: "Weekly Total", value: `${totalWeek} L` },
              ].map((stat) => (
                <Grid.Col key={stat.label} span={{ base: 6, md: 3 }}>
                  <Paper withBorder radius="md" p="md" ta="center">
                    <Text
                      fz="xs"
                      c="dimmed"
                      mb={4}
                      style={{
                        textTransform: "uppercase",
                        letterSpacing: "0.7px",
                      }}
                    >
                      {stat.label}
                    </Text>
                    <Text fw={800} fz="xl" c="#1E2B18">
                      {stat.value}
                    </Text>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          </Tabs.Panel>

          {/* ─ History Tab ─ */}
          <Tabs.Panel value="history">
            <Card withBorder radius="md" p="xl">
              <Group justify="space-between" mb="xl" wrap="wrap" gap="sm">
                <Box>
                  <Text fw={700} fz="md" c="#1E2B18">
                    Irrigation History
                  </Text>
                  <Text fz="xs" c="dimmed">
                    Past 7 days of irrigation sessions
                  </Text>
                </Box>
                <Select
                  placeholder="Filter by Zone"
                  data={["A", "B", "C"]}
                  value={filterZone}
                  onChange={setFilterZone}
                  clearable
                  size="sm"
                  w={160}
                />
              </Group>

              <Box className={classes.tableWrap}>
                <Table
                  striped
                  highlightOnHover
                  withColumnBorders={false}
                  verticalSpacing="sm"
                  className={classes.table}
                >
                  <Table.Thead>
                    <Table.Tr>
                      {[
                        "Date",
                        "Zone",
                        "Start Time",
                        "Duration",
                        "Water Used",
                        "Triggered By",
                      ].map((h) => (
                        <Table.Th
                          key={h}
                          style={{
                            color: "#6b7280",
                            fontWeight: 600,
                            fontSize: 12,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                          ff="var(--font-nunito), sans-serif"
                        >
                          {h}
                        </Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filtered.map((row) => {
                      const tc = TRIGGER_COLORS[row.by];
                      return (
                        <Table.Tr key={row.id} className={classes.tableRow}>
                          <Table.Td>
                            <Text fz="sm" c="#1E2B18">
                              {row.date}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              style={{
                                backgroundColor: "#E6F4D9",
                                color: "#2B601E",
                                fontWeight: 700,
                              }}
                            >
                              Zone {row.zone}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm" fw={500} c="#1E2B18">
                              {row.start}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm" c="#1E2B18">
                              {row.duration} min
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="sm" fw={600} c="#2B601E">
                              {row.water} L
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              size="sm"
                              style={{
                                backgroundColor: tc.bg,
                                color: tc.color,
                                fontWeight: 600,
                              }}
                            >
                              {row.by}
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Box>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Box>
  );
}
