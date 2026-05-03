// src/app/(dashboard)/dashboard/monitoring/page.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Grid,
  Card,
  Text,
  Box,
  Group,
  Button,
  Badge,
  ActionIcon,
  Paper,
  Stack,
  Divider,
  Tooltip,
  RingProgress,
  Center,
} from "@mantine/core";
import {
  MdRefresh,
  MdWaterDrop,
  MdThermostat,
  MdAir,
  MdOpacity,
  MdWater,
  MdWifi,
  MdWifiOff,
  MdCloud,
  MdCloudOff,
  MdOutlineSpeed,
} from "react-icons/md";
import { SiTicktick } from "react-icons/si";
import { PiSealWarningFill } from "react-icons/pi";
import { MdError } from "react-icons/md";
import { PageHeader, StatusBadge } from "@/components/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import classes from "./monitoring.module.css";
import { useMqtt } from "@/hooks/useMqtt";
import { useSensorStore } from "@/store/useSensorStore";

interface LiveData {
  soilMoisture1: number;
  soilMoisture2: number;
  temperature: number;
  humidity: number;
  rainDetected: boolean;
  flowRate: number;
  waterUsedToday: number;
  tankLevel: number;
  pumpOn: boolean;
  systemStatus: "online" | "offline" | "idle";
  deviceId: string;
  updatedAt: string;
}

const MOCK_DATA: LiveData = {
  soilMoisture1: 68,
  soilMoisture2: 42,
  temperature: 26.5,
  humidity: 72,
  rainDetected: false,
  flowRate: 12.4,
  waterUsedToday: 245,
  tankLevel: 85,
  pumpOn: false,
  systemStatus: "online",
  deviceId: "ESP-A4CF-1234",
  updatedAt: new Date().toISOString(),
};

function getRingColor(
  value: number,
  type: "moisture" | "tank" | "default",
): string {
  if (type === "moisture") {
    if (value >= 60) return "#46A908";
    if (value >= 40) return "#d97706";
    return "#dc2626";
  }
  if (type === "tank") {
    return value === 1 ? "#46A908" : "#dc2626";
  }
  return "#46A908";
}

function getSensorStatus(
  value: number,
  min: number,
  type?: string,
): "good" | "warning" | "danger" {
  if (type === "tank") {
    return value === 1 ? "good" : "danger";
  }

  const ratio = value / min;
  if (ratio >= 1.2) return "good";
  if (ratio >= 1) return "warning";
  return "danger";
}

export default function LiveMonitoringPage() {
  useRequireAuth();
  /* const { data: liveMqttData, status } = useMqtt("farm/sensors/reading");
  const [data, setData] = useState<LiveData>(MOCK_DATA);
  const [displayData, setDisplayData] = useState<any>(null); */

  const data = useSensorStore((s) => s.data);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  /*   const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/sensors/reading?latest=1");
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setData({
            ...MOCK_DATA,
            ...json.data,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } catch {
    } finally {
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    if (liveMqttData) {
      setDisplayData(liveMqttData);
      const real_data: LiveData = {
        ...liveMqttData,
        systemStatus: "online",
        updatedAt: new Date().toISOString(),
      };
      setData(real_data);
      setLastRefresh(new Date());
      console.log(liveMqttData);
    }
  }, [liveMqttData]); */

  if (!data)
    return (
      <>
        <PageHeader
          title="Live Monitoring"
          breadcrumb="Sensors"
          subtitle="Real-time sensor readings from your irrigation device"
          actions={
            <Group gap="sm">
              <Button
                leftSection={<MdRefresh size={16} />}
                variant="light"
                color="brand"
                //onClick={fetchData}
                loading={refreshing}
                size="sm"
              >
                Refresh Now
              </Button>
            </Group>
          }
        />
        <Text style={{ padding: "20px 28px" }}>Loading system status...</Text>
      </>
    );

  const SENSORS = [
    {
      id: "sm1",
      label: "Zone A - Soil Moisture",
      value: data?.soilMoisture1,
      unit: "%",
      icon: <MdWaterDrop size={22} />,
      min: 40,
      type: "moisture" as const,
      ringColor: getRingColor(data?.soilMoisture1, "moisture"),
    },
    {
      id: "sm2",
      label: "Zone B - Soil Moisture",
      value: data?.soilMoisture2,
      unit: "%",
      icon: <MdWaterDrop size={22} />,
      min: 40,
      type: "moisture" as const,
      ringColor: getRingColor(data?.soilMoisture2, "moisture"),
    },
    {
      id: "temp",
      label: "Temperature",
      value: data?.temperature,
      unit: "°C",
      icon: <MdThermostat size={22} />,
      min: 0,
      type: "default" as const,
      ringColor: "#2563eb", // "#f97316",
    },
    {
      id: "hum",
      label: "Humidity",
      value: data?.humidity,
      unit: "%",
      icon: <MdAir size={22} />,
      min: 0,
      type: "default" as const,
      ringColor: "#2563eb",
    },
    {
      id: "tank",
      label: "Water Tank Level",
      value: data?.tankLevel,
      unit: " ",
      icon: <MdOpacity size={22} />,
      min: 1,
      type: "tank" as const,
      ringColor: getRingColor(data?.tankLevel, "tank"),
    },
    {
      id: "flow",
      label: "Flow Rate",
      value: Number(data?.flowRate?.toFixed(1)),
      unit: "L/min",
      icon: <MdOutlineSpeed size={22} />,
      min: 0,
      type: "default" as const,
      ringColor: "#46A908",
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Live Monitoring"
        breadcrumb="Sensors"
        subtitle="Real-time sensor readings from your irrigation device"
        actions={
          <Group gap="sm">
            <Button
              leftSection={<MdRefresh size={16} />}
              variant="light"
              color="brand"
              //onClick={fetchData}
              loading={refreshing}
              size="sm"
            >
              Refresh Now
            </Button>
          </Group>
        }
      />

      <Box p="xl">
        {/* Connection status bar */}
        <Paper
          withBorder
          radius="md"
          p="md"
          mb="xl"
          className={classes.statusBar}
        >
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Group gap="lg">
              <Group gap="xs">
                {data?.systemStatus === "online" ? (
                  <MdWifi size={18} color="#46A908" />
                ) : (
                  <MdWifiOff size={18} color="#dc2626" />
                )}
                <Text fz="sm" fw={600} c="#1E2B18">
                  Device: {data?.deviceId}
                </Text>
                <StatusBadge
                  status={
                    data?.systemStatus === "online" ? "online" : "offline"
                  }
                />
              </Group>
              <Divider orientation="vertical" />
              <Group gap="xs">
                {data?.rainDetected ? (
                  <MdCloud size={18} color="#2563eb" />
                ) : (
                  <MdCloudOff size={18} color="#9ca3af" />
                )}
                <Text fz="sm" c="dimmed">
                  Rain: {data?.rainDetected ? "Detected" : "Not Detected"}
                </Text>
              </Group>
              <Divider orientation="vertical" />
              <Group gap="xs">
                <MdWater size={18} color="#46A908" />
                <Text fz="sm" c="dimmed">
                  Water Used Today:{" "}
                  <Text span fw={600} c="#1E2B18">
                    {data?.waterUsedToday} L
                  </Text>
                </Text>
              </Group>
            </Group>
            <Text fz="xs" c="dimmed">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </Text>
          </Group>
        </Paper>

        {/* Rain Detection Banner */}
        {data?.rainDetected && (
          <Paper
            withBorder
            radius="md"
            p="md"
            mb="xl"
            style={{ borderColor: "#2563eb", backgroundColor: "#eff6ff" }}
          >
            <Group gap="sm">
              <MdCloud size={20} color="#2563eb" />
              <Text fz="sm" fw={600} c="#1d4ed8">
                Rain detected — Automatic irrigation has been paused to conserve
                water.
              </Text>
            </Group>
          </Paper>
        )}

        {/* Sensor Cards Grid */}
        <Text
          fz="xs"
          fw={700}
          c="dimmed"
          style={{ textTransform: "uppercase", letterSpacing: "1px" }}
          mb="md"
        >
          Real-Time Sensor Data
        </Text>
        <Grid gutter="md" mb="xl">
          {SENSORS.map((sensor) => {
            const status =
              sensor.min > 0
                ? getSensorStatus(sensor.value, sensor.min, sensor.type)
                : "good";
            const ringPct =
              sensor.id === "tank"
                ? sensor.value === 1
                  ? 100
                  : 0
                : Math.min((sensor.value / 100) * 100, 100);

            return (
              <Grid.Col key={sensor.id} span={{ base: 12, xs: 6, md: 4 }}>
                <Card
                  withBorder
                  radius="md"
                  p="lg"
                  className={classes.sensorCard}
                  style={{
                    borderColor: "gray",
                    borderWidth: 2,
                  }}
                >
                  <Group justify="space-between" mb="md">
                    <Box>
                      <Text
                        fz="xs"
                        fw={700}
                        c="dimmed"
                        style={{
                          textTransform: "uppercase",
                          letterSpacing: "0.7px",
                        }}
                      >
                        {sensor.label}
                      </Text>
                    </Box>
                    <Box style={{ color: sensor.ringColor }}>{sensor.icon}</Box>
                  </Group>

                  <Group align="center" gap="md">
                    {sensor.value <= 100 &&
                    sensor.type !== "default" &&
                    sensor.type !== "tank" ? (
                      <RingProgress
                        size={80}
                        thickness={8}
                        roundCaps
                        sections={[{ value: ringPct, color: sensor.ringColor }]}
                        label={
                          <Center>
                            <Text fw={800} fz="xs" c="#1E2B18">
                              {Math.round(sensor.value)}
                            </Text>
                          </Center>
                        }
                      />
                    ) : (
                      <Box
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          backgroundColor: `${sensor.ringColor}12`,
                          border: `3px solid ${sensor.ringColor}40`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          fw={800}
                          fz="xl"
                          style={{ color: sensor.ringColor }}
                        >
                          {sensor.id !== "tank"
                            ? sensor.value
                            : sensor.value === 1
                              ? "filled"
                              : "low"}
                        </Text>
                      </Box>
                    )}

                    <Box>
                      <Group align="baseline" gap={4}>
                        <Text
                          fw={900}
                          fz={34}
                          c="#1E2B18"
                          style={{ letterSpacing: "-1.5px" }}
                        >
                          {sensor.id !== "tank"
                            ? sensor.value
                            : sensor.value === 1
                              ? "filled"
                              : "low"}
                        </Text>
                        <Text fz="sm" c="dimmed" fw={500}>
                          {sensor.unit}
                        </Text>
                      </Group>
                      <Badge
                        size="xs"
                        mt={4}
                        leftSection={
                          status === "good" ? (
                            <SiTicktick />
                          ) : status === "warning" ? (
                            <PiSealWarningFill />
                          ) : (
                            <MdError />
                          )
                        }
                        variant="outline"
                        style={{
                          color:
                            status === "good"
                              ? "#2B601E"
                              : status === "warning"
                                ? "#d97706"
                                : "#dc2626",
                          fontWeight: 700,
                        }}
                      >
                        {status === "good"
                          ? "Normal"
                          : status === "warning"
                            ? "Low"
                            : "Critical"}
                      </Badge>
                    </Box>
                  </Group>
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>

        {/* Auto-refresh info */}
        <Paper withBorder radius="md" p="md" className={classes.infoBar}>
          <Group gap="sm">
            <Box
              className={`${classes.refreshDot} ${classes.pulse}`}
              style={{ backgroundColor: "#46A908" }}
            />
            <Text fz="sm" c="dimmed">
              Data is pushed by the device every{" "}
              <Text span fw={600} c="#1E2B18">
                5
              </Text>{" "}
              seconds.
            </Text>
          </Group>
        </Paper>
      </Box>
    </Box>
  );
}
