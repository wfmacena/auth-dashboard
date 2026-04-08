import axios from "axios";

const api = axios.create({
  baseURL: "https://authsystem-numi.onrender.com/api"
});

export default api;