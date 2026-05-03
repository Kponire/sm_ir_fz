// src/app/(dashboard)/admin/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Table,
  Button,
  TextInput,
  Group,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Modal,
  Stack,
  Select,
  Alert,
  Skeleton,
  Menu,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  MdPersonAdd,
  MdSearch,
  MdEdit,
  MdDelete,
  MdPause,
  MdPlayArrow,
  MdMoreVert,
  MdPerson,
  MdError,
} from "react-icons/md";
import { PageHeader, StatusBadge } from "@/components/ui";
import { useRequireAuth } from "@/hooks/useAuth";

interface UserRow {
  id: string;
  name: string;
  email: string;
  farmName: string;
  deviceId: string;
  role: "admin" | "user";
  status: "active" | "suspended";
  createdAt: string;
}

const MOCK_USERS: UserRow[] = [
  {
    id: "1",
    name: "Abubakar Musa",
    email: "abubakar@farm.ng",
    farmName: "Green Valley Farm",
    deviceId: "ESP-A4CF-1234",
    role: "user",
    status: "active",
    createdAt: "2024-11-01",
  },
  {
    id: "2",
    name: "Fatima Aliyu",
    email: "fatima@agro.ng",
    farmName: "Sahel Irrigation Co.",
    deviceId: "ESP-B2DE-5678",
    role: "user",
    status: "active",
    createdAt: "2024-11-14",
  },
  {
    id: "3",
    name: "Chukwuemeka Eze",
    email: "emeka@farm.ng",
    farmName: "Delta Farms Ltd",
    deviceId: "ESP-C3FG-9012",
    role: "user",
    status: "suspended",
    createdAt: "2024-12-03",
  },
  {
    id: "4",
    name: "Ngozi Okeke",
    email: "ngozi@irrigation.ng",
    farmName: "Eastern Agro Hub",
    deviceId: "",
    role: "user",
    status: "active",
    createdAt: "2025-01-10",
  },
];

export default function AdminUsersPage() {
  useRequireAuth("admin");
  const [users, setUsers] = useState<UserRow[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      farmName: "",
      deviceId: "",
    },
    validate: {
      name: (v) => (v.length >= 2 ? null : "Name is required"),
      email: (v) => (/^\S+@\S+$/.test(v) ? null : "Valid email required"),
      password: (v) => (!editUser && v.length < 8 ? "Min 8 characters" : null),
    },
  });

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.farmName.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    form.reset();
    setEditUser(null);
    setAddOpen(true);
  };

  const openEdit = (u: UserRow) => {
    setEditUser(u);
    form.setValues({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      farmName: u.farmName,
      deviceId: u.deviceId,
    });
    setAddOpen(true);
  };

  const handleSubmit = async (values: typeof form.values) => {
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800)); // simulate API
      if (editUser) {
        /* setUsers((p) =>
          p.map((u) => (u.id === editUser.id ? { ...u, ...values } : u)),
        ); */
        notifications.show({
          title: "User Updated",
          message: `${values.name} was updated.`,
          color: "green",
        });
      } else {
        const newUser: UserRow = {
          id: Date.now().toString(),
          ...values,
          role: values.role as "admin" | "user",
          status: "active",
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setUsers((p) => [newUser, ...p]);
        notifications.show({
          title: "User Added",
          message: `${values.name} was created.`,
          color: "green",
        });
      }
      setAddOpen(false);
    } catch {
      notifications.show({
        title: "Error",
        message: "Action failed.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSuspend = (u: UserRow) => {
    setUsers((p) =>
      p.map((r) =>
        r.id === u.id
          ? { ...r, status: r.status === "active" ? "suspended" : "active" }
          : r,
      ),
    );
    notifications.show({
      title: u.status === "active" ? "User Suspended" : "User Activated",
      message: `${u.name} was ${u.status === "active" ? "suspended" : "activated"}.`,
      color: u.status === "active" ? "orange" : "green",
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const u = users.find((r) => r.id === deleteId);
    setUsers((p) => p.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    notifications.show({
      title: "User Deleted",
      message: `${u?.name} was removed.`,
      color: "red",
    });
  };

  const rows = filtered.map((u) => (
    <Table.Tr
      key={u.id}
      style={{ transition: "background 0.15s" }}
      className="table-row-hover"
    >
      <Table.Td>
        <Group gap="sm">
          <Box
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: "#E6F4D9",
              color: "#2B601E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {u.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </Box>
          <Box>
            <Text fz="sm" fw={600} c="#1E2B18">
              {u.name}
            </Text>
            <Text fz="xs" c="dimmed">
              {u.email}
            </Text>
          </Box>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">
          {u.farmName || (
            <Text span c="dimmed" fz="xs">
              Not assigned
            </Text>
          )}
        </Text>
      </Table.Td>
      <Table.Td>
        {u.deviceId ? (
          <Text
            fz="xs"
            ff="monospace"
            style={{
              backgroundColor: "#F5F8F2",
              padding: "2px 8px",
              borderRadius: 5,
            }}
          >
            {u.deviceId}
          </Text>
        ) : (
          <Text fz="xs" c="dimmed">
            —
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Badge
          size="sm"
          style={{
            backgroundColor: u.role === "admin" ? "#f3f0ff" : "#E6F4D9",
            color: u.role === "admin" ? "#5b21b6" : "#2B601E",
            fontWeight: 600,
          }}
        >
          {u.role}
        </Badge>
      </Table.Td>
      <Table.Td>
        <StatusBadge status={u.status} />
      </Table.Td>
      <Table.Td>
        <Text fz="xs" c="dimmed">
          {u.createdAt}
        </Text>
      </Table.Td>
      <Table.Td>
        <Menu shadow="sm" width={160} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="sm">
              <MdMoreVert size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<MdEdit size={14} />}
              onClick={() => openEdit(u)}
            >
              Edit User
            </Menu.Item>
            <Menu.Item
              leftSection={
                u.status === "active" ? (
                  <MdPause size={14} />
                ) : (
                  <MdPlayArrow size={14} />
                )
              }
              color={u.status === "active" ? "orange" : "green"}
              onClick={() => toggleSuspend(u)}
            >
              {u.status === "active" ? "Suspend" : "Activate"}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={<MdDelete size={14} />}
              color="red"
              onClick={() => setDeleteId(u.id)}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box>
      <PageHeader
        title="Manage Users"
        breadcrumb="Admin"
        subtitle={`${users.length} registered users`}
        actions={
          <Button
            leftSection={<MdPersonAdd size={16} />}
            color="brand"
            onClick={openAdd}
          >
            Add User
          </Button>
        }
      />

      <Box p="xl">
        <Card withBorder radius="md" p={0}>
          {/* Toolbar */}
          <Box p="md" style={{ borderBottom: "1px solid #E3EDD9" }}>
            <TextInput
              placeholder="Search by name, email or farm…"
              leftSection={<MdSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 340 }}
              radius="md"
            />
          </Box>

          {/* Table */}
          <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead style={{ backgroundColor: "#FAFAF9" }}>
              <Table.Tr>
                <Table.Th
                  style={{
                    color: "#6b7280",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  User
                </Table.Th>
                <Table.Th
                  style={{
                    color: "#6b7280",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Farm
                </Table.Th>
                <Table.Th
                  style={{
                    color: "#6b7280",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Device ID
                </Table.Th>
                <Table.Th
                  style={{
                    color: "#6b7280",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Role
                </Table.Th>
                <Table.Th
                  style={{
                    color: "#6b7280",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Status
                </Table.Th>
                <Table.Th
                  style={{
                    color: "#6b7280",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Joined
                </Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td
                    colSpan={7}
                    style={{ textAlign: "center", padding: "40px 0" }}
                  >
                    <Text c="dimmed" fz="sm">
                      No users found matching &quot;{search}&quot;
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>

          {/* Footer count */}
          <Box
            p="sm"
            style={{
              borderTop: "1px solid #E3EDD9",
              backgroundColor: "#FAFAF9",
            }}
          >
            <Text fz="xs" c="dimmed">
              Showing {filtered.length} of {users.length} users
            </Text>
          </Box>
        </Card>
      </Box>

      {/* Add/Edit Modal */}
      <Modal
        opened={addOpen}
        onClose={() => setAddOpen(false)}
        title={
          <Text fw={700} fz="md" c="#1E2B18">
            {editUser ? "Edit User" : "Add New User"}
          </Text>
        }
        radius="md"
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Full Name"
              placeholder="e.g. Abubakar Musa"
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Email Address"
              placeholder="user@example.com"
              {...form.getInputProps("email")}
            />
            {!editUser && (
              <TextInput
                type="password"
                label="Password"
                placeholder="Min 8 characters"
                {...form.getInputProps("password")}
              />
            )}
            <TextInput
              label="Farm Name"
              placeholder="e.g. Green Valley Farm"
              {...form.getInputProps("farmName")}
            />
            <TextInput
              label="Device ID"
              placeholder="e.g. ESP-A4CF-1234"
              {...form.getInputProps("deviceId")}
            />
            <Select
              label="Role"
              data={[
                { value: "user", label: "Farmer (User)" },
                { value: "admin", label: "Administrator" },
              ]}
              {...form.getInputProps("role")}
            />
            <Group justify="flex-end" mt="sm">
              <Button
                variant="light"
                color="gray"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" color="brand" loading={submitting}>
                {editUser ? "Save Changes" : "Create User"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        opened={!!deleteId}
        onClose={() => setDeleteId(null)}
        title={
          <Text fw={700} c="red">
            Confirm Delete
          </Text>
        }
        radius="md"
        size="sm"
      >
        <Alert icon={<MdError size={18} />} color="red" radius="md" mb="md">
          This action is permanent and cannot be undone. All associated farm
          data will be removed.
        </Alert>
        <Group justify="flex-end">
          <Button
            variant="light"
            color="gray"
            onClick={() => setDeleteId(null)}
          >
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete}>
            Delete User
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
