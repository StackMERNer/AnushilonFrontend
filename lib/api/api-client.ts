"use client";
import { auth } from "../firebase";
import {
  clearProfileCookies,
  getProfileIdClient,
  getTrackIdClient,
} from "../profile-cookie";
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

apiClient.interceptors.response.use(
  (r) => r,
  (error) => {
    if (
      error?.response?.data?.code === "PROFILE_INVALID" &&
      typeof window !== "undefined" &&
      getProfileIdClient() // loop guard: only when a cookie is actually set
    ) {
      clearProfileCookies();
      window.location.reload(); // comes back on the account's default profile
    }
    return Promise.reject(error);
  },
);
