const META_API_VERSION = "v21.0";
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

export function buildTextPayload(to: string, body: string) {
  return {
    messaging_product: "whatsapp" as const,
    to,
    type: "text" as const,
    text: { body },
  };
}

export async function sendWhatsAppMessage(
  to: string,
  body: string,
  phoneNumberId: string,
  accessToken: string
): Promise<{ messageId: string }> {
  const url = `${META_API_BASE}/${phoneNumberId}/messages`;
  const payload = buildTextPayload(to, body);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return { messageId: data.messages[0].id };
}
