// src/app/layout.tsx
import type { Metadata } from "next";
import { JetBrains_Mono, Nunito_Sans } from "next/font/google";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { theme } from "@/theme";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "./globals.css";
import SensorProvider from "@/providers/SensorProvider";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Smart Irrigation Dashboard",
    template: "%s | Smart Irrigation",
  },
  description:
    "Professional IoT-powered smart irrigation management system for farms.",
  keywords: ["irrigation", "IoT", "smart farming", "ESP8266", "agriculture"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body className={`${nunitoSans.variable} ${jetbrainsMono.variable}`}>
        <MantineProvider theme={theme}>
          <ModalsProvider>
            <Notifications position="top-right" limit={5} />
            <SensorProvider>{children}</SensorProvider>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
