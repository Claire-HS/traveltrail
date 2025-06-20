"use client";

import { useState } from "react";
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
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth } from "@/library/firebase";
import { FirebaseError } from "firebase/app";
import { notify } from "@/utilities/notify";

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
    try {
      let userCredential;
      if (type === "login") {
        userCredential = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

        notify({
          type: "success",
          title: "登入成功",
          message: `歡迎回來，${userCredential.user.displayName}`,
        });

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

        notify({
          type: "success",
          title: "註冊成功",
          message: `帳號 ${userCredential.user.email} 已建立，歡迎加入！`,
        });

        form.reset();
        close();
      }
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/invalid-credential") {
          notify({
            type: "error",
            title: "登入失敗",
            message: "帳號或密碼錯誤，請再試一次",
          });
        } else {
          notify({
            type: "error",
            title: "操作失敗",
            message: error.message,
          });
        }
      } else {
        console.error("未知錯誤：", error);
        notify({
          type: "error",
          title: "未知錯誤",
          message: "請稍後再試",
        });
      }
    }
  }

  const logout = async () => {
    await signOut(auth);
    notify({ type: "logout", message: "您已成功登出。" });
    router.push("/");
  };

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
          登出
        </button>
      ) : (
        <button onClick={open} className={buttonClassName}>
          登入
        </button>
      )}
    </>
  );
}
