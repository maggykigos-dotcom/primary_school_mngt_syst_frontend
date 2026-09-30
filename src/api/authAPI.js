import API from "./axios";
export const loginUser = async (credentials) => {
  console.log("LOGIN CREDENTIALS:", credentials);

  const response = await API.post(
    "auth/login/",
    {
      username: credentials.username.trim(),
      password: credentials.password,
    }
  );

  return response.data;
};
