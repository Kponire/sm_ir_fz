"use client";

import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  Text,
  Box,
  Group,
  Button,
  Avatar,
  TextInput,
  PasswordInput,
  Stack,
  Divider,
  ThemeIcon,
  Badge,
  Modal,
  Paper,
  Select,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

import {
  MdPerson,
  MdEdit,
  MdLock,
  MdLogout,
  MdSave,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdDevices,
  MdCheckCircle,
} from "react-icons/md";

import { PageHeader } from "@/components/ui";
import { useAuth, useRequireAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user } = useRequireAuth();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [farm, setFarm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);

  const [logoutModal, { open: openLogout, close: closeLogout }] =
    useDisclosure(false);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const profileForm = useForm({
    initialValues: {
      name: "",
      phone: "",
    },
  });

  const farmForm = useForm({
    initialValues: {
      name: "",
      location: "",
      deviceId: "",
      zones: 3,
      waterSource: "Tank",
    },
  });

  const loadProfile = async () => {
    const res = await fetch("/api/profile");
    const data = await res.json();

    if (data.success) {
      setProfile(data);
      setFarm(data.farm);

      profileForm.setValues({
        name: data.user.name,
        phone: data.meta?.phone || "",
      });

      if (data.farm) {
        farmForm.setValues(data.farm);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async (values: any) => {
    const res = await fetch("/api/profile/update", {
      method: "PATCH",
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (data.success) {
      notifications.show({
        title: "Profile Updated",
        message: "Saved successfully",
        color: "green",
      });
      setEditing(false);
      loadProfile();
    }
  };

  const saveFarm = async (values: any) => {
    const res = await fetch("/api/farm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await res.json();

    if (data.success) {
      notifications.show({
        title: "Farm Saved",
        message: "Farm information updated",
        color: "green",
      });
      setFarm(data.farm);
    }
  };

  if (loading) return <Text p="xl">Loading profile...</Text>;

  return (
    <Box>
      <PageHeader
        breadcrumb="Account"
        title="My Profile"
        subtitle="Manage your account information and preferences"
      />

      <Box p="xl">
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder p="xl" ta="center">
              <Avatar
                size={96}
                radius={48}
                mx="auto"
                mb="md"
                style={{
                  backgroundColor: "#2B601E",
                  fontSize: 32,
                  fontWeight: 800,
                  color: "#91D956",
                }}
              >
                {initials}
              </Avatar>

              <Text fw={700}>{profile.user.name}</Text>
              <Text size="sm" c="dimmed">
                {profile.user.email}
              </Text>

              <Badge
                mx="auto"
                mt={"5px"}
                style={{
                  backgroundColor:
                    user?.role === "admin" ? "#fef9ee" : "#E6F4D9",
                  color: user?.role === "admin" ? "#d97706" : "#2B601E",
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
              >
                {profile?.user?.role || "User"}
              </Badge>

              <Divider my="md" />

              <Stack>
                <Button
                  onClick={() => setEditing(!editing)}
                  leftSection={<MdEdit />}
                  style={{ backgroundColor: editing ? undefined : "#46A908" }}
                >
                  {editing ? "Cancel" : "Edit Profile"}
                </Button>

                <Button
                  color="red"
                  variant="light"
                  onClick={openLogout}
                  leftSection={<MdLogout />}
                >
                  Logout
                </Button>
              </Stack>
            </Card>

            <Card withBorder mt="lg">
              <Text fw={700} mb="md">
                Account Details
              </Text>

              <Stack>
                <Text size="sm">Email: {profile.user.email}</Text>
                <Text size="sm">Phone: {profile.meta?.phone || "Not set"}</Text>
                <Text size="sm">Farm: {farm?.name || "Not created"}</Text>
                <Text size="sm">Device: {farm?.deviceId || "Not linked"}</Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder p="xl">
              <Text fw={700} mb="lg">
                Personal Information
              </Text>

              <form onSubmit={profileForm.onSubmit(saveProfile)}>
                <Stack>
                  <TextInput
                    label="Full Name"
                    disabled={!editing}
                    {...profileForm.getInputProps("name")}
                  />

                  <TextInput
                    label="Phone"
                    disabled={!editing}
                    {...profileForm.getInputProps("phone")}
                  />

                  {editing && (
                    <Button type="submit" leftSection={<MdSave />}>
                      Save Profile
                    </Button>
                  )}
                </Stack>
              </form>

              <Divider my="xl" />

              <Text fw={700} mb="lg">
                Farm Information
              </Text>

              {!farm && (
                <Text c="dimmed" mb="md">
                  You have not registered a farm yet.
                </Text>
              )}

              <form onSubmit={farmForm.onSubmit(saveFarm)}>
                <Stack>
                  <TextInput
                    label="Farm Name"
                    {...farmForm.getInputProps("name")}
                  />

                  <TextInput
                    label="Farm Location"
                    {...farmForm.getInputProps("location")}
                  />

                  <TextInput
                    label="Device ID"
                    description="Printed on your irrigation controller"
                    {...farmForm.getInputProps("deviceId")}
                  />

                  <NumberInput
                    label="Zones"
                    min={1}
                    max={10}
                    {...farmForm.getInputProps("zones")}
                  />

                  <Select
                    label="Water Source"
                    data={["Tank", "Borehole", "Well", "River"]}
                    {...farmForm.getInputProps("waterSource")}
                  />

                  <Button
                    type="submit"
                    leftSection={<MdSave />}
                    style={{ backgroundColor: editing ? undefined : "#46A908" }}
                  >
                    {farm ? "Update Farm" : "Create Farm"}
                  </Button>
                </Stack>
              </form>

              <Divider my="xl" />

              <Paper p="md" withBorder>
                <Group>
                  <MdCheckCircle color="green" />
                  <Text size="sm">
                    Account created{" "}
                    {new Date(profile.user.$createdAt).toLocaleDateString()}
                  </Text>
                </Group>
              </Paper>
            </Card>
          </Grid.Col>
        </Grid>
      </Box>

      <Modal opened={logoutModal} onClose={closeLogout} title="Confirm Logout">
        <Text mb="lg">Are you sure you want to logout?</Text>

        <Group justify="flex-end">
          <Button variant="light" onClick={closeLogout}>
            Cancel
          </Button>
          <Button color="red" onClick={logout}>
            Logout
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
