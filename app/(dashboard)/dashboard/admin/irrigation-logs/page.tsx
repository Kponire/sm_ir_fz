// src/app/(dashboard)/admin/irrigation-logs/page.tsx
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
} from "@mantine/core";
import {
  MdSearch,
  MdFilterList,
  MdFileDownload,
  MdRefresh,
  MdWaterDrop,
} from "react-icons/md";
import { PageHeader } from "@/components/ui";
import { useRequireAuth } from "@/hooks/useAuth";

interface IrrigationRecord {
  id: string;
  user: string;
  farm: string;
  zone: string;
  startTime: string;
  durationMin: number;
  waterUsedL: number;
  trigger: "manual" | "schedule" | "automation";
}

const MOCK_RECORDS: IrrigationRecord[] = [
  {
    id: "1",
    user: "Abubakar Musa",
    farm: "Green Valley Farm",
    zone: "A",
    startTime: "2025-02-21 06:00",
    durationMin: 20,
    waterUsedL: 28.5,
    trigger: "schedule",
  },
  {
    id: "2",
    user: "Abubakar Musa",
    farm: "Green Valley Farm",
    zone: "B",
    startTime: "2025-02-21 06:30",
    durationMin: 15,
    waterUsedL: 19.2,
    trigger: "schedule",
  },
  {
    id: "3",
    user: "Fatima Aliyu",
    farm: "Sahel Irrigation Co.",
    zone: "A",
    startTime: "2025-02-21 07:15",
    durationMin: 25,
    waterUsedL: 34.0,
    trigger: "automation",
  },
  {
    id: "4",
    user: "Abubakar Musa",
    farm: "Green Valley Farm",
    zone: "A",
    startTime: "2025-02-20 17:00",
    durationMin: 30,
    waterUsedL: 42.1,
    trigger: "schedule",
  },
  {
    id: "5",
    user: "Fatima Aliyu",
    farm: "Sahel Irrigation Co.",
    zone: "C",
    startTime: "2025-02-20 17:30",
    durationMin: 10,
    waterUsedL: 12.8,
    trigger: "manual",
  },
  {
    id: "6",
    user: "Abubakar Musa",
    farm: "Green Valley Farm",
    zone: "B",
    startTime: "2025-02-20 06:30",
    durationMin: 15,
    waterUsedL: 20.5,
    trigger: "schedule",
  },
];

const TRIGGER_STYLES: Record<string, { bg: string; color: string }> = {
  manual: { bg: "#eff6ff", color: "#2563eb" },
  schedule: { bg: "#E6F4D9", color: "#2B601E" },
  automation: { bg: "#fef9ee", color: "#d97706" },
};

export default function AdminIrrigationLogsPage() {
  useRequireAuth("admin");
  const [records] = useState<IrrigationRecord[]>(MOCK_RECORDS);
  const [search, setSearch] = useState("");
  const [filterUser, setFilterUser] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string | null>(null);

  const userOptions = [...new Set(MOCK_RECORDS.map((r) => r.user))].map(
    (u) => ({ value: u, label: u }),
  );
  const dateOptions = [
    ...new Set(MOCK_RECORDS.map((r) => r.startTime.slice(0, 10))),
  ].map((d) => ({ value: d, label: d }));

  const filtered = records.filter((r) => {
    const matchSearch =
      r.user.toLowerCase().includes(search.toLowerCase()) ||
      r.farm.toLowerCase().includes(search.toLowerCase());
    const matchUser = !filterUser || r.user === filterUser;
    const matchDate = !filterDate || r.startTime.startsWith(filterDate);
    return matchSearch && matchUser && matchDate;
  });

  const totalWater = filtered
    .reduce((acc, r) => acc + r.waterUsedL, 0)
    .toFixed(1);
  const totalSessions = filtered.length;

  const exportCSV = () => {
    const header =
      "User,Farm,Zone,Start Time,Duration (min),Water Used (L),Trigger\n";
    const rows = filtered
      .map(
        (r) =>
          `"${r.user}","${r.farm}","${r.zone}","${r.startTime}",${r.durationMin},${r.waterUsedL},"${r.trigger}"`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "irrigation_records.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <PageHeader
        title="Irrigation Records"
        breadcrumb="Admin"
        subtitle={`${totalSessions} sessions · ${totalWater} L total water used`}
        actions={
          <Group gap="sm">
            <Tooltip label="Refresh">
              <ActionIcon variant="light" color="brand" size="lg">
                <MdRefresh size={18} />
              </ActionIcon>
            </Tooltip>
            <Button
              leftSection={<MdFileDownload size={16} />}
              variant="light"
              color="brand"
              onClick={exportCSV}
            >
              Export CSV
            </Button>
          </Group>
        }
      />

      <Box p="xl">
        {/* Summary */}
        <Group gap="md" mb="lg">
          {[
            { label: "Total Sessions", value: totalSessions, color: "#46A908" },
            { label: "Water Used", value: `${totalWater} L`, color: "#2563eb" },
            {
              label: "Avg Duration",
              value: `${filtered.length ? (filtered.reduce((a, r) => a + r.durationMin, 0) / filtered.length).toFixed(0) : 0} min`,
              color: "#d97706",
            },
          ].map((s) => (
            <Box
              key={s.label}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #E3EDD9",
                borderLeft: `4px solid ${s.color}`,
                borderRadius: 10,
                padding: "14px 20px",
                minWidth: 160,
              }}
            >
              <Text
                fz="xs"
                fw={600}
                c="dimmed"
                style={{ textTransform: "uppercase", letterSpacing: "0.7px" }}
                mb={4}
              >
                {s.label}
              </Text>
              <Text
                fw={800}
                fz={24}
                c="#1E2B18"
                style={{ letterSpacing: "-0.5px" }}
              >
                {s.value}
              </Text>
            </Box>
          ))}
        </Group>

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
                placeholder="Search by user or farm…"
                leftSection={<MdSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, minWidth: 200 }}
                radius="md"
              />
              <Select
                placeholder="Filter by user"
                data={[{ value: "", label: "All Users" }, ...userOptions]}
                value={filterUser}
                onChange={setFilterUser}
                clearable
                leftSection={<MdFilterList size={16} />}
                style={{ minWidth: 180 }}
                radius="md"
              />
              <Select
                placeholder="Filter by date"
                data={[{ value: "", label: "All Dates" }, ...dateOptions]}
                value={filterDate}
                onChange={setFilterDate}
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
                  "User / Farm",
                  "Zone",
                  "Start Time",
                  "Duration",
                  "Water Used",
                  "Trigger",
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
                    colSpan={6}
                    style={{ textAlign: "center", padding: "48px 0" }}
                  >
                    <Text c="dimmed" fz="sm">
                      No irrigation records found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filtered.map((r) => {
                  const trig = TRIGGER_STYLES[r.trigger];
                  return (
                    <Table.Tr key={r.id} className="table-row-hover">
                      <Table.Td>
                        <Text fz="sm" fw={600} c="#1E2B18">
                          {r.user}
                        </Text>
                        <Text fz="xs" c="dimmed">
                          {r.farm}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Box
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            backgroundColor: "#E6F4D9",
                            color: "#2B601E",
                            borderRadius: 6,
                            padding: "3px 10px",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          <MdWaterDrop size={12} />
                          Zone {r.zone}
                        </Box>
                      </Table.Td>
                      <Table.Td>
                        <Text fz="sm" ff="monospace">
                          {r.startTime}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fz="sm" fw={600}>
                          {r.durationMin} min
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fz="sm" fw={700} c="#2563eb">
                          {r.waterUsedL} L
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Box
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            backgroundColor: trig.bg,
                            color: trig.color,
                            borderRadius: 6,
                            padding: "3px 10px",
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        >
                          {r.trigger}
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
              Showing {filtered.length} of {records.length} records
            </Text>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
