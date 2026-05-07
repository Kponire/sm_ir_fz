// src/app/(dashboard)/dashboard/notifications/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
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
  Loader,
  Center,
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
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Notif {
  id: string;
  type: "critical" | "warning" | "success" | "info";
  title: string;
  body: string;
  $createdAt: string;
  read: boolean;
}

const INIT_NOTIFICATIONS: Notif[] = [
  {
    id: "1",
    type: "critical",
    title: "Low Water Level Detected",
    body: "Tank at 15% capacity. Refill required immediately to prevent pump damage.",
    $createdAt: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "warning",
    title: "Soil Moisture Critically Low",
    body: "Zone B moisture dropped to 18% - below the 40% threshold. Irrigation may be needed.",
    $createdAt: "15 min ago",
    read: false,
  },
  {
    id: "3",
    type: "success",
    title: "Irrigation Completed",
    body: "Morning cycle finished. Zone A and B received 91 L total over 35 minutes.",
    $createdAt: "1 hr ago",
    read: false,
  },
  {
    id: "4",
    type: "info",
    title: "Rain Detected",
    body: "Rainfall sensor triggered. Automatic irrigation paused until soil moisture drops below threshold.",
    $createdAt: "3 hrs ago",
    read: true,
  },
  {
    id: "5",
    type: "success",
    title: "Device Reconnected",
    body: "ESP-A4CF-1234 came back online after 2 minutes of connectivity loss.",
    $createdAt: "5 hrs ago",
    read: true,
  },
  {
    id: "6",
    type: "warning",
    title: "Pump Running Unusually Long",
    body: "Manual irrigation session exceeded 45 minutes. Auto-stop was triggered.",
    $createdAt: "Yesterday",
    read: true,
  },
  {
    id: "7",
    type: "critical",
    title: "Pump Failure Detected",
    body: "Flow rate dropped to 0 L/min while pump was ON. Check pump hardware.",
    $createdAt: "Yesterday",
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
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const fetchNotifications = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await fetch("/api/notifications");
      const result = await response.json();

      if (result.success) {
        // Map Appwrite documents to our Notif interface
        const mappedData: Notif[] = result.data.map((doc: any) => ({
          id: doc.$id,
          type: doc.type,
          title: doc.title,
          body: doc.body,
          $createdAt: dayjs(doc.$createdAt).fromNow(),
          read: doc.read,
        }));
        setNotifs(mappedData);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      notify.show({
        title: "Error",
        message: "Failed to load notifications",
        color: "red",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return;

    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifs((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
      }
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ markAll: true }),
      });

      if (res.ok) {
        setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
        notify.show({
          title: "Success",
          message: "All notifications marked as read.",
          color: "green",
        });
      }
    } catch (err) {
      notify.show({ title: "Error", message: "Action failed", color: "red" });
    }
  };

  const deleteNotif = async (id: string) => {
    if (deletingIds.includes(id)) return;

    setDeletingIds((prev) => [...prev, id]);

    try {
      const res = await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (result.success) {
        // Optimistically update the UI
        setNotifs((prev) => prev.filter((n) => n.id !== id));
        notify.show({
          title: "Deleted",
          message: "Notification removed successfully",
          color: "gray",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      notify.show({
        title: "Error",
        message: "Could not delete notification. Please try again.",
        color: "red",
      });
    } finally {
      setDeletingIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // --- DERIVED STATE ---
  const unreadCount = notifs.filter((n) => !n.read).length;
  const unread = notifs.filter((n) => !n.read);

  const NotifCard = ({ notif }: { notif: Notif }) => {
    const cfg = TYPE_CONFIG[notif.type];
    return (
      <Box
        className={`${classes.notifItem} ${!notif.read ? classes.notifUnread : ""}`}
        onClick={() => markRead(notif.id, notif.read)}
      >
        <Group align="flex-start" gap="md" wrap="nowrap">
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
                  {notif.$createdAt}
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

  const EmptyState = () => (
    <Box py={80} ta="center">
      <ThemeIcon variant="light" size={60} radius="xl" color="gray" mb="md">
        <MdNotifications size={30} />
      </ThemeIcon>
      <Text fw={600} c="#1E2B18">
        No Notifications Yet
      </Text>
      <Text fz="sm" c="dimmed">
        We'll notify you when something important happens on your farm.
      </Text>
    </Box>
  );

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
        {loading ? (
          <Center py={100}>
            <Loader color="brand" type="dots" />
          </Center>
        ) : notifs.length === 0 ? (
          <Paper withBorder radius="md" p="xl">
            <EmptyState />
          </Paper>
        ) : (
          <>
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
                    {notifs.filter((n) => n.type === "critical").length}{" "}
                    Critical
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
                <Card
                  withBorder
                  radius="md"
                  p={0}
                  style={{ overflow: "hidden" }}
                >
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
                              i < unread.length - 1
                                ? "1px solid #F0F4EC"
                                : "none",
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
                <Card
                  withBorder
                  radius="md"
                  p={0}
                  style={{ overflow: "hidden" }}
                >
                  <Stack gap={0}>
                    {notifs.map((n, i) => (
                      <Box
                        key={n.id}
                        style={{
                          borderBottom:
                            i < notifs.length - 1
                              ? "1px solid #F0F4EC"
                              : "none",
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
          </>
        )}
      </Box>
    </Box>
  );
}
