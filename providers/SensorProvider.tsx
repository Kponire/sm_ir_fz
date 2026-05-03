"use client";

import { useEffect } from "react";
import { useMqtt } from "@/hooks/useMqtt";
import { useSensorStore } from "@/store/useSensorStore";

export default function SensorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: liveMqttData } = useMqtt("farm/sensors/reading");
  const setData = useSensorStore((s) => s.setData);

  useEffect(() => {
    if (liveMqttData) {
      setData({
        ...liveMqttData,
        systemStatus: "online",
        updatedAt: new Date().toISOString(),
      });
    }
  }, [liveMqttData, setData]);

  useEffect(() => {
    const interval = setInterval(() => {
      const state = useSensorStore.getState();
      if (state.lastSeen && Date.now() - state.lastSeen > 10000) {
        useSensorStore.setState({ isOnline: false });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
