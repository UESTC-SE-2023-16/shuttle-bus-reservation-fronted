import { proxy } from "valtio";

export const pageState = proxy({
  currentPage: "行程预约",
});

export const titleState = proxy({
  title: "行程预约",
});
