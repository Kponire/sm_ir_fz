// src/app/(dashboard)/dashboard/control/page.tsx
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
  Select,
  Paper,
  Stack,
  Switch,
  Divider,
  Alert,
  ThemeIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  MdPower,
  MdPlayArrow,
  MdStop,
  MdTune,
  MdHandyman,
  MdAutorenew,
  MdWaterDrop,
  MdHistory,
  MdCheckCircle,
} from "react-icons/md";
import { FaArrowUpFromWaterPump } from "react-icons/fa6";
import { PageHeader } from "@/components/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import classes from "./control.module.css";

type Mode = "manual" | "automatic";
type Zone = "A" | "B" | "C";

interface StatusRow {
  label: string;
  value: string;
}

export default function IrrigationControlPage() {
  useRequireAuth();
  const [mode, setMode] = useState<Mode>("automatic");
  const [pumpOn, setPumpOn] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone>("A");
  const [loading, setLoading] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState("");
  const [statusRows] = useState<StatusRow[]>([
    { label: "Last Irrigation", value: "Today, 06:30 AM (Zone A, 20 min)" },
    { label: "Total Water Used Today", value: "245 L" },
    { label: "Next Schedule", value: "Today, 06:30 PM (Zone B)" },
    { label: "Active Zone", value: pumpOn ? `Zone ${selectedZone}` : "None" },
  ]);

  /*   const sendCommand = async (command: "start" | "stop", zone?: Zone) => {
    setLoading(command);
    try {
      const res = await fetch("/api/commands/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, zone: zone ?? selectedZone }),
      });
      if (res.ok || true) {
        // allow in dev
        if (command === "start") {
          setPumpOn(true);
          setLastAction(
            `Pump started — Zone ${zone ?? selectedZone} @ ${new Date().toLocaleTimeString()}`,
          );
          notifications.show({
            title: "✓ Irrigation Started",
            message: `Zone ${zone ?? selectedZone} pump activated.`,
            color: "green",
          });
        } else {
          setPumpOn(false);
          setLastAction(`Pump stopped @ ${new Date().toLocaleTimeString()}`);
          notifications.show({
            title: "Irrigation Stopped",
            message: "Pump has been turned off.",
            color: "orange",
          });
        }
      }
    } catch {
      notifications.show({
        title: "Error",
        message: "Command failed. Check device connection.",
        color: "red",
      });
    } finally {
      setLoading(null);
    }
  }; */

  const sendCommand = async (cmd: "start" | "stop", zone?: Zone) => {
    setLoading(cmd);

    try {
      await fetch("/api/mqtt/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: "farm/commands",
          payload: {
            command: cmd,
            deviceId: "farm_node_001",
          },
        }),
      });

      if (cmd === "start") {
        setPumpOn(true);
        setLastAction(
          `Pump started, Zone ${zone ?? selectedZone} @ ${new Date().toLocaleTimeString()}`,
        );
        notifications.show({
          title: "Irrigation Started",
          message: `Zone ${zone ?? selectedZone} pump activated.`,
          color: "green",
        });
      } else {
        setPumpOn(false);
        setLastAction(`Pump stopped @ ${new Date().toLocaleTimeString()}`);
        notifications.show({
          title: "Irrigation Stopped",
          message: "Pump has been turned off.",
          color: "orange",
        });
      }
    } catch {
      notifications.show({
        title: "Error",
        message: "Command failed. Check device connection.",
        color: "red",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleModeToggle = (newMode: Mode) => {
    setMode(newMode);
    notifications.show({
      title: `Mode: ${newMode === "automatic" ? "Automatic" : "Manual"}`,
      message:
        newMode === "automatic"
          ? "System will irrigate based on automation rules."
          : "You now have full manual control.",
      color: "brand",
    });
  };

  return (
    <Box>
      <PageHeader
        title="Irrigation Control"
        breadcrumb="Control"
        subtitle="Manual and automatic pump & zone management"
      />

      <Box p="xl">
        {/* Mode Toggle Card */}
        <Paper
          withBorder
          radius="md"
          p="xl"
          mb="xl"
          className={classes.modeBanner}
        >
          <Group justify="space-between" wrap="wrap" gap="lg">
            <Box>
              <Group gap="sm" mb={4}>
                {mode === "automatic" ? (
                  <MdAutorenew size={20} color="#46A908" />
                ) : (
                  <MdHandyman size={20} color="#725438" />
                )}
                <Text
                  fw={800}
                  fz="lg"
                  c="#1E2B18"
                  style={{ letterSpacing: "-0.3px" }}
                >
                  Current Mode: {mode === "automatic" ? "Automatic" : "Manual"}
                </Text>
                <Badge
                  style={{
                    backgroundColor:
                      mode === "automatic" ? "#E6F4D9" : "#fef9ee",
                    color: mode === "automatic" ? "#2B601E" : "#d97706",
                    fontWeight: 700,
                  }}
                >
                  {mode === "automatic" ? "Active" : "✦ Manual"}
                </Badge>
              </Group>
              <Text fz="sm" c="dimmed">
                {mode === "automatic"
                  ? "System irrigates automatically based on soil moisture, schedule, and weather."
                  : "You have full manual control. Automation is paused."}
              </Text>
            </Box>
            <Group gap="md">
              <Button
                variant={mode === "manual" ? "filled" : "light"}
                color="earth"
                leftSection={<MdHandyman size={16} />}
                onClick={() => handleModeToggle("manual")}
                styles={{
                  root: {
                    backgroundColor: mode === "manual" ? "#725438" : undefined,
                  },
                }}
              >
                Manual Mode
              </Button>
              <Button
                variant={mode === "automatic" ? "filled" : "light"}
                color="brand"
                leftSection={<MdAutorenew size={16} />}
                onClick={() => handleModeToggle("automatic")}
                style={{
                  backgroundColor: mode === "automatic" ? "#46A908" : undefined,
                }}
              >
                Automatic Mode
              </Button>
            </Group>
          </Group>
        </Paper>

        <Grid gutter="xl">
          {/* Pump Controls */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Card withBorder radius="md" p="xl" h="100%">
              <Group gap="sm" mb="lg">
                <ThemeIcon
                  size={36}
                  radius="md"
                  style={{ backgroundColor: "#E6F4D9" }}
                >
                  <FaArrowUpFromWaterPump size={20} color="#2B601E" />
                </ThemeIcon>
                <Box>
                  <Text fw={700} fz="sm" c="#1E2B18">
                    Pump Control
                  </Text>
                  <Text fz="xs" c="dimmed">
                    Start or stop the main irrigation pump
                  </Text>
                </Box>
              </Group>

              {/* Pump status indicator */}
              <Box ta="center" py="lg">
                <Box
                  className={`${classes.pumpOrb} ${pumpOn ? classes.pumpOrbOn : classes.pumpOrbOff}`}
                >
                  <FaArrowUpFromWaterPump size={100} />
                  <Text fw={800} fz="xl" mt={8}>
                    {pumpOn ? "RUNNING" : "IDLE"}
                  </Text>
                </Box>
                {pumpOn && (
                  <Text fz="xs" c="#46A908" mt="sm" fw={600}>
                    Actively irrigating Zone {selectedZone}
                  </Text>
                )}
              </Box>

              <Stack gap="sm" mt="md">
                <Button
                  size="lg"
                  fullWidth
                  leftSection={<MdPlayArrow size={22} />}
                  onClick={() => sendCommand("start")}
                  loading={loading === "start"}
                  disabled={pumpOn || mode === "automatic" || !!loading}
                  style={{
                    backgroundColor:
                      pumpOn || mode === "automatic" ? undefined : "#46A908",
                    fontWeight: 700,
                  }}
                  color="brand"
                >
                  Turn Pump ON
                </Button>
                <Button
                  size="lg"
                  fullWidth
                  variant="light"
                  color="red"
                  leftSection={<MdStop size={22} />}
                  onClick={() => sendCommand("stop")}
                  loading={loading === "stop"}
                  disabled={!pumpOn || mode === "automatic" || !!loading}
                >
                  Turn Pump OFF
                </Button>
              </Stack>

              {mode === "automatic" && (
                <Alert mt="md" color="brand" radius="md" variant="light">
                  <Text fz="xs">
                    Manual controls are disabled in Automatic mode. Switch to
                    Manual to control manually.
                  </Text>
                </Alert>
              )}
            </Card>
          </Grid.Col>

          {/* Zone + Status */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="md">
              {/* Zone Selector */}
              <Card withBorder radius="md" p="xl">
                <Group gap="sm" mb="lg">
                  <ThemeIcon
                    size={36}
                    radius="md"
                    style={{ backgroundColor: "#E6F4D9" }}
                  >
                    <MdTune size={20} color="#2B601E" />
                  </ThemeIcon>
                  <Box>
                    <Text fw={700} fz="sm" c="#1E2B18">
                      Zone Control
                    </Text>
                    <Text fz="xs" c="dimmed">
                      Select and activate an irrigation zone
                    </Text>
                  </Box>
                </Group>

                <Grid gutter="sm" mb="lg">
                  {(["A", "B", "C"] as Zone[]).map((z) => (
                    <Grid.Col key={z} span={4}>
                      <Box
                        className={`${classes.zoneBtn} ${selectedZone === z ? classes.zoneBtnActive : ""}`}
                        onClick={() => setSelectedZone(z)}
                      >
                        <MdWaterDrop size={22} />
                        <Text fw={700} fz="sm">
                          Zone {z}
                        </Text>
                        {selectedZone === z && (
                          <Badge
                            size="xs"
                            variant="dot"
                            style={{
                              //backgroundColor: "#46A908",
                              color: "#46A908",
                              fontWeight: 700,
                            }}
                            color="#46A908"
                          >
                            Selected
                          </Badge>
                        )}
                      </Box>
                    </Grid.Col>
                  ))}
                </Grid>

                <Button
                  size="md"
                  fullWidth
                  leftSection={<MdWaterDrop size={18} />}
                  onClick={() => sendCommand("start", selectedZone)}
                  disabled={pumpOn || mode === "automatic" || !!loading}
                  loading={loading === "start"}
                  color="brand"
                  style={{
                    backgroundColor:
                      mode === "automatic" ? undefined : "#46A908",
                    fontWeight: 600,
                  }}
                >
                  Activate Zone {selectedZone}
                </Button>
              </Card>

              {/* Status Display */}
              <Card withBorder radius="md" p="xl">
                <Group gap="sm" mb="md">
                  <ThemeIcon
                    size={36}
                    radius="md"
                    style={{ backgroundColor: "#F5F8F2" }}
                  >
                    <MdHistory size={20} color="#725438" />
                  </ThemeIcon>
                  <Box>
                    <Text fw={700} fz="sm" c="#1E2B18">
                      Status Overview
                    </Text>
                    <Text fz="xs" c="dimmed">
                      Current irrigation statistics
                    </Text>
                  </Box>
                </Group>

                {lastAction && (
                  <Paper
                    withBorder
                    radius="md"
                    p="sm"
                    mb="md"
                    style={{
                      backgroundColor: "#F5F8F2",
                      borderColor: "#E3EDD9",
                    }}
                  >
                    <Group gap="xs">
                      <MdCheckCircle size={16} color="#46A908" />
                      <Text fz="xs" fw={600} c="#1E2B18">
                        {lastAction}
                      </Text>
                    </Group>
                  </Paper>
                )}

                <Stack gap={0}>
                  {statusRows.map((row, i) => (
                    <Group
                      key={row.label}
                      justify="space-between"
                      py={10}
                      style={{
                        borderBottom:
                          i < statusRows.length - 1
                            ? "1px solid #F0F4EC"
                            : "none",
                      }}
                    >
                      <Text fz="sm" c="dimmed">
                        {row.label}
                      </Text>
                      <Text fz="sm" fw={600} c="#1E2B18">
                        {row.value}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Box>
    </Box>
  );
}
