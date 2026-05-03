// src/app/(dashboard)/dashboard/automation/page.tsx
"use client";

import { useState } from "react";
import {
  Grid,
  Card,
  Text,
  Box,
  Group,
  Button,
  Checkbox,
  NumberInput,
  Paper,
  Stack,
  ThemeIcon,
  Alert,
  Divider,
  Switch,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  MdTune,
  MdSave,
  MdCheckCircle,
  MdCloud,
  MdThermostat,
  MdOpacity,
  MdSchedule,
  MdAutorenew,
  MdInfo,
} from "react-icons/md";
import { PageHeader } from "@/components/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import classes from "./automation.module.css";

interface AutoSettings {
  moistureThreshold: number;
  maxDurationMinutes: number;
  morningStart: string;
  morningEnd: string;
  eveningStart: string;
  eveningEnd: string;
  stopOnRain: boolean;
  reduceOnHumidity: boolean;
  increaseOnTemp: boolean;
  enabled: boolean;
}

const mock_data: AutoSettings = {
  moistureThreshold: 40,
  maxDurationMinutes: 30,
  morningStart: "06:00",
  morningEnd: "09:00",
  eveningStart: "17:00",
  eveningEnd: "19:00",
  stopOnRain: true,
  reduceOnHumidity: true,
  increaseOnTemp: false,
  enabled: true,
};

export default function AutomationSettingsPage() {
  useRequireAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const form = useForm<AutoSettings>({
    initialValues: {
      moistureThreshold: 40,
      maxDurationMinutes: 30,
      morningStart: "06:00",
      morningEnd: "09:00",
      eveningStart: "17:00",
      eveningEnd: "19:00",
      stopOnRain: true,
      reduceOnHumidity: true,
      increaseOnTemp: false,
      enabled: true,
    },
    validate: {
      moistureThreshold: (v) => (v >= 0 && v <= 100 ? null : "0–100%"),
      maxDurationMinutes: (v) => (v >= 1 && v <= 480 ? null : "1–480 min"),
    },
  });

  const handleSave = async (values: AutoSettings) => {
    setSaving(true);
    try {
      /* await fetch("/api/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "automation", ...values }),
      }); */
      await fetch("/api/mqtt/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: "farm/settings",
          payload: {
            deviceId: "farm_node_001",
            type: "automation",
            ...values,
          },
        }),
      });
      notifications.show({
        title: "Settings Saved",
        message: "Automation rules updated on device.",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to save settings.",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Automation Settings"
        breadcrumb="Settings"
        subtitle="Configure smart irrigation rules that run automatically on your device"
        actions={
          <Switch
            label={form.values.enabled ? "Automation ON" : "Automation OFF"}
            checked={form.values.enabled}
            onChange={(e) =>
              form.setFieldValue("enabled", e.currentTarget.checked)
            }
            color="brand"
            size="md"
            ff="var(--font-nunito), sans-serif"
          />
        }
      />

      <Box p="xl">
        {saved && (
          <Alert
            icon={<MdCheckCircle size={18} />}
            color="green"
            radius="md"
            mb="xl"
            withCloseButton
            onClose={() => setSaved(false)}
          >
            Settings saved and pushed to your device. Changes take effect within
            30 seconds.
          </Alert>
        )}

        {!form.values.enabled && (
          <Alert icon={<MdInfo size={18} />} color="orange" radius="md" mb="xl">
            Automation is currently <strong>disabled</strong>. Toggle the switch
            above to enable automatic irrigation.
          </Alert>
        )}

        {/* <Button
          size="md"
          color="red"
          variant="light"
          onClick={() => handleSave(mock_data)}
          loading={saving}
          disabled={saving}
          fullWidth
        >
          Test Connection
        </Button> */}

        <form onSubmit={form.onSubmit(handleSave)}>
          <Grid gutter="xl">
            {/* Left column: thresholds */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                {/* Moisture Threshold */}
                <Card withBorder radius="md" p="xl">
                  <Group gap="sm" mb="lg">
                    <ThemeIcon
                      size={38}
                      radius="md"
                      variant="white"
                      //style={{ backgroundColor: "#E6F4D9" }}
                    >
                      <MdOpacity size={20} color="#2B601E" />
                    </ThemeIcon>
                    <Box>
                      <Text fw={700} fz="sm" c="#1E2B18">
                        Moisture Threshold
                      </Text>
                      <Text fz="xs" c="dimmed">
                        Irrigation triggers below this level
                      </Text>
                    </Box>
                  </Group>

                  <NumberInput
                    label="Moisture Threshold (%)"
                    description="Pump activates when soil moisture drops below this value"
                    min={0}
                    max={100}
                    suffix="%"
                    size="md"
                    {...form.getInputProps("moistureThreshold")}
                    styles={{ input: { fontWeight: 700, fontSize: 18 } }}
                  />

                  {/* Visual indicator */}
                  <Box mt="md">
                    <Group justify="space-between" mb={6}>
                      <Text fz="xs" c="dimmed">
                        Critical (0%)
                      </Text>
                      <Text fz="xs" fw={600} c="#46A908">
                        Current: {form.values.moistureThreshold}%
                      </Text>
                      <Text fz="xs" c="dimmed">
                        Saturated (100%)
                      </Text>
                    </Group>
                    <Box
                      style={{
                        height: 8,
                        backgroundColor: "#F0F4EC",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        style={{
                          height: "100%",
                          width: `${form.values.moistureThreshold}%`,
                          backgroundColor: "#46A908",
                          borderRadius: 4,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </Box>
                  </Box>
                </Card>

                {/* Duration */}
                <Card withBorder radius="md" p="xl">
                  <Group gap="sm" mb="lg">
                    <ThemeIcon
                      size={38}
                      radius="md"
                      variant="white"
                      //style={{ backgroundColor: "#E6F4D9" }}
                    >
                      <MdSchedule size={20} color="#2B601E" />
                    </ThemeIcon>
                    <Box>
                      <Text fw={700} fz="sm" c="#1E2B18">
                        Maximum Duration
                      </Text>
                      <Text fz="xs" c="dimmed">
                        Safety cutoff for each irrigation cycle
                      </Text>
                    </Box>
                  </Group>

                  <NumberInput
                    label="Maximum Irrigation Duration"
                    description="Pump will automatically stop after this many minutes"
                    min={1}
                    max={480}
                    suffix=" min"
                    size="md"
                    {...form.getInputProps("maxDurationMinutes")}
                    styles={{ input: { fontWeight: 700, fontSize: 18 } }}
                  />
                </Card>

                {/* Weather Rules */}
                <Card withBorder radius="md" p="xl">
                  <Group gap="sm" mb="lg">
                    <ThemeIcon
                      size={38}
                      radius="md"
                      variant="white"
                      //style={{ backgroundColor: "#eff6ff" }}
                    >
                      <MdCloud size={20} color="#2563eb" />
                    </ThemeIcon>
                    <Box>
                      <Text fw={700} fz="sm" c="#1E2B18">
                        Weather-Based Rules
                      </Text>
                      <Text fz="xs" c="dimmed">
                        Adjust irrigation based on weather sensors
                      </Text>
                    </Box>
                  </Group>

                  <Stack gap="md">
                    {[
                      {
                        key: "stopOnRain" as const,
                        icon: <MdCloud size={16} color="#2563eb" />,
                        label: "Stop on Rain Detection",
                        desc: "Pause irrigation when rain sensor is triggered",
                      },
                      {
                        key: "reduceOnHumidity" as const,
                        icon: <MdOpacity size={16} color="#0ea5e9" />,
                        label: "Reduce on High Humidity",
                        desc: "Decrease run time when humidity exceeds 80%",
                      },
                      {
                        key: "increaseOnTemp" as const,
                        icon: <MdThermostat size={16} color="#f97316" />,
                        label: "Increase on High Temperature",
                        desc: "Add extra run time when temp exceeds 35°C",
                      },
                    ].map((rule, i, arr) => (
                      <Box key={rule.key}>
                        <Group justify="space-between" py={i === 0 ? 0 : 12}>
                          <Group gap="sm">
                            <Box>{rule.icon}</Box>
                            <Box>
                              <Text fz="sm" fw={600} c="#1E2B18">
                                {rule.label}
                              </Text>
                              <Text fz="xs" c="dimmed">
                                {rule.desc}
                              </Text>
                            </Box>
                          </Group>
                          <Switch
                            checked={form.values[rule.key]}
                            onChange={(e) =>
                              form.setFieldValue(
                                rule.key,
                                e.currentTarget.checked,
                              )
                            }
                            color="brand"
                          />
                        </Group>
                        {i < arr.length - 1 && <Divider color="#F0F4EC" />}
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Stack>
            </Grid.Col>

            {/* Right column: time windows */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="md">
                <Card withBorder radius="md" p="xl">
                  <Group gap="sm" mb="lg">
                    <ThemeIcon
                      size={38}
                      radius="md"
                      //style={{ backgroundColor: "#fef9ee" }}
                      variant="white"
                    >
                      <MdSchedule size={20} color="#d97706" />
                    </ThemeIcon>
                    <Box>
                      <Text fw={700} fz="sm" c="#1E2B18">
                        Allowed Irrigation Windows
                      </Text>
                      <Text fz="xs" c="dimmed">
                        System will only irrigate within these hours
                      </Text>
                    </Box>
                  </Group>

                  <Stack gap="lg">
                    <Box>
                      <Text fz="sm" fw={700} c="#1E2B18" mb="sm">
                        Morning Window
                      </Text>
                      <Group grow>
                        <TimeInput
                          label="Start Time"
                          size="md"
                          {...form.getInputProps("morningStart")}
                        />
                        <TimeInput
                          label="End Time"
                          size="md"
                          {...form.getInputProps("morningEnd")}
                        />
                      </Group>
                    </Box>

                    <Divider
                      color="#F0F4EC"
                      label="and / or"
                      labelPosition="center"
                    />

                    <Box>
                      <Text fz="sm" fw={700} c="#1E2B18" mb="sm">
                        Evening Window
                      </Text>
                      <Group grow>
                        <TimeInput
                          label="Start Time"
                          size="md"
                          {...form.getInputProps("eveningStart")}
                        />
                        <TimeInput
                          label="End Time"
                          size="md"
                          {...form.getInputProps("eveningEnd")}
                        />
                      </Group>
                    </Box>
                  </Stack>
                </Card>

                {/* Summary Preview */}
                <Card
                  withBorder
                  radius="md"
                  p="xl"
                  className={classes.summaryCard}
                >
                  <Group gap="sm" mb="md">
                    <ThemeIcon
                      size={38}
                      radius="md"
                      variant="white"
                      //style={{ backgroundColor: "#E6F4D9" }}
                    >
                      <MdAutorenew size={20} color="#2B601E" />
                    </ThemeIcon>
                    <Box>
                      <Text fw={700} fz="sm" c="#1E2B18">
                        Rule Summary
                      </Text>
                      <Text fz="xs" c="dimmed">
                        How your ESP8266 will behave
                      </Text>
                    </Box>
                  </Group>

                  <Stack gap={8}>
                    {[
                      `Irrigate when moisture < ${form.values.moistureThreshold}%`,
                      `Stop after ${form.values.maxDurationMinutes} minutes max`,
                      `Morning window: ${form.values.morningStart} - ${form.values.morningEnd}`,
                      `Evening window: ${form.values.eveningStart} - ${form.values.eveningEnd}`,
                      form.values.stopOnRain && "Stop if rain detected",
                      form.values.reduceOnHumidity &&
                        "Reduce time when humidity > 80%",
                      form.values.increaseOnTemp &&
                        "Increase time when temp > 35°C",
                    ]
                      .filter(Boolean)
                      .map((rule) => (
                        <Group key={String(rule)} gap="xs">
                          <Box
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              backgroundColor: "#46A908",
                              flexShrink: 0,
                              marginTop: 2,
                            }}
                          />
                          <Text fz="sm" c="#1E2B18">
                            {String(rule)}
                          </Text>
                        </Group>
                      ))}
                  </Stack>
                </Card>

                {/* Save button */}
                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  color="brand"
                  leftSection={<MdSave size={20} />}
                  loading={saving}
                  style={{ backgroundColor: "#46A908", fontWeight: 700 }}
                >
                  Save Automation Settings
                </Button>

                <Text fz="xs" c="dimmed" ta="center">
                  Settings are synced to your ESP8266 device via the cloud.
                </Text>
              </Stack>
            </Grid.Col>
          </Grid>
        </form>
      </Box>
    </Box>
  );
}
