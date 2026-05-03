// src/app/(dashboard)/dashboard/notifications/page.tsx
"use client";

import { useState } from "react";
import {
  Card,
  Text,
  Box,
  Group,
  Button,
  Badge,
  ActionIcon,
  Stack,
  Paper,
  Tabs,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { notifications as notify } from "@mantine/notifications";
import {
  MdNotifications,
  MdCheckCircle,
  MdWarning,
  MdError,
  MdInfo,
  MdDelete,
  MdDoneAll,
  MdRefresh,
} from "react-icons/md";
import { PageHeader } from "@/components/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import classes from "./notifications.module.css";

interface Notif {
  id: string;
  type: "critical" | "warning" | "success" | "info";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INIT_NOTIFICATIONS: Notif[] = [
  {
    id: "1",
    type: "critical",
    title: "Low Water Level Detected",
    body: "Tank at 15% capacity. Refill required immediately to prevent pump damage.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "warning",
    title: "Soil Moisture Critically Low",
    body: "Zone B moisture dropped to 18% - below the 40% threshold. Irrigation may be needed.",
    time: "15 min ago",
    read: false,
  },
  {
    id: "3",
    type: "success",
    title: "Irrigation Completed",
    body: "Morning cycle finished. Zone A and B received 91 L total over 35 minutes.",
    time: "1 hr ago",
    read: false,
  },
  {
    id: "4",
    type: "info",
    title: "Rain Detected",
    body: "Rainfall sensor triggered. Automatic irrigation paused until soil moisture drops below threshold.",
    time: "3 hrs ago",
    read: true,
  },
  {
    id: "5",
    type: "success",
    title: "Device Reconnected",
    body: "ESP-A4CF-1234 came back online after 2 minutes of connectivity loss.",
    time: "5 hrs ago",
    read: true,
  },
  {
    id: "6",
    type: "warning",
    title: "Pump Running Unusually Long",
    body: "Manual irrigation session exceeded 45 minutes. Auto-stop was triggered.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "7",
    type: "critical",
    title: "Pump Failure Detected",
    body: "Flow rate dropped to 0 L/min while pump was ON. Check pump hardware.",
    time: "Yesterday",
    read: true,
  },
];

const TYPE_CONFIG: Record<
  Notif["type"],
  { icon: React.ReactNode; bg: string; color: string; border: string }
> = {
  critical: {
    icon: <MdError size={18} />,
    bg: "#fef2f2",
    color: "#dc2626",
    border: "#fca5a5",
  },
  warning: {
    icon: <MdWarning size={18} />,
    bg: "#fef9ee",
    color: "#d97706",
    border: "#fcd34d",
  },
  success: {
    icon: <MdCheckCircle size={18} />,
    bg: "#f0fdf4",
    color: "#16a34a",
    border: "#86efac",
  },
  info: {
    icon: <MdInfo size={18} />,
    bg: "#eff6ff",
    color: "#2563eb",
    border: "#93c5fd",
  },
};

export default function NotificationsPage() {
  useRequireAuth();
  const [notifs, setNotifs] = useState<Notif[]>(INIT_NOTIFICATIONS);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markRead = (id: string) =>
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    notify.show({
      title: "Done",
      message: "All notifications marked as read.",
      color: "green",
    });
  };

  const deleteNotif = (id: string) =>
    setNotifs((prev) => prev.filter((n) => n.id !== id));

  const unread = notifs.filter((n) => !n.read);
  const read = notifs.filter((n) => n.read);

  const NotifCard = ({ notif }: { notif: Notif }) => {
    const cfg = TYPE_CONFIG[notif.type];
    return (
      <Box
        className={`${classes.notifItem} ${!notif.read ? classes.notifUnread : ""}`}
        onClick={() => markRead(notif.id)}
      >
        <Group align="flex-start" gap="md" wrap="nowrap">
          <ThemeIcon
            size={30}
            radius="xl"
            style={{
              backgroundColor: cfg.bg,
              color: cfg.color,
              border: `1px solid ${cfg.border}`,
              flexShrink: 0,
            }}
          >
            {cfg.icon}
          </ThemeIcon>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group
              justify="space-between"
              align="flex-start"
              wrap="nowrap"
              gap="sm"
            >
              <Box style={{ minWidth: 0 }}>
                <Group gap="xs" mb={2}>
                  <Text
                    fz="sm"
                    fw={notif.read ? 500 : 700}
                    c="#1E2B18"
                    style={{ letterSpacing: "-0.1px" }}
                  >
                    {notif.title}
                  </Text>
                  {!notif.read && (
                    <Box
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        backgroundColor: "#46A908",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </Group>
                <Text fz="sm" c="dimmed" lh={1.5}>
                  {notif.body}
                </Text>
                <Text fz="xs" c="dimmed" mt={6}>
                  {notif.time}
                </Text>
              </Box>
              <Group gap="xs" style={{ flexShrink: 0 }}>
                <Badge
                  size="md"
                  style={{
                    backgroundColor: cfg.bg,
                    color: cfg.color,
                    fontWeight: 700,
                    textTransform: "capitalize",
                  }}
                >
                  {notif.type}
                </Badge>
                <Tooltip label="Delete">
                  <ActionIcon
                    size="lg"
                    variant="subtle"
                    color="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotif(notif.id);
                    }}
                  >
                    <MdDelete size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Box>
        </Group>
      </Box>
    );
  };

  return (
    <Box>
      <PageHeader
        title="Notifications"
        breadcrumb="Alerts"
        subtitle="System alerts, device status, and irrigation events"
        actions={
          <Group gap="sm">
            <Button
              variant="light"
              color="brand"
              size="sm"
              leftSection={<MdRefresh size={16} />}
              onClick={() => {}}
            >
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                color="brand"
                size="sm"
                leftSection={<MdDoneAll size={16} />}
                onClick={markAllRead}
                style={{ backgroundColor: "#46A908" }}
              >
                Mark All Read
              </Button>
            )}
          </Group>
        }
      />

      <Box p="xl">
        {/* Summary bar */}
        <Paper
          withBorder
          radius="md"
          p="md"
          mb="xl"
          style={{ backgroundColor: "#ffffff", borderColor: "#E3EDD9" }}
        >
          <Group gap="xl">
            <Group gap="xs">
              <MdNotifications size={18} color="#46A908" />
              <Text fz="sm" fw={600} c="#1E2B18">
                {notifs.length} Total Alerts
              </Text>
            </Group>
            <Group gap="xs">
              <Box
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#dc2626",
                }}
              />
              <Text fz="sm" c="dimmed">
                {notifs.filter((n) => n.type === "critical").length} Critical
              </Text>
            </Group>
            <Group gap="xs">
              <Box
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#d97706",
                }}
              />
              <Text fz="sm" c="dimmed">
                {notifs.filter((n) => n.type === "warning").length} Warnings
              </Text>
            </Group>
            <Group gap="xs">
              <Box
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#46A908",
                }}
              />
              <Text fz="sm" c="dimmed">
                {unreadCount} Unread
              </Text>
            </Group>
          </Group>
        </Paper>

        <Tabs defaultValue="unread" color="brand">
          <Tabs.List mb="lg" ff="var(--font-nunito), sans-serif">
            <Tabs.Tab
              value="unread"
              rightSection={
                unreadCount > 0 ? (
                  <Badge
                    size="xs"
                    style={{
                      backgroundColor: "#46A908",
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount}
                  </Badge>
                ) : undefined
              }
            >
              Unread
            </Tabs.Tab>
            <Tabs.Tab value="all">All Notifications</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="unread">
            <Card withBorder radius="md" p={0} style={{ overflow: "hidden" }}>
              {unread.length === 0 ? (
                <Box py={56} ta="center">
                  <MdCheckCircle size={48} color="#C5D9B4" />
                  <Text fz="sm" c="dimmed" mt="sm">
                    You&apos;re all caught up!
                  </Text>
                </Box>
              ) : (
                <Stack gap={0}>
                  {unread.map((n, i) => (
                    <Box
                      key={n.id}
                      style={{
                        borderBottom:
                          i < unread.length - 1 ? "1px solid #F0F4EC" : "none",
                        padding: "17px 17px",
                      }}
                    >
                      <NotifCard notif={n} />
                    </Box>
                  ))}
                </Stack>
              )}
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="all">
            <Card withBorder radius="md" p={0} style={{ overflow: "hidden" }}>
              <Stack gap={0}>
                {notifs.map((n, i) => (
                  <Box
                    key={n.id}
                    style={{
                      borderBottom:
                        i < notifs.length - 1 ? "1px solid #F0F4EC" : "none",
                      padding: "17px 17px",
                    }}
                  >
                    <NotifCard notif={n} />
                  </Box>
                ))}
              </Stack>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Box>
  );
}
