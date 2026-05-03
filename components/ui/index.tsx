// src/components/ui/index.tsx
"use client";

import {
  Card,
  Text,
  Group,
  Box,
  Badge,
  ThemeIcon,
  Skeleton,
} from "@mantine/core";
import type { ReactNode } from "react";

// ─── Page Header
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumb?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <Box
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #E3EDD9",
        padding: "20px 28px",
      }}
    >
      {breadcrumb && (
        <Text
          fz={11}
          fw={600}
          c="#A88D66"
          style={{ letterSpacing: "1px", textTransform: "uppercase" }}
          mb={4}
        >
          {breadcrumb}
        </Text>
      )}
      <Group justify="space-between" align="flex-start">
        <Box>
          <Text
            fw={800}
            fz={22}
            c="#1E2B18"
            style={{ letterSpacing: "-0.4px" }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text fz="sm" c="dimmed" mt={2}>
              {subtitle}
            </Text>
          )}
        </Box>
        {actions && <Group gap="sm">{actions}</Group>}
      </Group>
    </Box>
  );
}

// ─── Stat Card

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  iconColor?: string;
  trend?: { value: string; up: boolean } | null;
  accentColor?: string;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  iconColor = "#46A908",
  trend,
  accentColor = "#46A908",
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <Card
        withBorder
        radius="md"
        p="lg"
        style={{ borderLeft: `4px solid ${accentColor}` }}
      >
        <Skeleton height={16} width="60%" mb={12} />
        <Skeleton height={36} width="40%" mb={8} />
        <Skeleton height={12} width="50%" />
      </Card>
    );
  }

  return (
    <Card
      withBorder
      radius="md"
      p="lg"
      //className="card-hover"
      style={{
        //borderLeft: `4px solid ${accentColor}`,
        backgroundColor: "#ffffff",
      }}
    >
      <Group justify="space-between" align="flex-start">
        <Box>
          <Text
            fz="xs"
            fw={600}
            c="dimmed"
            style={{ textTransform: "uppercase", letterSpacing: "0.8px" }}
            mb={8}
          >
            {label}
          </Text>
          {label === "Water Tank" ? (
            <Group align="baseline" gap={4}>
              <Text
                fw={800}
                fz={32}
                c="#1E2B18"
                style={{ letterSpacing: "-1px", lineHeight: 1 }}
              >
                {value ? "Filled" : "Empty"}
              </Text>
            </Group>
          ) : (
            <Group align="baseline" gap={4}>
              <Text
                fw={800}
                fz={32}
                c="#1E2B18"
                style={{ letterSpacing: "-1px", lineHeight: 1 }}
              >
                {value}
              </Text>
              {unit && (
                <Text fz="sm" c="dimmed" fw={500}>
                  {unit}
                </Text>
              )}
            </Group>
          )}
          {trend && (
            <Group gap={4} mt={8}>
              <Text fz="xs" fw={600} c={trend.up ? "green" : "red"}>
                {trend.up ? "↑" : "↓"} {trend.value}
              </Text>
              <Text fz="xs" c="dimmed">
                vs yesterday
              </Text>
            </Group>
          )}
        </Box>
        {icon && (
          <ThemeIcon
            size={44}
            radius="md"
            style={{ /*backgroundColor: `${iconColor}15`,*/ color: iconColor }}
            variant="white"
          >
            {icon}
          </ThemeIcon>
        )}
      </Group>
    </Card>
  );
}

// ─── Status Badge

interface StatusBadgeProps {
  status:
    | "online"
    | "offline"
    | "warning"
    | "active"
    | "inactive"
    | "suspended";
  size?: "xs" | "sm" | "md";
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> =
  {
    online: { label: "Online", color: "#2B601E", bg: "#E6F4D9" },
    offline: { label: "Offline", color: "#dc2626", bg: "#fef2f2" },
    warning: { label: "Warning", color: "#d97706", bg: "#fef9ee" },
    active: { label: "Active", color: "#2B601E", bg: "#E6F4D9" },
    inactive: { label: "Inactive", color: "#6b7280", bg: "#f3f4f6" },
    suspended: { label: "Suspended", color: "#dc2626", bg: "#fef2f2" },
  };

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.inactive;
  return (
    <Box
      component="span"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        backgroundColor: cfg.bg,
        color: cfg.color,
        borderRadius: 6,
        padding: size === "xs" ? "2px 7px" : "4px 10px",
        fontSize: size === "xs" ? 11 : 12,
        fontWeight: 600,
        letterSpacing: "0.2px",
      }}
      ff="var(--font-nunito), sans-serif"
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: cfg.color,
          display: "inline-block",
        }}
      />
      {cfg.label}
    </Box>
  );
}

// ─── Sensor Reading Card

interface SensorCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: ReactNode;
  status?: "good" | "warning" | "danger";
  barPct?: number;
  accentColor?: string;
  loading?: boolean;
}

const SENSOR_STATUS_COLOR: Record<string, string> = {
  good: "#46A908",
  warning: "#d97706",
  danger: "#dc2626",
};

export function SensorCard({
  label,
  value,
  unit,
  icon,
  status = "good",
  barPct,
  accentColor = "#46A908",
  loading = false,
}: SensorCardProps) {
  const statusColor = SENSOR_STATUS_COLOR[status];

  if (loading) {
    return (
      <Card withBorder radius="md" p="md">
        <Skeleton height={14} width="70%" mb={10} />
        <Skeleton height={28} width="40%" mb={8} />
        <Skeleton height={6} radius="xl" />
      </Card>
    );
  }

  return (
    <Card
      withBorder
      radius="md"
      p="md"
      className="card-hover"
      style={{ backgroundColor: "#ffffff" }}
    >
      <Group justify="space-between" mb={8}>
        <Text
          fz="xs"
          fw={600}
          c="dimmed"
          style={{ textTransform: "uppercase", letterSpacing: "0.7px" }}
        >
          {label}
        </Text>
        <Box style={{ color: accentColor }}>{icon}</Box>
      </Group>

      <Group align="baseline" gap={4} mb={10}>
        <Text fw={800} fz={28} c="#1E2B18" style={{ letterSpacing: "-0.8px" }}>
          {value}
        </Text>
        <Text fz="sm" c="dimmed">
          {unit}
        </Text>
      </Group>

      {barPct !== undefined && (
        <Box
          style={{
            backgroundColor: "#F0F4EC",
            borderRadius: 4,
            height: 6,
            overflow: "hidden",
          }}
        >
          <Box
            style={{
              height: "100%",
              width: `${Math.min(barPct, 100)}%`,
              backgroundColor: statusColor,
              borderRadius: 4,
              transition: "width 0.6s ease",
            }}
          />
        </Box>
      )}

      <Box mt={8}>
        <Badge
          size="xs"
          style={{
            backgroundColor: `${statusColor}15`,
            color: statusColor,
            fontWeight: 600,
          }}
        >
          {status === "good"
            ? "Normal"
            : status === "warning"
              ? "Low"
              : "Critical"}
        </Badge>
      </Box>
    </Card>
  );
}

// ─── Section Title

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text
      fw={700}
      fz="sm"
      c="#1E2B18"
      style={{
        letterSpacing: "-0.1px",
        paddingBottom: 10,
        borderBottom: "2px solid #46A908",
        display: "inline-block",
        marginBottom: 16,
      }}
    >
      {children}
    </Text>
  );
}

// ─── Empty State
export function EmptyState({
  message,
  icon,
}: {
  message: string;
  icon: ReactNode;
}) {
  return (
    <Box py={48} ta="center">
      <Box style={{ color: "#C5D9B4", marginBottom: 12 }}>{icon}</Box>
      <Text fz="sm" c="dimmed">
        {message}
      </Text>
    </Box>
  );
}
