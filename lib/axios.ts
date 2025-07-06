import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "/api", // all API calls will be like `/api/tasks`
});
