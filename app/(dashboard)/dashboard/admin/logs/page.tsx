// src/app/(dashboard)/admin/logs/page.tsx
"use client";

import { useState } from "react";
import {
  Box,
  Card,
  Table,
  Button,
  TextInput,
  Group,
  Text,
  Select,
  Badge,
  ActionIcon,
  Tooltip,
  Modal,
  Alert,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  MdSearch,
  MdFilterList,
  MdDeleteSweep,
  MdRefresh,
  MdError,
  MdInfoOutline,
  MdWarning,
  MdCheckCircle,
} from "react-icons/md";
import { PageHeader } from "@/components/ui";
import { useRequireAuth } from "@/hooks/useAuth";

interface LogRow {
  id: string;
  date: string;
  deviceId: string;
  eventType: string;
  description: string;
  severity: "info" | "warning" | "error" | "success";
}

const MOCK_LOGS: LogRow[] = [
  {
    id: "1",
    date: "2025-02-21 08:12:45",
    deviceId: "ESP-A4CF-1234",
    eventType: "device_connected",
    description: "Device came online. WiFi: FarmNet-5G, Signal: -65dBm",
    severity: "success",
  },
  {
    id: "2",
    date: "2025-02-21 08:13:02",
    deviceId: "ESP-A4CF-1234",
    eventType: "irrigation_started",
    description:
      "Zone A irrigation started. Duration: 20 min. Trigger: Schedule",
    severity: "info",
  },
  {
    id: "3",
    date: "2025-02-21 08:33:06",
    deviceId: "ESP-A4CF-1234",
    eventType: "irrigation_stopped",
    description: "Zone A irrigation completed. Water used: 28.5 L.",
    severity: "success",
  },
  {
    id: "4",
    date: "2025-02-21 09:00:11",
    deviceId: "ESP-B2DE-5678",
    eventType: "low_water",
    description:
      "Tank level dropped to 18%. Threshold: 20%. Alert sent to user.",
    severity: "warning",
  },
  {
    id: "5",
    date: "2025-02-21 09:14:30",
    deviceId: "ESP-C3FG-9012",
    eventType: "device_disconnected",
    description: "Device went offline. Last seen: 09:14. WiFi lost.",
    severity: "error",
  },
  {
    id: "6",
    date: "2025-02-21 10:05:00",
    deviceId: "ESP-B2DE-5678",
    eventType: "rain_detected",
    description:
      "Rain sensor triggered. Auto irrigation disabled per settings.",
    severity: "info",
  },
  {
    id: "7",
    date: "2025-02-21 10:22:17",
    deviceId: "ESP-A4CF-1234",
    eventType: "user_login",
    description: 'User "abubakar@farm.ng" logged in from 41.58.200.1',
    severity: "info",
  },
  {
    id: "8",
    date: "2025-02-21 11:30:00",
    deviceId: "ESP-B2DE-5678",
    eventType: "pump_failure",
    description: "Pump command sent but no flow detected after 30 seconds.",
    severity: "error",
  },
];

const SEVERITY_CONFIG: Record<
  string,
  { icon: React.ReactNode; bg: string; color: string; label: string }
> = {
  info: {
    icon: <MdInfoOutline size={14} />,
    bg: "#eff6ff",
    color: "#2563eb",
    label: "Info",
  },
  success: {
    icon: <MdCheckCircle size={14} />,
    bg: "#E6F4D9",
    color: "#2B601E",
    label: "Success",
  },
  warning: {
    icon: <MdWarning size={14} />,
    bg: "#fef9ee",
    color: "#d97706",
    label: "Warning",
  },
  error: {
    icon: <MdError size={14} />,
    bg: "#fef2f2",
    color: "#dc2626",
    label: "Error",
  },
};

export default function AdminLogsPage() {
  useRequireAuth("admin");
  const [logs, setLogs] = useState<LogRow[]>(MOCK_LOGS);
  const [search, setSearch] = useState("");
  const [filterDevice, setFilterDevice] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);

  const deviceOptions = [...new Set(MOCK_LOGS.map((l) => l.deviceId))].map(
    (d) => ({ value: d, label: d }),
  );

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.eventType.toLowerCase().includes(search.toLowerCase()) ||
      l.deviceId.toLowerCase().includes(search.toLowerCase());
    const matchDevice = !filterDevice || l.deviceId === filterDevice;
    const matchSeverity = !filterSeverity || l.severity === filterSeverity;
    return matchSearch && matchDevice && matchSeverity;
  });

  const handleClear = () => {
    setLogs([]);
    setClearOpen(false);
    notifications.show({
      title: "Logs Cleared",
      message: "All system logs have been cleared.",
      color: "orange",
    });
  };

  return (
    <Box>
      <PageHeader
        title="System Logs"
        breadcrumb="Admin"
        subtitle={`${logs.length} total log entries`}
        actions={
          <Group gap="sm">
            <Tooltip label="Refresh">
              <ActionIcon variant="light" color="brand" size="lg">
                <MdRefresh size={18} />
              </ActionIcon>
            </Tooltip>
            <Button
              leftSection={<MdDeleteSweep size={16} />}
              color="red"
              variant="light"
              onClick={() => setClearOpen(true)}
            >
              Clear Logs
            </Button>
          </Group>
        }
      />

      <Box p="xl">
        <Card withBorder radius="md" p={0}>
          {/* Filters */}
          <Box
            p="md"
            style={{
              borderBottom: "1px solid #E3EDD9",
              backgroundColor: "#FAFAF9",
            }}
          >
            <Group gap="sm" wrap="wrap">
              <TextInput
                placeholder="Search logs…"
                leftSection={<MdSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, minWidth: 220 }}
                radius="md"
              />
              <Select
                placeholder="Filter by device"
                data={[{ value: "", label: "All Devices" }, ...deviceOptions]}
                value={filterDevice}
                onChange={setFilterDevice}
                clearable
                leftSection={<MdFilterList size={16} />}
                style={{ minWidth: 180 }}
                radius="md"
              />
              <Select
                placeholder="Filter by type"
                data={[
                  { value: "info", label: "Info" },
                  { value: "success", label: "Success" },
                  { value: "warning", label: "Warning" },
                  { value: "error", label: "Error" },
                ]}
                value={filterSeverity}
                onChange={setFilterSeverity}
                clearable
                style={{ minWidth: 160 }}
                radius="md"
              />
            </Group>
          </Box>

          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead style={{ backgroundColor: "#FAFAF9" }}>
              <Table.Tr>
                {[
                  "Date & Time",
                  "Device ID",
                  "Event Type",
                  "Description",
                  "Level",
                ].map((h) => (
                  <Table.Th
                    key={h}
                    style={{
                      color: "#6b7280",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.length === 0 ? (
                <Table.Tr>
                  <Table.Td
                    colSpan={5}
                    style={{ textAlign: "center", padding: "48px 0" }}
                  >
                    <Text c="dimmed" fz="sm">
                      No logs found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filtered.map((log) => {
                  const sev = SEVERITY_CONFIG[log.severity];
                  return (
                    <Table.Tr key={log.id} className="table-row-hover">
                      <Table.Td>
                        <Text fz="xs" ff="monospace" c="#1E2B18">
                          {log.date}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text
                          fz="xs"
                          fw={600}
                          ff="monospace"
                          style={{
                            backgroundColor: "#F5F8F2",
                            padding: "2px 8px",
                            borderRadius: 5,
                          }}
                        >
                          {log.deviceId}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text
                          fz="xs"
                          fw={600}
                          c="#725438"
                          style={{ letterSpacing: "0.3px" }}
                        >
                          {log.eventType}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ maxWidth: 360 }}>
                        <Text fz="sm" c="#1E2B18" style={{ lineHeight: 1.5 }}>
                          {log.description}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Box
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            backgroundColor: sev.bg,
                            color: sev.color,
                            borderRadius: 6,
                            padding: "3px 8px",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {sev.icon}
                          {sev.label}
                        </Box>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>

          <Box
            p="sm"
            style={{
              borderTop: "1px solid #E3EDD9",
              backgroundColor: "#FAFAF9",
            }}
          >
            <Text fz="xs" c="dimmed">
              Showing {filtered.length} of {logs.length} entries
            </Text>
          </Box>
        </Card>
      </Box>

      {/* Clear Confirm */}
      <Modal
        opened={clearOpen}
        onClose={() => setClearOpen(false)}
        title={
          <Text fw={700} c="red">
            Clear All Logs
          </Text>
        }
        radius="md"
        size="sm"
      >
        <Alert icon={<MdError size={18} />} color="red" radius="md" mb="md">
          All {logs.length} log entries will be permanently deleted. This cannot
          be undone.
        </Alert>
        <Group justify="flex-end">
          <Button
            variant="light"
            color="gray"
            onClick={() => setClearOpen(false)}
          >
            Cancel
          </Button>
          <Button color="red" onClick={handleClear}>
            Clear All Logs
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
