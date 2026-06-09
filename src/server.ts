import "./lib/error-capture";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

const VoiceBotSchema = z.object({
  room_id: z.string().uuid().optional().nullable(),
  to_phone: z.string().optional().nullable(),
  caller_phone: z.string(),
  transcript: z.string().optional().nullable(),
  audio_url: z.string().url().optional().nullable(),
});

async function sendLineNotification(lineId: string, message: string, accessToken: string) {
  if (!lineId || !accessToken) return;
  try {
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        to: lineId,
        messages: [{ type: "text", text: message }],
      }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`LINE API error (${res.status}):`, errorText);
    }
  } catch (err) {
    console.error("Failed to send LINE notification:", err);
  }
}

async function sendEmailNotification(email: string, subject: string, content: string, apiKey: string) {
  if (!email || !apiKey) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Modern Trust <notifications@moderntrust.com>",
        to: [email],
        subject: subject,
        text: content,
      }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Email API error (${res.status}):`, errorText);
    }
  } catch (err) {
    console.error("Failed to send Email notification:", err);
  }
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    // Handle VoiceBot Webhook
    if (url.pathname === "/api/webhook/voicebot" && request.method === "POST") {
      try {
        const body = await request.json();
        const result = VoiceBotSchema.safeParse(body);

        if (!result.success) {
          return new Response(JSON.stringify({ error: result.error.format() }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const { room_id, to_phone, caller_phone, transcript, audio_url } = result.data;

        // Ensure we have at least room_id or to_phone to identify the landlord
        if (!room_id && !to_phone) {
          return new Response(JSON.stringify({ error: "Missing room_id or to_phone" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        // Get env variables (bindings)
        const supabaseUrl = (env as any).VITE_SUPABASE_URL || "";
        const supabaseKey = (env as any).VITE_SUPABASE_ANON_KEY || "";

        if (!supabaseUrl || !supabaseKey) {
          return new Response(JSON.stringify({ error: "Supabase configuration missing" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Verify if room exists (if room_id provided)
        if (room_id) {
          const { data: room, error: roomError } = await supabase
            .from("rooms")
            .select("room_id")
            .eq("room_id", room_id)
            .single();

          if (roomError || !room) {
            return new Response(JSON.stringify({ error: "Room not found" }), {
              status: 404,
              headers: { "content-type": "application/json" },
            });
          }
        }

        // 2. Insert the lead
        const { error: insertError } = await supabase
          .from("voice_leads")
          .insert([
            {
              room_id: room_id || null,
              to_phone: to_phone || null,
              caller_phone,
              transcript,
              audio_url,
              status: "new",
            },
          ]);

        if (insertError) {
          console.error("Supabase insert error:", insertError);
          return new Response(JSON.stringify({ error: "Failed to record lead" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        // 3. Notify Owner (Async)
        const notificationTask = (async () => {
          try {
            let owner: any = null;
            let roomName: string = "เบอร์รับสายเสมือน";

            if (room_id) {
              // Strategy A: Find owner via room_id
              const { data: ownerData, error: ownerError } = await supabase
                .from("rooms")
                .select(`
                  listing_title,
                  buildings (
                    building_name,
                    users (
                      email,
                      name,
                      line_id,
                      notify_email,
                      notify_line
                    )
                  )
                `)
                .eq("room_id", room_id)
                .single();

              if (!ownerError && ownerData) {
                const building = ownerData.buildings as any;
                owner = building?.users as any;
                roomName = ownerData.listing_title || building?.building_name || "ห้องของคุณ";
              }
            }

            if (!owner && to_phone) {
              // Strategy B: Find owner via virtual_phone (The Virtual Receptionist)
              const { data: userData, error: userError } = await supabase
                .from("users")
                .select("email, name, line_id, notify_email, notify_line")
                .eq("virtual_phone", to_phone)
                .single();

              if (!userError && userData) {
                owner = userData;
                roomName = `สายเรียกเข้าจากเบอร์เสมือน (${to_phone})`;
              }
            }

            if (!owner) {
              console.log(`No owner found for room ${room_id || 'N/A'} or virtual phone ${to_phone || 'N/A'}`);
              return;
            }

            const message = `📢 มีผู้สนใจติดต่อมาทาง VoiceBot!\n\n🏢 สำหรับ: ${roomName}\n📞 เบอร์ผู้ติดต่อ: ${caller_phone}\n💬 ข้อความ: ${transcript || "-"}\n🎧 ฟังเสียงบันทึก: ${audio_url || "-"}`;

            const promises = [];

            // LINE Notification
            if (owner.notify_line && owner.line_id) {
              const lineToken = (env as any).LINE_CHANNEL_ACCESS_TOKEN;
              if (lineToken) {
                promises.push(sendLineNotification(owner.line_id, message, lineToken));
              } else {
                console.warn("LINE_CHANNEL_ACCESS_TOKEN is missing");
              }
            }

            // Email Notification
            if (owner.notify_email && owner.email) {
              const emailApiKey = (env as any).RESEND_API_KEY;
              if (emailApiKey) {
                promises.push(
                  sendEmailNotification(
                    owner.email,
                    "📞 มีผู้สนใจห้องพักใหม่จาก VoiceBot!",
                    message,
                    emailApiKey,
                  ),
                );
              } else {
                console.warn("RESEND_API_KEY is missing");
              }
            }

            if (promises.length === 0) {
              console.log(`No notification channels enabled or available for owner ${owner.name}`);
            } else {
              await Promise.allSettled(promises);
            }
          } catch (notifErr) {
            console.error("Notification process failed:", notifErr);
          }
        })();

        // Use ctx.waitUntil if available (Cloudflare Workers)
        if (ctx && typeof (ctx as any).waitUntil === "function") {
          (ctx as any).waitUntil(notificationTask);
        } else {
          // Fallback: wait for it to finish if not in a worker environment that supports waitUntil
          await notificationTask;
        }

        return new Response(
          JSON.stringify({ success: true, message: "Lead recorded successfully" }),
          {
            status: 201,
            headers: { "content-type": "application/json" },
          },
        );
      } catch (err) {
        console.error("Webhook processing error:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
