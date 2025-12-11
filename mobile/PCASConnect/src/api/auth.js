import axios from "axios";

// UPDATED IP ADDRESS FROM YOUR TERMINAL
const BASE_URL = "http://10.219.6.134:8000";


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