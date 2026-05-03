// src/app/(dashboard)/admin/settings/page.tsx
"use client";

import { useState } from "react";
import {
  Box,
  Card,
  Button,
  TextInput,
  Group,
  Text,
  Stack,
  Switch,
  NumberInput,
  Divider,
  Alert,
  Badge,
  Paper,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  MdSave,
  MdWarning,
  MdSettings,
  MdPerson,
  MdSecurity,
  MdDevices,
  MdInfo,
} from "react-icons/md";
import { PageHeader } from "@/components/ui";
import { useRequireAuth } from "@/hooks/useAuth";

interface SystemSettings {
  defaultMoistureThreshold: number;
  defaultIrrigationDuration: number;
  enableRegistrations: boolean;
  maintenanceMode: boolean;
  maxDevicesPerUser: number;
  sessionTimeoutHours: number;
  alertEmailEnabled: boolean;
  alertSmsEnabled: boolean;
}

export default function AdminSettingsPage() {
  useRequireAuth("admin");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const form = useForm<SystemSettings>({
    initialValues: {
      defaultMoistureThreshold: 40,
      defaultIrrigationDuration: 30,
      enableRegistrations: false,
      maintenanceMode: false,
      maxDevicesPerUser: 3,
      sessionTimeoutHours: 24,
      alertEmailEnabled: true,
      alertSmsEnabled: false,
    },
  });

  const handleSave = async (values: SystemSettings) => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 900)); // simulate API
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
      notifications.show({
        title: "Settings Saved",
        message: "System settings have been updated successfully.",
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
        title="System Settings"
        breadcrumb="Admin"
        subtitle="Configure global system defaults and controls"
      />

      <Box p="xl">
        {form.values.maintenanceMode && (
          <Alert
            icon={<MdWarning size={18} />}
            color="orange"
            radius="md"
            mb="lg"
            title="Maintenance Mode Active"
          >
            The system is currently in maintenance mode. Users will see a
            maintenance notice when trying to access the dashboard.
          </Alert>
        )}

        {saved && (
          <Alert icon={<MdInfo size={18} />} color="green" radius="md" mb="lg">
            Settings saved successfully.
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSave)}>
          <Stack gap="lg">
            {/* Irrigation Defaults */}
            <Card withBorder radius="md" p="xl">
              <Group gap="sm" mb="lg">
                <Box
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: "#E6F4D9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdSettings size={18} color="#46A908" />
                </Box>
                <Box>
                  <Text fw={700} fz="md" c="#1E2B18">
                    Irrigation Defaults
                  </Text>
                  <Text fz="xs" c="dimmed">
                    Applied to new farms at registration
                  </Text>
                </Box>
              </Group>

              <Group gap="xl" wrap="wrap">
                <NumberInput
                  label="Default Moisture Threshold (%)"
                  description="Irrigation triggers below this level"
                  min={10}
                  max={90}
                  suffix="%"
                  style={{ flex: 1, minWidth: 220 }}
                  {...form.getInputProps("defaultMoistureThreshold")}
                />
                <NumberInput
                  label="Default Irrigation Duration (min)"
                  description="Applied when no schedule is set"
                  min={5}
                  max={480}
                  suffix=" min"
                  style={{ flex: 1, minWidth: 220 }}
                  {...form.getInputProps("defaultIrrigationDuration")}
                />
              </Group>
            </Card>

            {/* Access Control */}
            <Card withBorder radius="md" p="xl">
              <Group gap="sm" mb="lg">
                <Box
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdPerson size={18} color="#2563eb" />
                </Box>
                <Box>
                  <Text fw={700} fz="md" c="#1E2B18">
                    Access Control
                  </Text>
                  <Text fz="xs" c="dimmed">
                    User registration and session settings
                  </Text>
                </Box>
              </Group>

              <Stack gap="md">
                <Group
                  justify="space-between"
                  p="md"
                  style={{
                    backgroundColor: "#FAFAF9",
                    borderRadius: 10,
                    border: "1px solid #E3EDD9",
                  }}
                >
                  <Box>
                    <Text fz="sm" fw={600} c="#1E2B18">
                      Enable New Registrations
                    </Text>
                    <Text fz="xs" c="dimmed">
                      Allow new users to self-register via the signup page
                    </Text>
                  </Box>
                  <Switch
                    color="brand"
                    checked={form.values.enableRegistrations}
                    onChange={(e) =>
                      form.setFieldValue(
                        "enableRegistrations",
                        e.currentTarget.checked,
                      )
                    }
                  />
                </Group>

                <Group
                  justify="space-between"
                  p="md"
                  style={{
                    backgroundColor: form.values.maintenanceMode
                      ? "#fef9ee"
                      : "#FAFAF9",
                    borderRadius: 10,
                    border: `1px solid ${form.values.maintenanceMode ? "#fed7aa" : "#E3EDD9"}`,
                  }}
                >
                  <Box>
                    <Group gap="xs">
                      <Text fz="sm" fw={600} c="#1E2B18">
                        Maintenance Mode
                      </Text>
                      {form.values.maintenanceMode && (
                        <Badge size="xs" color="orange">
                          Active
                        </Badge>
                      )}
                    </Group>
                    <Text fz="xs" c="dimmed">
                      Disable user access while performing system maintenance
                    </Text>
                  </Box>
                  <Switch
                    color="orange"
                    checked={form.values.maintenanceMode}
                    onChange={(e) =>
                      form.setFieldValue(
                        "maintenanceMode",
                        e.currentTarget.checked,
                      )
                    }
                  />
                </Group>

                <Group gap="xl" wrap="wrap">
                  <NumberInput
                    label="Max Devices per User"
                    min={1}
                    max={20}
                    style={{ flex: 1, minWidth: 200 }}
                    {...form.getInputProps("maxDevicesPerUser")}
                  />
                  <NumberInput
                    label="Session Timeout (hours)"
                    min={1}
                    max={168}
                    suffix=" hrs"
                    style={{ flex: 1, minWidth: 200 }}
                    {...form.getInputProps("sessionTimeoutHours")}
                  />
                </Group>
              </Stack>
            </Card>

            {/* Notifications */}
            <Card withBorder radius="md" p="xl">
              <Group gap="sm" mb="lg">
                <Box
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: "#fef9ee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MdSecurity size={18} color="#d97706" />
                </Box>
                <Box>
                  <Text fw={700} fz="md" c="#1E2B18">
                    Alert Channels
                  </Text>
                  <Text fz="xs" c="dimmed">
                    How system alerts are delivered to users
                  </Text>
                </Box>
              </Group>

              <Stack gap="md">
                <Group
                  justify="space-between"
                  p="md"
                  style={{
                    backgroundColor: "#FAFAF9",
                    borderRadius: 10,
                    border: "1px solid #E3EDD9",
                  }}
                >
                  <Box>
                    <Text fz="sm" fw={600} c="#1E2B18">
                      Email Alerts
                    </Text>
                    <Text fz="xs" c="dimmed">
                      Send alerts via email (requires Appwrite Email provider)
                    </Text>
                  </Box>
                  <Switch
                    color="brand"
                    checked={form.values.alertEmailEnabled}
                    onChange={(e) =>
                      form.setFieldValue(
                        "alertEmailEnabled",
                        e.currentTarget.checked,
                      )
                    }
                  />
                </Group>
                <Group
                  justify="space-between"
                  p="md"
                  style={{
                    backgroundColor: "#FAFAF9",
                    borderRadius: 10,
                    border: "1px solid #E3EDD9",
                  }}
                >
                  <Box>
                    <Text fz="sm" fw={600} c="#1E2B18">
                      SMS Alerts
                    </Text>
                    <Text fz="xs" c="dimmed">
                      Send alerts via SMS (requires Twilio integration)
                    </Text>
                  </Box>
                  <Switch
                    color="brand"
                    checked={form.values.alertSmsEnabled}
                    onChange={(e) =>
                      form.setFieldValue(
                        "alertSmsEnabled",
                        e.currentTarget.checked,
                      )
                    }
                  />
                </Group>
              </Stack>
            </Card>

            {/* Save */}
            <Group justify="flex-end">
              <Button
                type="submit"
                size="md"
                color="brand"
                loading={saving}
                leftSection={<MdSave size={18} />}
                style={{ backgroundColor: "#46A908", fontWeight: 700 }}
                px="xl"
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
