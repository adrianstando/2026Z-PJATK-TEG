"""GitHub Copilot SDK — działa na subskrypcji Copilota (studenci: darmowy Copilot Pro
w GitHub Student Developer Pack).

    pip install github-copilot-sdk     # Python 3.11+
    copilot login                       # albo GITHUB_TOKEN w środowisku
"""
import asyncio

from copilot import CopilotClient
from copilot.session import PermissionHandler


async def main():
    async with CopilotClient() as client:
        async with await client.create_session(
            on_permission_request=PermissionHandler.approve_all,
            model="gpt-5-mini",
            available_tools=[],  # czysty czat, bez narzędzi
        ) as session:
            reply = await session.send_and_wait("Czym jest embedding? Jedno zdanie.")
            print(reply.data.content)


asyncio.run(main())
