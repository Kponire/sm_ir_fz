// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Grid,
  Card,
  Button,
  Text,
  Box,
  Group,
  Badge,
  Stack,
  Alert,
  ActionIcon,
  Tooltip,
  Divider,
  Paper,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  MdWaterDrop,
  MdThermostat,
  MdAir,
  MdOpacity,
  MdPower,
  MdRefresh,
  MdPlayArrow,
  MdStop,
  MdSchedule,
  MdSignalWifi4Bar,
} from "react-icons/md";
import { FaWaterLadder } from "react-icons/fa6";
import { BsMoisture } from "react-icons/bs";
import { FaArrowUpFromWaterPump } from "react-icons/fa6";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, StatCard, StatusBadge } from "@/components/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import classes from "./dashboard.module.css";
import { useSensorStore } from "@/store/useSensorStore";

export default function UserDashboardPage() {
  const { user } = useRequireAuth();
  //const [sensorData, setSensorData] = useState<SensorData>(MOCK);

  const setData = useSensorStore((s) => s.setData);
  const { data: sensorData, isOnline } = useSensorStore();
  console.log("Data: ", sensorData);
  const [loading, setLoading] = useState(false);
  const [cmdLoading, setCmdLoading] = useState<"start" | "stop" | null>(null);
  const [cmdLoading_1, setCmdLoading_1] = useState(false);

  const firstName = user?.name?.split(" ")[0] ?? "Farmer";

  /* const fetchSensors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sensors/reading?latest=1");
      if (res.ok) {
        const json = await res.json();
        if (json.data) setSensorData(json.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []); */

  /*useEffect(() => {
    fetchSensors();
    const interval = setInterval(fetchSensors, 30_000);
    return () => clearInterval(interval);
  }, [fetchSensors]);*/

  const sendCommand = async (cmd: "start" | "stop") => {
    setCmdLoading(cmd);

    try {
      await fetch("/api/mqtt/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: "farm/commands",
          payload: {
            deviceId: "69ae542d003bd0c6cffd", // Match your ESP32 DEVICE_ID
            type: "irrigation",               // REQUIRED by your ESP32 callback
            command: cmd,                     // "start" or "stop"
            duration: 15,                     // Default duration in minutes
            zones: {                          // Structure expected by your ESP32
              A: true,
              B: true,
              C: false,
            },
          },
        }),
      });

      notifications.show({
        title: cmd === "start" ? "Irrigation Started" : "Irrigation Stopped",
        message: `Command sent successfully`,
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "Command failed",
        color: "red",
      });
    } finally {
      setCmdLoading(null);
    }
  };

  const sendCommand_1 = async (type: "irrigation" | "fertigation", cmd: "start" | "stop", duration: number = 15) => {
  //const loadingKey = `${type}-${cmd}`;
  const loadingKey = `${cmd}`;
  setCmdLoading_1(true);

  try {
    const res = await fetch("/api/mqtt/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: "farm/commands",
        payload: {
          deviceId: "farm_node_001",
          type: type,        // Fixes the ESP32 null pointer crash
          command: cmd,       // "start" or "stop"
          duration: duration, // Duration in minutes
          zones: { A: true, B: true, C: false } // Optional: zones structure
        },
      }),
    });

    if (!res.ok) throw new Error("Publish failed");

    notifications.show({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${cmd === "start" ? "Started" : "Stopped"}`,
      message: `Command sent successfully${cmd === "start" ? ` for ${duration} mins` : ""}`,
      color: "green",
    });
  } catch (error) {
    notifications.show({
      title: "Error",
      message: `Failed to send ${type} command`,
      color: "red",
    });
  } finally {
    setCmdLoading_1(false);
  }
};

  if (!sensorData)
    return (
      <>
        <PageHeader
          title="Dashboard"
          breadcrumb="Overview"
          subtitle={`Welcome back, ${firstName}. Here's your farm at a glance.`}
          actions={
            <Tooltip label="Refresh data">
              <ActionIcon
                variant="light"
                color="brand"
                size="lg"
                //onClick={fetchSensors}
                loading={loading}
              >
                <MdRefresh size={18} />
              </ActionIcon>
            </Tooltip>
          }
        />
        <Text style={{ padding: "20px 28px" }}>Connecting to device...</Text>;
      </>
    );

  const soilOk = sensorData.soilMoisture1 > 40;
  const tankOk = sensorData.tankLevel > 25;

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        breadcrumb="Overview"
        subtitle={`Welcome back, ${firstName}. Here's your farm at a glance.`}
        actions={
          <Tooltip label="Refresh data">
            <ActionIcon
              variant="light"
              color="brand"
              size="lg"
              //onClick={fetchSensors}
              loading={loading}
            >
              <MdRefresh size={18} />
            </ActionIcon>
          </Tooltip>
        }
      />

      <Box p="xl" className={classes.content}>
        {/* Welcome Banner */}
        <Paper
          withBorder
          radius="md"
          p="lg"
          mb="xl"
          className={classes.welcomeBanner}
        >
          <Group justify="space-between" wrap="wrap" gap="md">
            <Box>
              <Group gap="sm" mb={6}>
                <Text
                  fw={800}
                  fz="xl"
                  c="#1E2B18"
                  style={{ letterSpacing: "-0.3px" }}
                >
                  Welcome, {firstName}
                </Text>
              </Group>
              <Text fz="sm" c="dimmed">
                Farm · Device {isOnline ? "online" : "offline"} · Auto-updates
                every 30s
              </Text>
            </Box>
            <Group gap="md">
              <Box ta="center">
                <Text fz="xs" fw={600} c="dimmed" mb={2}>
                  LAST UPDATED
                </Text>
                <Text fz="sm" fw={600} c="#1E2B18">
                  {new Date(sensorData.updatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Box>
              <Box ta="center">
                <Text fz="xs" fw={600} c="dimmed" mb={2}>
                  PUMP STATUS
                </Text>
                <Badge
                  size="sm"
                  style={{
                    backgroundColor: sensorData.pumpOn ? "#E6F4D9" : "#f3f4f6",
                    color: sensorData.pumpOn ? "#2B601E" : "#6b7280",
                    fontWeight: 700,
                  }}
                >
                  {sensorData.pumpOn ? "Running" : "◼ Idle"}
                </Badge>
              </Box>
            </Group>
          </Group>
        </Paper>

        {/*  Alerts ── */}
        {!soilOk && (
          <Alert
            withCloseButton
            color="orange"
            radius="xs"
            mb="lg"
            title="Low Soil Moisture"
            variant="filled"
            styles={{
              message: { color: "black" },
            }}
          >
            Zone B soil moisture is below threshold (42%). Consider starting
            irrigation.
          </Alert>
        )}
        {!tankOk && (
          <Alert
            withCloseButton
            color="red"
            radius="xs"
            mb="lg"
            title="Low Water Tank"
            variant="filled"
            styles={{
              message: { color: "black" },
            }}
          >
            Water tank level is critically low. Refill required.
          </Alert>
        )}

        {/* ── Status Cards ── */}
        <Grid gutter="md" mb="xl">
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <StatCard
              label="Soil Moisture"
              value={sensorData.soilMoisture1}
              unit="%"
              icon={<BsMoisture size={22} />}
              accentColor={soilOk ? "#46A908" : "#d97706"}
              iconColor={soilOk ? "#46A908" : "#d97706"}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <StatCard
              label="Temperature"
              value={sensorData.temperature}
              unit="°C"
              icon={<MdThermostat size={22} />}
              accentColor="#f97316"
              iconColor="#f97316"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <StatCard
              label="Humidity"
              value={sensorData.humidity}
              unit="%"
              icon={<MdAir size={22} />}
              accentColor="#2563eb"
              iconColor="#2563eb"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <StatCard
              label="Water Tank"
              value={sensorData.tankLevel}
              unit="%"
              icon={<FaWaterLadder size={22} />}
              accentColor={tankOk ? "#46A908" : "#dc2626"}
              iconColor={tankOk ? "#46A908" : "#dc2626"}
            />
          </Grid.Col>
        </Grid>

        {/* ── Quick Actions + Summary ── */}
        <Grid gutter="md">
          {/* Quick Actions */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder radius="md" p="lg" h="100%">
              <Text
                fw={700}
                fz="sm"
                c="#1E2B18"
                mb="md"
                style={{ letterSpacing: "-0.1px" }}
              >
                Quick Actions
              </Text>
              <Stack gap="sm">
                <Button
                  size="md"
                  color="brand"
                  leftSection={<MdPlayArrow size={20} />}
                  onClick={() => sendCommand("start")}
                  loading={cmdLoading === "start"}
                  disabled={sensorData.pumpOn || !!cmdLoading}
                  fullWidth
                  style={{ backgroundColor: "#46A908", fontWeight: 600 }}
                >
                  Start Irrigation
                </Button>
                <Button
                  size="md"
                  color="red"
                  variant="light"
                  leftSection={<MdStop size={20} />}
                  onClick={() => sendCommand("stop")}
                  loading={cmdLoading === "stop"}
                  disabled={!sensorData.pumpOn || !!cmdLoading}
                  fullWidth
                >
                  Stop Irrigation
                </Button>
                <Button
                  size="md"
                  variant="light"
                  color="brand"
                  leftSection={<MdSchedule size={18} />}
                  component="a"
                  href="/dashboard/automation"
                  fullWidth
                >
                  Automation Settings
                </Button>
              </Stack>

              <Text fw={600} fz="xs" c="dimmed" mt="xs">FERTIGATION (NUTRIENTS)</Text>
              <Group grow gap="xs">
                <Button
                  size="md"
                  color="indigo"
                  variant="filled"
                  leftSection={<MdPlayArrow size={20} />}
                  onClick={() => sendCommand_1("fertigation", "start", 10)} // Default 10 mins for fertilizer
                  loading={cmdLoading_1}
                  disabled={sensorData.fertPump || cmdLoading_1}
                  style={{ fontWeight: 600 }}
                  fullWidth
                >
                  Start
                </Button>
                <Button
                  size="md"
                  color="indigo"
                  variant="light"
                  leftSection={<MdStop size={20} />}
                  onClick={() => sendCommand_1("fertigation", "stop")}
                  loading={cmdLoading_1}
                  disabled={!sensorData.fertPump || cmdLoading_1}
                  fullWidth
                >
                  Stop
                </Button>
              </Group>

              <Divider my="md" color="#E3EDD9" />

              <Box>
                <Text
                  fz="xs"
                  fw={600}
                  c="dimmed"
                  mb={10}
                  style={{ textTransform: "uppercase", letterSpacing: "0.7px" }}
                >
                  Today&apos;s Summary
                </Text>
                {[
                  {
                    label: "Water Used",
                    value: `${sensorData.waterUsedToday} L`,
                  },
                  { label: "Flow Rate", value: `${sensorData.flowRate} L/min` },
                  {
                    label: "Rain Detected",
                    value: sensorData.rainDetected ? "Yes" : "No",
                  },
                ].map((row) => (
                  <Group
                    key={row.label}
                    justify="space-between"
                    py={6}
                    style={{ borderBottom: "1px solid #F0F4EC" }}
                  >
                    <Text fz="sm" c="dimmed">
                      {row.label}
                    </Text>
                    <Text fz="sm" fw={600} c="#1E2B18">
                      {row.value}
                    </Text>
                  </Group>
                ))}
              </Box>
            </Card>
          </Grid.Col>

          {/* Pump status card */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder radius="md" p="lg" h="100%" ta="center">
              <Text fw={700} fz="sm" c="#1E2B18" mb="md">
                Irrigation Pump Status
              </Text>
              <Box
                className={`${classes.pumpCircle} ${sensorData.pumpOn ? classes.pumpOn : classes.pumpOff}`}
              >
                <FaArrowUpFromWaterPump size={70} />
                <Text fw={800} fz="lg" mt={8}>
                  {sensorData.pumpOn ? "ON" : "OFF"}
                </Text>
              </Box>
              <Text fz="sm" c="dimmed" mt="md">
                {sensorData.pumpOn
                  ? "Pump is actively irrigating"
                  : "Pump is idle, ready for command"}
              </Text>
              <Text fw={700} pt="20px" fz="sm" c="#1E2B18" mb="md">
                Fertigation Pump Status
              </Text>
              <Box
                className={`${classes.pumpCircle} ${sensorData.fertPump ? classes.pumpOn : classes.pumpOff}`}
              >
                <FaArrowUpFromWaterPump size={70} />
                <Text fw={800} fz="lg" mt={8}>
                  {sensorData.fertPump ? "ON" : "OFF"}
                </Text>
              </Box>
              <Text fz="sm" c="dimmed" mt="md">
                {sensorData.fertPump
                  ? "Pump is actively fertigating"
                  : "Pump is idle, ready for command"}
              </Text>
            </Card>
          </Grid.Col>

          {/* System info */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder radius="md" p="lg" h="100%">
              <Text fw={700} fz="sm" c="#1E2B18" mb="md">
                System Status
              </Text>
              <Stack gap="sm">
                {[
                  {
                    icon: <MdSignalWifi4Bar size={18} />,
                    label: "Connection",
                    value: isOnline ? "online" : "offline",
                    color: isOnline ? "#46A908" : "#dc2626",
                  },
                  {
                    icon: <MdOpacity size={18} />,
                    label: "Zone A Moisture",
                    value: `${sensorData.soilMoisture1}%`,
                    color:
                      sensorData.soilMoisture1 > 40 ? "#46A908" : "#d97706",
                  },
                  {
                    icon: <MdOpacity size={18} />,
                    label: "Zone B Moisture",
                    value: `${sensorData.soilMoisture2}%`,
                    color:
                      sensorData.soilMoisture2 > 40 ? "#46A908" : "#d97706",
                  },
                ].map((row) => (
                  <Group
                    key={row.label}
                    justify="space-between"
                    py={8}
                    style={{ borderBottom: "1px solid #F0F4EC" }}
                  >
                    <Group gap="xs">
                      <Box style={{ color: row.color }}>{row.icon}</Box>
                      <Text fz="sm" c="dimmed">
                        {row.label}
                      </Text>
                    </Group>
                    <Text fz="sm" fw={700} style={{ color: row.color }}>
                      {row.value}
                    </Text>
                  </Group>
                ))}
              </Stack>
              <Box
                mt="md"
                p="sm"
                style={{ backgroundColor: "#F5F8F2", borderRadius: 8 }}
              >
                <Text fz="xs" c="dimmed" ta="center">
                  Last Updated:{" "}
                  {new Date(sensorData.updatedAt).toLocaleString()}
                </Text>
              </Box>
            </Card>
          </Grid.Col>
        </Grid>
      </Box>
    </Box>
  );
}
