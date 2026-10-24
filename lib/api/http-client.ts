// lib/api/http-client.ts
import axios, { AxiosInstance } from "axios";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
  }
}

export function createHttpClient(baseURL: string): AxiosInstance {
  const instance = axios.create({ baseURL, timeout: 15000 });

  instance.interceptors.response.use(
    (res) => res,
    // (err) => {
    //   const status = err.response?.status ?? 0;
    //   const message = err.response?.data?.error ?? err.message;
    //   return Promise.reject(new ApiError(status, message, err.response?.data));
    // },
  );

  return instance;
}
