// src/app/(dashboard)/dashboard/reports/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Grid, Card, Text, Box, Group, Button, Badge, Paper, 
  Stack, Table, Tabs, Select, ActionIcon, Loader, Center,
  ThemeIcon
} from "@mantine/core";
import { MdSearchOff, MdRefresh, MdDownload, MdPrint, MdHistory, MdWaterDrop, MdBarChart } from "react-icons/md";
import { PageHeader, StatCard } from "@/components/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import classes from "./reports.module.css";

// --- Types ---
interface IrrigationRecord {
  $id: string;
  recordType: "irrigation" | "fertigation";
  startTime: string;
  duration: number;
  waterUsed: number;
  fertilizerUsed?: number;
  triggeredBy: "schedule" | "automation" | "manual";
  zone: string;
}

export default function ReportsPage() {
  useRequireAuth();
  
  // --- State Management ---
  const [reports, setReports] = useState<IrrigationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterZone, setFilterZone] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // --- Data Fetching ---
  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reports"); // Adjust path to your reports GET route
      const result = await response.json();
      if (result.success) {
        setReports(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // --- Derived State (Analytics) ---
  const filteredReports = useMemo(() => {
    return filterZone ? reports.filter(r => r.zone === filterZone) : reports;
  }, [reports, filterZone]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const waterToday = reports
      .filter(r => r.startTime.startsWith(today))
      .reduce((sum, r) => sum + (r.waterUsed || 0), 0);
    
    return { waterToday, totalCount: reports.length };
  }, [reports]);

  const EmptyState = () => (
    <Center py={80}>
      <Stack align="center" gap="xs">
        <ThemeIcon size={60} radius="xl" color="gray" variant="light">
          <MdSearchOff size={30} />
        </ThemeIcon>
        <Text fw={700} fz="lg" mt="md">No Reports Yet</Text>
        <Text c="dimmed" fz="sm" ta="center" maw={300}>
          There are no irrigation or fertigation logs found in the database.
        </Text>
        <Button 
            variant="subtle" 
            color="brand" 
            leftSection={<MdRefresh size={16}/>}
            onClick={fetchReports}
        >
          Refresh Data
        </Button>
      </Stack>
    </Center>
  );

  return (
    <Box>
      <PageHeader
        title="Reports"
        breadcrumb="Analytics"
        subtitle="Water usage and irrigation history"
        actions={
          <Group gap="sm">
            <Button
              variant="outline"
              color="gray"
              leftSection={<MdRefresh size={16} />}
              onClick={fetchReports}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              leftSection={<MdDownload size={16} />}
              color="brand"
              onClick={() => {/* Implement CSV logic using reports state */}}
              disabled={reports.length === 0}
            >
              Export
            </Button>
          </Group>
        }
      />

      <Box p="xl">
        {loading ? (
          <Center py={100}><Loader color="brand" type="dots" /></Center>
        ) : reports.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Summary Cards */}
            <Grid gutter="md" mb="xl">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <StatCard 
                    label="Water Used Today" 
                    value={stats.waterToday} 
                    unit="L" 
                    accentColor="#46A908" 
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <StatCard 
                    label="Total Sessions" 
                    value={stats.totalCount} 
                    unit="cycles" 
                    accentColor="#2B601E" 
                />
              </Grid.Col>
            </Grid>

            <Tabs defaultValue="history" color="brand">
              <Tabs.List mb="xl">
                <Tabs.Tab value="history" leftSection={<MdHistory size={14} />}>
                  Irrigation History
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="history">
                <Card withBorder radius="md" p="md">
                  <Group justify="space-between" mb="md">
                    <Text fw={700}>Detailed Logs</Text>
                    <Select
                      placeholder="Filter Zone"
                      data={['Zone A', 'Zone B']}
                      value={filterZone}
                      onChange={setFilterZone}
                      clearable
                    />
                  </Group>

                  <Box style={{ overflowX: 'auto' }}>
                    <Table verticalSpacing="sm" highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Type</Table.Th>
                          <Table.Th>Date & Time</Table.Th>
                          <Table.Th>Zone</Table.Th>
                          <Table.Th>Duration</Table.Th>
                          <Table.Th>Water Used</Table.Th>
                          <Table.Th>Trigger</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {filteredReports.map((row) => (
                          <Table.Tr key={row.$id}>
                            <Table.Td>
                              <Badge color={row.recordType === 'fertigation' ? 'indigo' : 'blue'} variant="light">
                                {row.recordType}
                              </Badge>
                            </Table.Td>
                            <Table.Td>{new Date(row.startTime).toLocaleString()}</Table.Td>
                            <Table.Td><Badge color="gray" variant="outline">{row.zone}</Badge></Table.Td>
                            <Table.Td>{row.duration} min</Table.Td>
                            <Table.Td fw={600}>{row.waterUsed} L</Table.Td>
                            <Table.Td>
                              <Badge variant="dot" color={row.triggeredBy === 'manual' ? 'orange' : 'green'}>
                                {row.triggeredBy}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Box>
                </Card>
              </Tabs.Panel>
            </Tabs>
          </>
        )}
      </Box>
    </Box>
  );
}