import api from "./axiosInstance";

export const userValidate = async (loginId) => {
  const res = await api.get("/api/Login/UserValidate", {
    params: { LoginId: loginId },
  });
  return res.data;
};

export const userAndPasswordValidate = async ({
  loginAppClientProductId,
  loginAppClientLocationId,
  loginAppClientFiscalYearId,
  loginAppClientConnectionId,
  loginId,
  loginPassword,
}) => {
  const res = await api.get("/api/Login/UserAndPasswordValidate", {
    params: {
      LoginAppClientProductId: loginAppClientProductId,
      LoginAppClientLocationId: loginAppClientLocationId,
      LoginAppClientFiscalYearId: loginAppClientFiscalYearId,
      LoginAppClientConnectionId: loginAppClientConnectionId,
      LoginId: loginId,
      LoginPassword: loginPassword,
    },
  });
  return res.data;
};

export const generateToken = async (loginId, loginPassword) => {
  const res = await api.get("/api/Login/GenerateToken", {
    params: { LoginId: loginId, LoginPassword: loginPassword },
  });
  return res.data;
};
