import "server-only"; // only works on the server
import { cookies } from "next/headers";
import { createHttpClient } from "./http-client";

export function createServerApiClient() {
  const instance = createHttpClient(process.env.API_URL!);

  instance.interceptors.request.use(async (config) => {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (sessionCookie) {
      config.headers.Authorization = `Bearer ${sessionCookie}`;
      config.headers["x-token-type"] = "session";
    }
    config.headers["x-internal-secret"] = process.env.INTERNAL_SECRET!;

    return config;
  });

  return instance;
}
