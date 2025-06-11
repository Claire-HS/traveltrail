import React from "react";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconX,
  IconAlertCircle,
  IconInfoCircle,
  IconMapPinCheck,
  IconLogout,
} from "@tabler/icons-react";

type NotifyType = "success" | "error" | "warning" | "info" | "saved" | "logout";

interface NotifyOptions {
  title?: string;
  message: string;
  type?: NotifyType;
}

const strategies: Record<NotifyType, (opts: NotifyOptions) => void> = {
  success: ({ title, message }) =>
    notifications.show({
      title: title || "成功訊息",
      message,
      color: "green",
      icon: <IconCheck size={20} />,
      autoClose: 2000,
    }),

  error: ({ title, message }) =>
    notifications.show({
      title: title || "錯誤訊息",
      message,
      color: "red",
      icon: <IconX size={20} />,
      autoClose: 2000,
    }),

  warning: ({ title, message }) =>
    notifications.show({
      title: title || "提醒訊息",
      message,
      color: "yellow",
      icon: <IconAlertCircle size={20} />,
      autoClose: 2000,
    }),

  info: ({ title, message }) =>
    notifications.show({
      title: title || "訊息通知",
      message,
      color: "blue",
      icon: <IconInfoCircle size={20} />,
      autoClose: 2000,
    }),

  saved: ({ title, message }) =>
    notifications.show({
      title: title || "儲存成功",
      message,
      color: "teal",
      icon: <IconMapPinCheck size={20} />,
      autoClose: 2000,
    }),
  logout: ({ title, message }) =>
    notifications.show({
      title: title || "已登出",
      message,
      color: "gray",
      icon: <IconLogout size={20} />,
      autoClose: 2000,
    }),
};

export function notify(opts: NotifyOptions) {
  const type = opts.type || "info";
  const strategy = strategies[type];

  if (strategy) {
    strategy(opts);
  } else {
    notifications.show({
      title: opts.title || "通知",
      message: opts.message,
      autoClose: 2000,
    });
  }
}
