import httpx


async def send_push_notification(expo_push_token: str, title: str, body: str) -> None:
    """Expo's push service is a plain HTTP endpoint — no Firebase/APNs
    setup needed on our side, Expo handles that translation."""
    async with httpx.AsyncClient() as client:
        await client.post(
            "https://exp.host/--/api/v2/push/send",
            json={"to": expo_push_token, "title": title, "body": body},
            headers={"Content-Type": "application/json"},
        )