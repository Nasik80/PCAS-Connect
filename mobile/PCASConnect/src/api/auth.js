import axios from "axios";

// UPDATED IP ADDRESS FROM YOUR TERMINAL
import { API_BASE_URL } from '../config';

const BASE_URL = API_BASE_URL;


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