import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";

interface UseTimestampToDateOptions {
  format?: boolean;
  locale?: string;
  formatOptions?: Intl.DateTimeFormatOptions;
}

export function useTimestampToDate(
  timestamp: Timestamp | null | undefined,
  options: UseTimestampToDateOptions = {}
): string | Date | null {
  const {
    format = false,
    locale = "zh-TW",
    formatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  } = options;

  const [dateValue, setDateValue] = useState<string | Date | null>(null);

  useEffect(() => {
    if (!timestamp) {
      setDateValue(null);
      return;
    }

    if (!(timestamp instanceof Timestamp)) {
      console.warn("useTimestampToDate: 傳入的不是 Firestore Timestamp 物件");
      setDateValue(null);
      return;
    }

    const jsDate = timestamp.toDate();

    if (format) {
      const formatted = jsDate.toLocaleDateString(locale, formatOptions);
      setDateValue(formatted);
    } else {
      setDateValue(jsDate);
    }
  }, [timestamp, format, locale, JSON.stringify(formatOptions)]);

  return dateValue;
}
