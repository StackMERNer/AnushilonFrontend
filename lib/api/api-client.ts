"use client";
import { auth } from "../firebase";
import { createHttpClient } from "./http-client";

export const apiClient = createHttpClient(process.env.NEXT_PUBLIC_API_URL!);

apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["x-app-name"] = "anushilon";
  return config;
});
