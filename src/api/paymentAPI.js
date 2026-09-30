import API from "./axios";

export const payMpesa = async (data) =>
  (await API.post("payments/mpesa/", data)).data;