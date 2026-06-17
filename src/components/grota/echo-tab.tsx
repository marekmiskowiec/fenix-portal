import { getTodayEchoSession } from "@/app/dashboard/grota/echo-actions";
import { EchoTabClient } from "./echo-tab-client";

export async function EchoTab({ userId }: { userId: string }) {
  const data = await getTodayEchoSession(userId);
  return <EchoTabClient data={data} />;
}
