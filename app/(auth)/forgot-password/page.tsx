// src/app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import {
  TextInput,
  Button,
  Paper,
  Title,
  Text,
  Anchor,
  Alert,
  Stack,
  Box,
  ThemeIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { MdEmail, MdCheckCircle, MdArrowBack, MdError } from "react-icons/md";
import { IoIosLeaf } from "react-icons/io";
import { sendPasswordRecovery } from "@/lib/auth";
import classes from "./forgot.module.css";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({
    initialValues: { email: "" },
    validate: {
      email: (v) =>
        /^\S+@\S+\.\S+$/.test(v) ? null : "Enter a valid email address",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError("");
    try {
      await sendPasswordRecovery(values.email);
      setSent(true);
    } catch {
      setError(
        "Could not send reset email. Please check the address and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.card}>
        {/* Logo */}
        <Box className={classes.logoRow}>
          <Box className={classes.logoIcon}>
            <IoIosLeaf size={22} color="#46A908" />
          </Box>
          <Text
            fw={700}
            fz="sm"
            c="#1E2B18"
            style={{ letterSpacing: "-0.2px" }}
          >
            Smart Irrigation
          </Text>
        </Box>

        {sent ? (
          /* ── Success State ── */
          <Stack align="center" gap="md" py="lg">
            <ThemeIcon size={64} radius="xl" color="brand" variant="light">
              <MdCheckCircle size={32} />
            </ThemeIcon>
            <Title
              order={3}
              ta="center"
              c="#1E2B18"
              style={{ letterSpacing: "-0.3px" }}
            >
              Check Your Email
            </Title>
            <Text fz="sm" c="dimmed" ta="center" maw={300}>
              We sent a password reset link to{" "}
              <Text span fw={600} c="#1E2B18">
                {form.values.email}
              </Text>
              . It expires in 1 hour.
            </Text>
            <Button
              component="a"
              href="/login"
              variant="light"
              color="brand"
              leftSection={<MdArrowBack size={16} />}
              mt="sm"
            >
              Back to Login
            </Button>
          </Stack>
        ) : (
          /* ── Form State ── */
          <>
            <div className={classes.header}>
              <Title order={2} className={classes.title}>
                Recover Your Account
              </Title>
              <Text fz="sm" c="dimmed" mt={6} lh={1.6}>
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </Text>
            </div>

            {error && (
              <Alert
                icon={<MdError size={18} />}
                color="red"
                radius="md"
                mb="md"
              >
                {error}
              </Alert>
            )}

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Email Address"
                  placeholder="your@email.com"
                  leftSection={<MdEmail size={16} color="#A88D66" />}
                  size="md"
                  {...form.getInputProps("email")}
                />
                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  color="brand"
                  loading={loading}
                  className={classes.submitBtn}
                >
                  Send Reset Link
                </Button>
              </Stack>
            </form>

            <Text ta="center" fz="sm" c="dimmed" mt="xl">
              <Anchor href="/login" fz="sm" c="brand" fw={500}>
                <Box
                  component="span"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <MdArrowBack size={14} />
                  Back to Login
                </Box>
              </Anchor>
            </Text>
          </>
        )}
      </div>
    </div>
  );
}
