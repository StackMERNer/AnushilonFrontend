"use client";
import { auth } from "../firebase";
import { getProfileIdClient, getTrackIdClient } from "../profile-cookie";
import { createHttpClient } from "./http-client";

export const apiClient = createHttpClient(process.env.NEXT_PUBLIC_API_URL!);

apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  const pid = getProfileIdClient();
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (pid) config.headers["x-profile-id"] = pid;
  const tid = getTrackIdClient();
  if (tid) config.headers["x-track-id"] = tid;
  config.headers["x-app-name"] = "anushilon";
  return config;
});
