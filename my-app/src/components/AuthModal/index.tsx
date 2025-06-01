"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { useUser } from "@/context/UserContext";
import {
  Modal,
  Button,
  TextInput,
  PasswordInput,
  Stack,
  Text,
  Group,
  Anchor,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth } from "@/library/firebase";
import { FirebaseError } from "firebase/app";

export default function AuthModal({
  buttonClassName = "",
}: {
  buttonClassName?: string;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();
  const [type, setType] = useState<"login" | "register">("login");
  const user = useUser();

  const form = useForm({
    initialValues: { email: "", password: "", displayName: "" },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Email 格式不正確"),
      password: (value) => (value.length >= 6 ? null : "密碼長度至少 6 字元"),
      displayName: (value) =>
        type === "register"
          ? value.trim().length > 0
            ? null
            : "請輸入暱稱"
          : null,
    },
  });

  async function handleSubmit(values: typeof form.values) {
    const showSuccessNotification = (
      title: string,
      message: string,
      color: string
    ) => {
      notifications.show({
        title,
        message,
        color,
        icon: <IconCheck size={20} />,
        autoClose: 2000,
      });
    };

    const showErrorNotification = (title: string, message: string) => {
      notifications.show({
        title,
        message,
        color: "red",
        icon: <IconX size={20} />,
        autoClose: 2000,
      });
    };

    try {
      let userCredential;
      if (type === "login") {
        userCredential = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

        showSuccessNotification(
          "登入成功",
          `歡迎回來，${userCredential.user.displayName}`,
          "green"
        );

        form.reset();
        close();
      } else {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

        await updateProfile(userCredential.user, {
          displayName: values.displayName,
        });

        showSuccessNotification(
          "註冊成功",
          `帳號 ${userCredential.user.email} 已建立，歡迎加入！`,
          "blue"
        );
        form.reset();
        close();
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/invalid-credential") {
          showErrorNotification("登入失敗", "帳號或密碼錯誤，請再試一次");
        } else {
          showErrorNotification("操作失敗", error.message);
        }
      } else {
        console.error("未知錯誤：", error);
        showErrorNotification("未知錯誤", "請再試一次");
      }
    }
  }

  const logout = async () => {
    await signOut(auth);
    notifications.show({
      title: "已登出",
      message: "您已成功登出",
      color: "gray",
      icon: <IconCheck size={20} />,
      autoClose: 2000,
    });
    router.push("/");
  };

  // 自動監聽 Firebase 的登入狀態變化，並即時更新 React 的使用者狀態。
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     setUser(user);
  //   });
  //   return () => unsubscribe();
  // }, []);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title={type === "login" ? "會員登入" : "會員註冊"}
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          {type === "register" && (
            <TextInput
              label="暱稱"
              placeholder="請輸入欲使用的暱稱"
              {...form.getInputProps("displayName")}
              required
            />
          )}
          <Stack>
            <TextInput
              label="Email"
              placeholder="your@email.com"
              {...form.getInputProps("email")}
              required
            />
            <PasswordInput
              label="密碼"
              placeholder="請輸入密碼"
              {...form.getInputProps("password")}
              required
            />
            <Button type="submit" fullWidth>
              {type === "login" ? "登入" : "註冊"}
            </Button>
            <Group>
              <Text size="sm">
                {type === "login" ? "還沒有帳號嗎？" : "已經有帳號？"}{" "}
                <Anchor
                  size="sm"
                  onClick={() =>
                    setType(type === "login" ? "register" : "login")
                  }
                >
                  {type === "login" ? "建立帳號" : "點此登入"}
                </Anchor>
              </Text>
            </Group>
          </Stack>
        </form>
      </Modal>

      {user ? (
        <button onClick={logout} className={buttonClassName}>
          會員登出
        </button>
      ) : (
        <button onClick={open} className={buttonClassName}>
          會員登入
        </button>
      )}
    </>
  );
}
