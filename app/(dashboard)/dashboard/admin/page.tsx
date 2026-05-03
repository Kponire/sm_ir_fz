// src/app/(dashboard)/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  Text,
  Box,
  Group,
  Badge,
  Paper,
  Table,
  ThemeIcon,
  Stack,
  Divider,
} from "@mantine/core";
import {
  MdPeople,
  MdDevices,
  MdWifi,
  MdWifiOff,
  MdWaterDrop,
  MdPersonAdd,
  MdPowerSettingsNew,
  MdPlayArrow,
  MdArticle,
} from "react-icons/md";
import { PageHeader, StatCard, StatusBadge } from "@/components/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import classes from "./admin.module.css";

interface Stats {
  totalUsers: number;
  totalDevices: number;
  devicesOnline: number;
  devicesOffline: number;
  irrigationToday: number;
}

interface ActivityItem {
  id: string;
  type:
    | "user_registered"
    | "device_connected"
    | "device_disconnected"
    | "irrigation_started";
  description: string;
  meta: string;
  time: string;
}

const MOCK_STATS: Stats = {
  totalUsers: 14,
  totalDevices: 11,
  devicesOnline: 8,
  devicesOffline: 3,
  irrigationToday: 22,
};

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    type: "user_registered",
    description: "New user registered",
    meta: "Emeka Okafor · emeka@farm.ng",
    time: "2 min ago",
  },
  {
    id: "2",
    type: "device_connected",
    description: "Device came online",
    meta: "ESP-B2EF-5678 · Green Field Farm",
    time: "11 min ago",
  },
  {
    id: "3",
    type: "irrigation_started",
    description: "Irrigation session started",
    meta: "Zone A · Sunshine Farms",
    time: "28 min ago",
  },
  {
    id: "4",
    type: "device_disconnected",
    description: "Device went offline",
    meta: "ESP-C3AB-9012 · River Bend Farm",
    time: "1 hr ago",
  },
  {
    id: "5",
    type: "user_registered",
    description: "New user registered",
    meta: "Amina Bello · amina@agri.ng",
    time: "3 hrs ago",
  },
  {
    id: "6",
    type: "irrigation_started",
    description: "Irrigation session started",
    meta: "Zone B · Valley Farm",
    time: "4 hrs ago",
  },
];

const RECENT_DEVICES = [
  {
    id: "ESP-A4CF-1234",
    user: "John Doe",
    farm: "Green Valley Farm",
    status: "online" as const,
    lastSeen: "30s ago",
    firmware: "v2.3.1",
  },
  {
    id: "ESP-B2EF-5678",
    user: "Jane Smith",
    farm: "Sunrise Farm",
    status: "online" as const,
    lastSeen: "2 min ago",
    firmware: "v2.3.1",
  },
  {
    id: "ESP-C3AB-9012",
    user: "Emeka Okafor",
    farm: "River Bend",
    status: "offline" as const,
    lastSeen: "1 hr ago",
    firmware: "v2.2.0",
  },
  {
    id: "ESP-D5CD-3456",
    user: "Amina Bello",
    farm: "North Field",
    status: "online" as const,
    lastSeen: "45s ago",
    firmware: "v2.3.1",
  },
];

const ACTIVITY_CONFIG: Record<
  ActivityItem["type"],
  { icon: React.ReactNode; color: string; bg: string }
> = {
  user_registered: {
    icon: <MdPersonAdd size={16} />,
    color: "#2563eb",
    bg: "#eff6ff",
  },
  device_connected: {
    icon: <MdPowerSettingsNew size={16} />,
    color: "#46A908",
    bg: "#E6F4D9",
  },
  device_disconnected: {
    icon: <MdWifiOff size={16} />,
    color: "#dc2626",
    bg: "#fef2f2",
  },
  irrigation_started: {
    icon: <MdPlayArrow size={16} />,
    color: "#2B601E",
    bg: "#E6F4D9",
  },
};

export default function AdminDashboardPage() {
  useRequireAuth("admin");
  const [stats, setStats] = useState<Stats>(MOCK_STATS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          if (data.data) setStats(data.data);
        }
      } catch {
        /* use mock */
      }
    };
    fetchStats();
  }, []);

  return (
    <Box>
      <PageHeader
        title="Admin Dashboard"
        breadcrumb="Overview"
        subtitle={`System overview · ${new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
      />

      <Box p="xl">
        {/* KPI cards */}
        <Grid gutter="md" mb="xl">
          <Grid.Col span={{ base: 12, xs: 6, md: 4 }}>
            <StatCard
              label="Total Users"
              value={stats.totalUsers}
              icon={<MdPeople size={22} />}
              accentColor="#46A908"
              iconColor="#46A908"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 6, md: 4 }}>
            <StatCard
              label="Total Devices"
              value={stats.totalDevices}
              icon={<MdDevices size={22} />}
              accentColor="#725438"
              iconColor="#725438"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 6, md: 4 }}>
            <StatCard
              label="Irrigation Sessions Today"
              value={stats.irrigationToday}
              icon={<MdWaterDrop size={22} />}
              accentColor="#2B601E"
              iconColor="#2B601E"
            />
          </Grid.Col>
        </Grid>

        {/* Device Online/Offline */}
        <Grid gutter="md" mb="xl">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Paper
              withBorder
              radius="md"
              p="xl"
              style={{
                borderLeft: "4px solid #46A908",
                backgroundColor: "#ffffff",
              }}
              className="card-hover"
            >
              <Group justify="space-between" align="center">
                <Box>
                  <Text
                    fz="xs"
                    fw={700}
                    c="dimmed"
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    }}
                    mb={8}
                  >
                    Devices Online
                  </Text>
                  <Text
                    fw={900}
                    fz={40}
                    c="#1E2B18"
                    style={{ letterSpacing: "-2px", lineHeight: 1 }}
                  >
                    {stats.devicesOnline}
                  </Text>
                </Box>
                <ThemeIcon
                  size={56}
                  radius="md"
                  style={{ backgroundColor: "#E6F4D9" }}
                >
                  <MdWifi size={28} color="#46A908" />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Paper
              withBorder
              radius="md"
              p="xl"
              style={{
                borderLeft: "4px solid #dc2626",
                backgroundColor: "#ffffff",
              }}
              className="card-hover"
            >
              <Group justify="space-between" align="center">
                <Box>
                  <Text
                    fz="xs"
                    fw={700}
                    c="dimmed"
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    }}
                    mb={8}
                  >
                    Devices Offline
                  </Text>
                  <Text
                    fw={900}
                    fz={40}
                    c="#1E2B18"
                    style={{ letterSpacing: "-2px", lineHeight: 1 }}
                  >
                    {stats.devicesOffline}
                  </Text>
                </Box>
                <ThemeIcon
                  size={56}
                  radius="md"
                  style={{ backgroundColor: "#fef2f2" }}
                >
                  <MdWifiOff size={28} color="#dc2626" />
                </ThemeIcon>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        <Grid gutter="xl">
          {/* Recent Activity */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Card withBorder radius="md" p="xl" h="100%">
              <Group gap="sm" mb="lg">
                <ThemeIcon
                  size={36}
                  radius="md"
                  style={{ backgroundColor: "#E6F4D9" }}
                >
                  <MdArticle size={18} color="#2B601E" />
                </ThemeIcon>
                <Box>
                  <Text fw={700} fz="sm" c="#1E2B18">
                    Recent Activity
                  </Text>
                  <Text fz="xs" c="dimmed">
                    Latest system events
                  </Text>
                </Box>
              </Group>
              <Stack gap={0}>
                {MOCK_ACTIVITY.map((item, i) => {
                  const cfg = ACTIVITY_CONFIG[item.type];
                  return (
                    <Group
                      key={item.id}
                      gap="md"
                      py={12}
                      align="flex-start"
                      style={{
                        borderBottom:
                          i < MOCK_ACTIVITY.length - 1
                            ? "1px solid #F0F4EC"
                            : "none",
                      }}
                    >
                      <ThemeIcon
                        size={32}
                        radius="xl"
                        style={{
                          backgroundColor: cfg.bg,
                          color: cfg.color,
                          flexShrink: 0,
                        }}
                      >
                        {cfg.icon}
                      </ThemeIcon>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text fz="sm" fw={600} c="#1E2B18">
                          {item.description}
                        </Text>
                        <Text fz="xs" c="dimmed" truncate>
                          {item.meta}
                        </Text>
                      </Box>
                      <Text fz="xs" c="dimmed" style={{ flexShrink: 0 }}>
                        {item.time}
                      </Text>
                    </Group>
                  );
                })}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Device Status Table */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Card withBorder radius="md" p="xl">
              <Group gap="sm" mb="lg">
                <ThemeIcon
                  size={36}
                  radius="md"
                  style={{ backgroundColor: "#E6F4D9" }}
                >
                  <MdDevices size={18} color="#2B601E" />
                </ThemeIcon>
                <Box>
                  <Text fw={700} fz="sm" c="#1E2B18">
                    Device Status
                  </Text>
                  <Text fz="xs" c="dimmed">
                    Real-time device health
                  </Text>
                </Box>
              </Group>
              <Box style={{ overflowX: "auto" }}>
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      {[
                        "Device ID",
                        "User / Farm",
                        "Status",
                        "Last Seen",
                        "Firmware",
                      ].map((h) => (
                        <Table.Th
                          key={h}
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.4px",
                          }}
                        >
                          {h}
                        </Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {RECENT_DEVICES.map((d) => (
                      <Table.Tr key={d.id} className={classes.tableRow}>
                        <Table.Td>
                          <Text
                            fz="sm"
                            fw={600}
                            c="#1E2B18"
                            style={{ fontFamily: "monospace" }}
                          >
                            {d.id}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text fz="sm" c="#1E2B18">
                            {d.user}
                          </Text>
                          <Text fz="xs" c="dimmed">
                            {d.farm}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <StatusBadge status={d.status} size="xs" />
                        </Table.Td>
                        <Table.Td>
                          <Text fz="xs" c="dimmed">
                            {d.lastSeen}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge size="xs" variant="outline" color="gray">
                            {d.firmware}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Box>
            </Card>
          </Grid.Col>
        </Grid>
      </Box>
    </Box>
  );
}
