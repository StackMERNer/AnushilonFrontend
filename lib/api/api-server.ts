import "server-only"; // only works on the server
import { cookies } from "next/headers";
import { createHttpClient } from "./http-client";

export function createServerApiClient() {
  const instance = createHttpClient(process.env.API_URL!);

  instance.interceptors.request.use(async (config) => {
    const jar = await cookies();
    const sessionCookie = jar.get("session")?.value;
    const profileId = jar.get("profileId")?.value;
    const trackId = jar.get("trackId")?.value;

    if (sessionCookie) {
      config.headers.Authorization = `Bearer ${sessionCookie}`;
      config.headers["x-token-type"] = "session";
    }
    if (profileId) config.headers["x-profile-id"] = profileId;
    if (trackId) config.headers["x-track-id"] = trackId;
    config.headers["x-internal-secret"] = process.env.INTERNAL_SECRET!;
    config.headers["x-app-name"] = "anushilon";

    return config;
  });

  return instance;
}
