import axios from "axios";

// UPDATED IP ADDRESS FROM YOUR TERMINAL
const BASE_URL = "http://10.121.154.1:8000";

export const loginUser = async (role, email, password) => {
  const response = await axios.post(
    `${BASE_URL}/api/${role}/login/`,
    {
      email: email,
      password: password
    }
  );
  return response.data;
};