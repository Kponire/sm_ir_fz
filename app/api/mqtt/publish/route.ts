import { NextRequest, NextResponse } from "next/server";
import mqtt from "mqtt";

let client: mqtt.MqttClient | null = null;

function getClient() {
  if (!client) {
    client = mqtt.connect(
      `wss://${process.env.NEXT_PUBLIC_MQTT_BROKER_HOST}:${process.env.NEXT_PUBLIC_MQTT_PORT}/mqtt`,
      {
        username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
        password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
        clientId: "nextjs_client_" + Math.random().toString(16).substring(2, 8),
        clean: true,
        rejectUnauthorized: false,
      },
    );
  }
  return client;
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { topic, payload } = await req.json();

    const mqttClient = getClient();

    return new Promise<Response>((resolve) => {
      mqttClient.publish(
        topic,
        JSON.stringify(payload),
        {
          qos: 1,
          retain: false,
        },
        (err) => {
          console.log("Error Route One", err);

          if (err) {
            resolve(NextResponse.json({ success: false }, { status: 500 }));
          } else {
            resolve(NextResponse.json({ success: true }));
          }
        },
      );

      mqttClient.on("error", (err) => {
        console.log("Error Route Two", err);
        mqttClient.end();

        resolve(
          NextResponse.json(
            { success: false, error: err.message },
            { status: 500 },
          ),
        );
      });
    });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
