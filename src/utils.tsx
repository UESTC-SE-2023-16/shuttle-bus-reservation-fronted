import { globalToastState } from "./store";

export function showGlobalToast(
  text: string,
  type: "success" | "error" | "info" | "warning" = "error",
  timeout: number = 3000
) {
  globalToastState.text = text;
  globalToastState.type = type;
  setTimeout(() => {
    globalToastState.text = "";
    globalToastState.type = "error";
  }, timeout);
}
