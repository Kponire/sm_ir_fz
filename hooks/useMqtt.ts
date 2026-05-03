import mqtt from "mqtt";
import { useEffect, useState } from "react";

export const useMqtt = (topic: string) => {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "error">(
    "connecting",
  );

  useEffect(() => {
    // Note: Use the WSS (Websocket) URL for browser
    console.log(
      "Attempting MQTT connection to:",
      process.env.NEXT_PUBLIC_MQTT_BROKER_HOST,
    );
    const client = mqtt.connect(
      `wss://${process.env.NEXT_PUBLIC_MQTT_BROKER_HOST}:${process.env.NEXT_PUBLIC_MQTT_PORT}/mqtt`,
      {
        username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
        password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
        clientId: "nextjs_client_" + Math.random().toString(16).substring(2, 8),
        clean: true,
        rejectUnauthorized: false,
      },
    );

    client.on("connect", () => {
      console.log("MQTT Connected");
      setStatus("connected");
      client.subscribe(topic, (err) => {
        if (err) console.error("Sub error:", err);
      });
    });

    client.on("message", (t, msg) => {
      try {
        const parsed = JSON.parse(msg.toString());
        setData(parsed);
      } catch (e) {
        console.error("Payload not JSON:", msg.toString());
      }
    });

    client.on("error", (err) => {
      console.error("MQTT Error:", err);
      setStatus("error");
    });

    return () => {
      client.end();
    };
  }, [topic]);

  return { data, status };
};
