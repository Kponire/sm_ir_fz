"use client";

import {
  Alert,
  Badge,
  Button,
  createTheme,
  NumberInput,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";

export const theme = createTheme({
  /* Put your mantine theme override here */
  fontFamily: "var(--font-nunito), sans-serif",
  components: {
    Text: Text.extend({
      defaultProps: {
        ff: "var(--font-nunito), sans-serif",
      },
    }),
    Button: Button.extend({
      defaultProps: {
        ff: "var(--font-nunito), sans-serif",
      },
    }),
    Badge: Badge.extend({
      defaultProps: {
        ff: "var(--font-nunito), sans-serif",
      },
    }),
    TextInput: TextInput.extend({
      defaultProps: {
        ff: "var(--font-nunito), sans-serif",
      },
    }),
    NumberInput: NumberInput.extend({
      defaultProps: {
        ff: "var(--font-nunito), sans-serif",
      },
    }),
    Select: Select.extend({
      defaultProps: {
        ff: "var(--font-nunito), sans-serif",
      },
    }),
    TimeInput: TimeInput.extend({
      defaultProps: {
        ff: "var(--font-nunito), sans-serif",
      },
    }),
    Alert: Alert.extend({
      defaultProps: {
        ff: "var(--font-nunito), sans-serif",
      },
    }),
    Notifications: Notifications.extend({
      defaultProps: {
        ff: "var(--font-nunito), sans-serif",
      },
    }),
  },
});
