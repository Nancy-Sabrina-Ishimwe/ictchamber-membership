import type { Payment } from "../types/payment";

const API_URL = "http://localhost:5000/api/payments";

export const getPayments = async (): Promise<Payment[]> => {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error("Failed to fetch payments");
  }

  return res.json();
};