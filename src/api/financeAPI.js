import API from "./axios";

// ==========================
// FEES
// ==========================

export const getFees = async () => {
  const response = await API.get("finance/fees/");
  return response.data;
};

// ==========================
// PAYMENTS
// ==========================

export const getPayments = async () => {
  const response = await API.get("finance/payments/");
  return response.data;
};

// ==========================
// M-PESA
// ==========================

export const initiateMpesaPayment = async (data) => {
  const response = await API.post(
    "finance/mpesa/stk-push/",
    data
  );

  return response.data;
};

// ==========================
// BURSAR DASHBOARD
// ==========================

export const getBursarDashboard = async () => {
    const response = await API.get(
        "finance/dashboard/"
    );

    return response.data;
};
