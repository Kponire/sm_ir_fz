"use client";

import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  Text,
  Box,
  Group,
  Button,
  NumberInput,
  Stack,
  ThemeIcon,
  Skeleton,
  Switch,
  Divider,
  Center,
  Loader,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  MdTune,
  MdSave,
  MdScience,
  MdEdit,
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

interface AutoSettings {
  // Irrigation
  moistureThreshold: number;
  maxIrrigationTime: number;
  irrigationWindowStart: string;
  irrigationWindowEnd: string;
  stopOnRain: boolean;
  reduceOnHighHumidity: boolean;
  increaseOnHighTemp: boolean;
  enabled: boolean;
  // Fertigation (New)
  fertigationEnabled: boolean;
  fertigationIntervalDays: number;
  fertigationDuration: number;
  fertigationWindowStart: string;
  fertigationWindowEnd: string;
}

export default function AutomationSettingsPage() {
  useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isExisting, setIsExisting] = useState(false);

  const form = useForm<AutoSettings>({
    initialValues: {
      moistureThreshold: 40,
      maxIrrigationTime: 30,
      irrigationWindowStart: "06:00",
      irrigationWindowEnd: "09:00",
      stopOnRain: true,
      reduceOnHighHumidity: true,
      increaseOnHighTemp: false,
      enabled: true,
      fertigationEnabled: false,
      fertigationIntervalDays: 7,
      fertigationDuration: 15,
      fertigationWindowStart: "07:00",
      fertigationWindowEnd: "08:00",
    },
  });

  // GET: Fetch settings on page load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/farm");
        const json = await res.json();
        console.log(json.data);
        if (json.success && json.data) {
          console.log(json.data);
          form.setValues({
            ...json.data,
          });
          setIsExisting(true);
        }
      } catch (err) {
        notifications.show({
          title: "Error",
          message: "Could not sync with cloud.",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (values: AutoSettings) => {
    setSaving(true);
    try {
      await fetch("/api/farm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      // Push to MQTT
      await fetch("/api/mqtt/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: "farm/settings",
          payload: { deviceId: "farm_node_001", ...values },
        }),
      });

      setIsExisting(true);
      notifications.show({
        title: "Success",
        message: "Settings updated on cloud and device.",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "Sync failed.",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Center h={400}>
        <Stack align="center">
          <Loader color="green" size="lg" type="dots" />
          <Text c="dimmed" fz="sm">
            Fetching your farm configuration...
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Automation"
        subtitle="Intelligent Irrigation Control"
        actions={
          <Switch
            label={form.values.enabled ? "System Active" : "System Paused"}
            checked={form.values.enabled}
            onChange={(e) =>
              form.setFieldValue("enabled", e.currentTarget.checked)
            }
            color="green"
            size="md"
          />
        }
      />

      <Box p="xl">
        <form onSubmit={form.onSubmit(handleSave)}>
          <Grid gutter="xl">
            {/* Irrigation Settings Card */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder p="xl" radius="md" shadow="sm">
                <Group mb="xl">
                  <ThemeIcon color="green.1" variant="light" size="xl">
                    <MdOpacity color="green" size={24} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={700}>Irrigation Logic</Text>
                    <Text fz="xs" c="dimmed">
                      Soil and duration thresholds
                    </Text>
                  </Box>
                </Group>
                <Stack gap="md">
                  <NumberInput
                    label="Trigger Moisture %"
                    {...form.getInputProps("moistureThreshold")}
                  />
                  <NumberInput
                    label="Auto-Stop (mins)"
                    {...form.getInputProps("maxIrrigationTime")}
                  />
                  <Divider label="Active Window" labelPosition="center" />
                  <Group grow>
                    <TimeInput
                      label="Start"
                      {...form.getInputProps("irrigationWindowStart")}
                    />
                    <TimeInput
                      label="End"
                      {...form.getInputProps("irrigationWindowEnd")}
                    />
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>

            {/* Fertigation Settings Card */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder p="xl" radius="md" shadow="sm">
                <Group mb="xl" justify="space-between">
                  <Group>
                    <ThemeIcon color="blue.1" variant="light" size="xl">
                      <MdScience color="blue" size={24} />
                    </ThemeIcon>
                    <Box>
                      <Text fw={700}>Fertigation Logic</Text>
                      <Text fz="xs" c="dimmed">
                        Schedule nutrient delivery
                      </Text>
                    </Box>
                  </Group>
                  <Switch
                    {...form.getInputProps("fertigationEnabled", {
                      type: "checkbox",
                    })}
                  />
                </Group>
                <Stack
                  gap="md"
                  style={{ opacity: form.values.fertigationEnabled ? 1 : 0.5 }}
                >
                  <NumberInput
                    label="Frequency (Days)"
                    {...form.getInputProps("fertigationIntervalDays")}
                  />
                  <NumberInput
                    label="Dosing Duration (mins)"
                    {...form.getInputProps("fertigationDuration")}
                  />
                  <Divider label="Fertigation Window" labelPosition="center" />
                  <Group grow>
                    <TimeInput
                      label="Start"
                      {...form.getInputProps("fertigationWindowStart")}
                    />
                    <TimeInput
                      label="End"
                      {...form.getInputProps("fertigationWindowEnd")}
                    />
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
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
                      key: "reduceOnHighHumidity" as const,
                      icon: <MdOpacity size={16} color="#0ea5e9" />,
                      label: "Reduce on High Humidity",
                      desc: "Decrease run time when humidity exceeds 80%",
                    },
                    {
                      key: "increaseOnHighTemp" as const,
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
                          {...form.getInputProps(rule.key, {
                            type: "checkbox",
                          })}
                          color="green"
                        />
                      </Group>
                      {i < arr.length - 1 && <Divider color="#F0F4EC" />}
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Grid.Col>

            {/* Summary Preview */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                withBorder
                radius="md"
                p="xl"
                //className={classes.summaryCard}
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
                    `Stop after ${form.values.maxIrrigationTime} minutes max`,
                    `Irrigation window: ${form.values.irrigationWindowStart} - ${form.values.irrigationWindowEnd}`,
                    `Fertigation window: ${form.values.fertigationWindowStart} - ${form.values.fertigationWindowEnd}`,
                    form.values.stopOnRain && "Stop if rain detected",
                    form.values.reduceOnHighHumidity &&
                      "Reduce time when humidity > 80%",
                    form.values.increaseOnHighTemp &&
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

              {/* Dynamic Action Button */}
              <Button
                type="submit"
                size="lg"
                fullWidth
                mt="xl"
                color={isExisting ? "blue" : "green"}
                loading={saving}
                leftSection={
                  isExisting ? <MdEdit size={20} /> : <MdSave size={20} />
                }
                style={{ transition: "all 0.3s ease" }}
              >
                {isExisting
                  ? "Update System Settings"
                  : "Deploy Initial Settings"}
              </Button>
            </Grid.Col>
          </Grid>
        </form>
      </Box>
    </Box>
  );
}
