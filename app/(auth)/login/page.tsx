// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TextInput,
  PasswordInput,
  Button,
  Checkbox,
  Paper,
  Title,
  Text,
  Anchor,
  Alert,
  Stack,
  Group,
  Box,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { MdError, MdLock, MdEmail, MdLogin } from "react-icons/md";
import { IoIosLeaf } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import { loginWithEmail, loginWithGoogle } from "@/lib/auth";
import classes from "./login.module.css";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({
    initialValues: { email: "", password: "", rememberMe: false },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Enter a valid email"),
      password: (v) =>
        v.length >= 6 ? null : "Password must be at least 6 characters",
    },
  });

  const handleLogin = async (values: typeof form.values) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      if (!res.ok) throw new Error("Login failed");
      // Fetch role to route correctly
      const userRes = await fetch("/api/auth/me");
      const data = await userRes.json();
      console.log(data);
      const isAdmin = data?.user?.labels?.includes("admin");
      router.replace(isAdmin ? "/admin" : "/dashboard");
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : "Invalid credentials. Please try again.";
      setError(msg.includes("Invalid") ? "Invalid email or password." : msg);
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
        message: "Google login failed.",
        color: "red",
      });
      setSsoLoading(false);
    }
  };

  return (
    <div className={classes.root}>
      {/* Left branding panel */}
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
                <Text fz="sm" c="rgba(255,255,255,0.72)" lh={1.5}>
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

      {/* Right form panel */}
      <div className={classes.formPanel}>
        <div className={classes.formInner}>
          {/* Mobile logo */}
          <Box className={classes.mobileLogo} hiddenFrom="md">
            <IoIosLeaf size={22} color="#46A908" />
            <Text fw={800} fz="lg" c="#1E2B18">
              Smart Irrigation
            </Text>
          </Box>

          <div className={classes.formHeader}>
            <Title order={2} className={classes.formTitle}>
              Login to Your Account
            </Title>
            <Text fz="sm" c="dimmed" mt={6}>
              Enter your credentials to access your dashboard
            </Text>
          </div>

          {error && (
            <Alert icon={<MdError size={18} />} color="red" radius="md" mb="md">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleLogin)}>
            <Stack gap="md">
              <TextInput
                label="Email Address"
                placeholder="you@example.com"
                leftSection={<MdEmail size={16} color="#A88D66" />}
                size="md"
                {...form.getInputProps("email")}
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                leftSection={<MdLock size={16} color="#A88D66" />}
                size="md"
                {...form.getInputProps("password")}
              />

              <Group justify="space-between" mt={-4}>
                <Checkbox
                  label="Remember me"
                  size="sm"
                  color="brand"
                  {...form.getInputProps("rememberMe", { type: "checkbox" })}
                />
                <Anchor href="/forgot-password" fz="sm" c="brand">
                  Forgot Password?
                </Anchor>
              </Group>

              <Button
                type="submit"
                fullWidth
                size="md"
                color="brand"
                loading={loading}
                leftSection={<MdLogin size={18} />}
                className={classes.loginBtn}
              >
                Login
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
            Continue with Google
          </Button>

          <Text ta="center" fz="sm" c="dimmed" mt="xl">
            Don&apos;t have an account?{" "}
            <Anchor href="/register" fw={600} c="#725438">
              Create Account
            </Anchor>
          </Text>
        </div>
      </div>
    </div>
  );
}
