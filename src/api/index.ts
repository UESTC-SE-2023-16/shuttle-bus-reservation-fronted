import { SHA256 } from "crypto-js";

import { appConfig } from "../../package.json";
import { userState } from "../store";
import { showGlobalToast } from "../utils";

const API_PREFIX = appConfig.server;

/**
 * @description 基础api请求
 */
function baseFetch(path: string, options?: RequestInit) {
  return fetch(`${API_PREFIX}${path}`, options);
}

/**
 * @description 携带token的api请求
 */
function apiFetch(path: string, options?: RequestInit) {
  console.log(userState);
  const token = userState.user.token;
  if (token) {
    options = {
      ...options,
      headers: {
        ...options?.headers,
        token: token,
      },
    };
  } else {
    console.warn("No token found");
    throw new Error("No token found");
  }
  return baseFetch(path, options);
}

export interface BusBango {
  id: number;
  busnum: string;
  depart: string;
  destination: string;
  departtime: string;
  seats: number;
  fare: number;
  remained_seats: number;
}

export interface Ticket {
  id: number;
  status: "S" | "N" | "F" | "T" | "I";
  bus_info: BusBango;
  b_id: number;
  u_id: number;
}

export interface UserLogined {
  id: number;
  name: string;
  is_admin: boolean;
  access_token: string;
}

export const TICKET_STATUS = {
  S: "未缴费",
  N: "已缴费",
  F: "已乘坐",
  T: "已退票",
  I: "无效",
};

export async function getBusBangos() {
  const res = await apiFetch("/bus/getBusInfo");
  const resData = await res.json();
  console.log(resData);
  showGlobalToast(resData.msg, resData.code === 200 ? "info" : "error");
  if (resData.code !== 200) return null;
  const busBangos: BusBango[] = resData.data;
  return busBangos;
}

export async function getUserTickets(userId: number) {
  const res = await apiFetch(`/ticket/getUserTicketInfo/${userId}`);
  const resData = await res.json();
  console.log(resData);
  showGlobalToast(resData.msg, resData.code === 200 ? "info" : "error");
  const tickets: Ticket[] = resData.data;
  return tickets;
}

export async function buyBusBangoTicket(busBangoId: number, userId: number) {
  console.log(busBangoId, userId);

  const data = {
    b_id: busBangoId,
    u_id: userId,
    status: "S",
  };

  const res = apiFetch("/ticket/register/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const resData = await (await res).json();
  console.log(resData);
  showGlobalToast(resData.msg, resData.code === 200 ? "info" : "error");
  if (resData.code === 200) return resData.data as Omit<Ticket, "bus_info">;
  else return null;
}

export async function batchBuyBusBangoTicket(
  busBangoId: number,
  userId: number,
  count: number
) {
  console.log(count);
  const successTickes: Omit<Ticket, "bus_info">[] = [];
  for (let i = 0; i < count; i++) {
    const res = await buyBusBangoTicket(busBangoId, userId);
    if (res) successTickes.push(res);
    else continue;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  showGlobalToast(`成功购买${successTickes.length}/${count}张车票`, "info");
  return successTickes;
}

export async function changeTicketStatus(
  ticketId: number,
  status: keyof typeof TICKET_STATUS
) {
  console.log(ticketId, status);

  const data = {
    status: status,
  };

  const res = apiFetch(`/ticket/${ticketId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const resData = await (await res).json();
  console.log(resData);
  showGlobalToast(resData.msg, resData.code === 200 ? "info" : "error");
  if (resData.code === 200) return resData.data as Ticket;
  else return null;
}

export async function userLogin(account: string, password: string) {
  const data = {
    name: account,
    password: SHA256(password).toString(),
  };
  console.log(data);
  const loginRes = await baseFetch("/user/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const loginData = await loginRes.json();
  console.log(loginData);
  showGlobalToast(loginData.msg, loginData.code === 200 ? "info" : "error");
  if (loginData.code !== 200) return null;
  return loginData.data as UserLogined;
}

export async function userRegister(account: string, password: string) {
  const data = {
    name: account,
    password: SHA256(password).toString(),
  };
  console.log(data);
  const pro = baseFetch("/user/register/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(`Success: ${JSON.stringify(data)}`);
      return data as { msg: string; code: number; data: { id: number } };
    })
    .catch((error) => {
      console.error(`Error: ${error}`);
      return null;
    });
  console.log(pro);
  return pro;
}
