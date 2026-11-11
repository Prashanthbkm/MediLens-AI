
import api from "./api";

export const loginRequest = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const registerRequest = async (userData) => {
  const response = await api.post("/auth/register", {
    fullName: userData.fullName,
    email: userData.email,
    password: userData.password,
  });

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};
