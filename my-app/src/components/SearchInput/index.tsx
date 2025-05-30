"use client";

import { TextInput, Box } from "@mantine/core";
import { ReactNode } from "react";

interface SearchInputProps {
  placeholder: string;
  leftSection: ReactNode;
}

export default function SearchInput({
  placeholder,
  leftSection,
}: SearchInputProps) {
  return (
    <TextInput
      styles={{
        input: {
          fontSize: "20px",
          color: "#3C3C3C",
          fontWeight: 500,
          borderColor: "#8C6E63",
        },
      }}
      size="sm"
      radius="xl"
      leftSectionPointerEvents="none"
      leftSection={<Box>{leftSection}</Box>}
      leftSectionWidth={50}
      placeholder={placeholder}
    />
  );
}
