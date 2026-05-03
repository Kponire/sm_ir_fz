"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Anchor,
  Alert,
  Stack,
  Box,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  MdError,
  MdLock,
  MdEmail,
  MdPerson,
  MdHowToReg,
  MdPhone,
} from "react-icons/md";
import { IoIosLeaf } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import { registerWithEmail, loginWithGoogle } from "@/lib/auth";
import classes from "../login/login.module.css";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },

    validate: {
      name: (v) => (v.length < 2 ? "Enter your full name" : null),
      email: (v) =>
        /^\S+@\S+\.\S+$/.test(v) ? null : "Enter a valid email address",
      phone: (v) => (v.length < 7 ? "Enter valid phone number" : null),
      password: (v) =>
        v.length >= 6 ? null : "Password must be at least 6 characters",
      confirmPassword: (v, values) =>
        v !== values.password ? "Passwords do not match" : null,
    },
  });

  const handleRegister = async (values: typeof form.values) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          role: "user",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      notifications.show({
        title: "Account created",
        message: "Your account was created successfully. Please login.",
        color: "green",
      });

      router.push("/login");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Registration failed";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSSO = async () => {
    setSsoLoading(true);

    try {
      await loginWithGoogle();
    } catch {
      notifications.show({
        title: "Error",
        message: "Google signup failed.",
        color: "red",
      });

      setSsoLoading(false);
    }
  };

  return (
    <div className={classes.root}>
      {/* LEFT BRAND PANEL */}
      <div className={classes.brandPanel}>
        <div className={classes.brandInner}>
          <Box className={classes.logoWrap}>
            <Image
              src="/logo.png"
              alt="Smart Irrigation Logo"
              width={90}
              height={90}
              style={{ objectFit: "cover" }}
            />
            {/* <IoIosLeaf size={32} color="#91D956" /> */}
          </Box>

          <Title order={1} className={classes.brandTitle}>
            Irrigation & Nutrient Mgt.
          </Title>

          <Text className={classes.brandSubtitle}>
            Intelligent water and nutrients management for modern farming
          </Text>

          <div className={classes.featureList}>
            {[
              "Real-time soil & weather monitoring",
              "Remote pump & zone control",
              "Automated irrigation scheduling",
              "Water usage analytics & reports",
              "Multi-farm & multi-user support",
            ].map((f) => (
              <div key={f} className={classes.featureItem}>
                <div className={classes.featureDot} />
                <Text fz="sm" c="rgba(255,255,255,0.72)">
                  {f}
                </Text>
              </div>
            ))}
          </div>

          <div className={classes.brandFooter}>
            <Text fz="xs" c="rgba(255,255,255,0.3)">
              © {new Date().getFullYear()} Irrigation & Nutrient Management
              Systems
            </Text>
          </div>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className={classes.formPanel}>
        <div className={classes.formInner}>
          <Box className={classes.mobileLogo} hiddenFrom="md">
            <IoIosLeaf size={22} color="#46A908" />
            <Text fw={800} fz="lg" c="#1E2B18">
              Smart Irrigation
            </Text>
          </Box>

          <div className={classes.formHeader}>
            <Title order={2} className={classes.formTitle}>
              Create Your Account
            </Title>

            <Text fz="sm" c="dimmed" mt={6}>
              Register to start managing your system
            </Text>
          </div>

          {error && (
            <Alert icon={<MdError size={18} />} color="red" radius="md" mb="md">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleRegister)}>
            <Stack gap="md">
              <TextInput
                label="Full Name"
                placeholder="John Doe"
                leftSection={<MdPerson size={16} color="#A88D66" />}
                {...form.getInputProps("name")}
              />

              <TextInput
                label="Email Address"
                placeholder="you@example.com"
                leftSection={<MdEmail size={16} color="#A88D66" />}
                {...form.getInputProps("email")}
              />

              <TextInput
                label="Phone Number"
                placeholder="+234..."
                leftSection={<MdPhone size={16} color="#A88D66" />}
                {...form.getInputProps("phone")}
              />

              <PasswordInput
                label="Password"
                placeholder="Create a password"
                leftSection={<MdLock size={16} color="#A88D66" />}
                {...form.getInputProps("password")}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Repeat password"
                leftSection={<MdLock size={16} color="#A88D66" />}
                {...form.getInputProps("confirmPassword")}
              />

              <Button
                type="submit"
                fullWidth
                size="md"
                color="brand"
                loading={loading}
                leftSection={<MdHowToReg size={18} />}
                className={classes.loginBtn}
              >
                Create Account
              </Button>
            </Stack>
          </form>

          <Divider
            label="or continue with"
            labelPosition="center"
            my="lg"
            color="gray.2"
          />

          <Button
            fullWidth
            size="md"
            variant="default"
            leftSection={<FcGoogle size={20} />}
            onClick={handleGoogleSSO}
            loading={ssoLoading}
            className={classes.googleBtn}
          >
            Sign up with Google
          </Button>

          <Text ta="center" fz="sm" c="dimmed" mt="xl">
            Already have an account?{" "}
            <Anchor href="/login" fw={600} c="#725438">
              Login
            </Anchor>
          </Text>
        </div>
      </div>
    </div>
  );
}
