// src/components/layout/DashboardShell.tsx
"use client";

import { useDisclosure } from "@mantine/hooks";
import {
  AppShell,
  Burger,
  Group,
  Text,
  Avatar,
  ActionIcon,
  Stack,
  NavLink,
  Divider,
  Badge,
  Tooltip,
  Menu,
  UnstyledButton,
  Box,
} from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MdDashboard,
  MdMonitor,
  MdTune,
  MdSchedule,
  MdBarChart,
  MdNotifications,
  MdPerson,
  MdSettings,
  MdPeople,
  MdDevices,
  MdArticle,
  MdWaterDrop,
  MdLogout,
  MdMenu,
  MdChevronRight,
} from "react-icons/md";
import { IoIosLeaf } from "react-icons/io";
import { useAuth } from "@/hooks/useAuth";
import styles from "./DashboardShell.module.css";
import Image from "next/image";
import { useSensorStore } from "@/store/useSensorStore";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const USER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <MdDashboard size={18} /> },
  {
    label: "Live Monitoring",
    href: "/dashboard/monitoring",
    icon: <MdMonitor size={18} />,
  },
  {
    label: "Control",
    href: "/dashboard/control",
    icon: <MdWaterDrop size={18} />,
  },
  {
    label: "Automation",
    href: "/dashboard/automation",
    icon: <MdTune size={18} />,
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: <MdBarChart size={18} />,
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: <MdNotifications size={18} />,
  },
  {
    label: "My Profile",
    href: "/dashboard/profile",
    icon: <MdPerson size={18} />,
  },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Admin Overview", href: "/admin", icon: <MdDashboard size={18} /> },
  { label: "Manage Users", href: "/admin/users", icon: <MdPeople size={18} /> },
  {
    label: "Manage Devices",
    href: "/admin/devices",
    icon: <MdDevices size={18} />,
  },
  {
    label: "Irrigation Records",
    href: "/admin/irrigation-logs",
    icon: <MdWaterDrop size={18} />,
  },
  { label: "System Logs", href: "/admin/logs", icon: <MdArticle size={18} /> },
  {
    label: "System Settings",
    href: "/admin/settings",
    icon: <MdSettings size={18} />,
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { isOnline } = useSensorStore();

  const isAdmin = user?.role === "admin";
  const navItems = isAdmin ? ADMIN_NAV : USER_NAV;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/admin") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <AppShell
      header={{ height: 62 }}
      navbar={{ width: 260, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding={0}
      styles={{
        root: { backgroundColor: "#F5F8F2" },
      }}
    >
      {/* ── HEADER ── */}
      <AppShell.Header
        style={{
          backgroundColor: "#1E2B18",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          {/* Left: Logo + Burger */}
          <Group gap="sm">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              color="white"
            />
            <Link
              href={isAdmin ? "/admin" : "/dashboard"}
              style={{ textDecoration: "none" }}
            >
              <Group gap="xs">
                <Image
                  src="/logo.png"
                  alt="Smart Irrigation Logo"
                  width={60}
                  height={60}
                  style={{ objectFit: "cover" }}
                />
                <Box visibleFrom="sm">
                  <Text
                    fw={800}
                    fz="xl"
                    c="white"
                    lh={1.1}
                    style={{ letterSpacing: "-0.3px" }}
                  >
                    Irrigation & Nutrient Mgt.
                  </Text>
                  <Text
                    fz={10}
                    c="rgba(255,255,255,0.45)"
                    style={{
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {isAdmin ? "Admin Console" : "Farm Dashboard"}
                  </Text>
                </Box>
              </Group>
            </Link>
          </Group>

          {/* Right: User Menu */}
          <Group gap="xs">
            {/* Online status */}
            <Box visibleFrom="sm">
              <Group gap={6}>
                <Box
                  className="status-dot-pulse"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: isOnline
                      ? "#91D956"
                      : "rgba(255,255,255,0.3)",
                  }}
                />
                <Text fz="xs" c="rgba(255,255,255,0.5)">
                  System {isOnline ? "Online" : "Offline"}
                </Text>
              </Group>
            </Box>

            <Divider
              orientation="vertical"
              color="rgba(255,255,255,0.1)"
              visibleFrom="sm"
            />

            <Menu shadow="md" width={210} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="sm">
                    <Avatar
                      size={34}
                      radius="xl"
                      style={{
                        backgroundColor: "#2B601E",
                        color: "#91D956",
                        fontWeight: 700,
                      }}
                    >
                      {initials}
                    </Avatar>
                    <Box visibleFrom="sm">
                      <Text fz="sm" fw={600} c="white" lh={1.2}>
                        {user?.name}
                      </Text>
                      <Text fz={11} c="rgba(255,255,255,0.45)">
                        {isAdmin ? "Administrator" : "Agriculturist"}
                      </Text>
                    </Box>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Signed in as</Menu.Label>
                <Menu.Item disabled>
                  <Text fz="xs" c="dimmed" truncate>
                    {user?.email}
                  </Text>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<MdPerson size={16} />}
                  onClick={() =>
                    router.push(
                      isAdmin ? "/admin/settings" : "/dashboard/profile",
                    )
                  }
                >
                  Profile & Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<MdLogout size={16} />}
                  onClick={logout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* ── SIDEBAR ── */}
      <AppShell.Navbar
        style={{
          backgroundColor: "#16200F",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Stack gap={0} h="100%">
          {/* Section label */}
          <Box px="md" pt="lg" pb="xs">
            <Text
              fz={10}
              fw={700}
              c="rgba(255,255,255,0.3)"
              style={{ letterSpacing: "1.5px", textTransform: "uppercase" }}
            >
              {isAdmin ? "Admin Menu" : "Navigation"}
            </Text>
          </Box>

          {/* Nav items */}
          <Stack gap={2} px="sm" style={{ flex: 1, overflowY: "auto" }}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={
                    <Text
                      fz="sm"
                      fw={active ? 600 : 400}
                      c={active ? "white" : "rgba(255,255,255,0.65)"}
                    >
                      {item.label}
                    </Text>
                  }
                  leftSection={
                    <Box
                      style={{
                        color: active ? "#91D956" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {item.icon}
                    </Box>
                  }
                  rightSection={
                    item.badge ? (
                      <Badge size="xs" color="brand" variant="filled">
                        {item.badge}
                      </Badge>
                    ) : active ? (
                      <MdChevronRight size={14} color="rgba(255,255,255,0.3)" />
                    ) : null
                  }
                  style={{
                    borderRadius: 8,
                    backgroundColor: active ? "#2B601E" : "transparent",
                    transition: "background-color 0.15s ease",
                  }}
                  styles={{
                    root: {
                      "&:hover": {
                        backgroundColor: active ? "#2B601E" : "#233018",
                      },
                    },
                  }}
                />
              );
            })}
          </Stack>

          {/* Bottom: Logout */}
          <Box px="sm" py="md">
            <Divider color="rgba(255,255,255,0.07)" mb="sm" />
            <NavLink
              label={
                <Text fz="sm" c="rgba(255,255,255,0.55)">
                  Logout
                </Text>
              }
              leftSection={
                <MdLogout size={18} color="rgba(255,255,255,0.35)" />
              }
              onClick={logout}
              style={{ borderRadius: 8 }}
              styles={{ root: { "&:hover": { backgroundColor: "#3d1010" } } }}
            />
          </Box>
        </Stack>
      </AppShell.Navbar>

      {/* ── MAIN CONTENT ── */}
      <AppShell.Main style={{ backgroundColor: "#F5F8F2" }}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
