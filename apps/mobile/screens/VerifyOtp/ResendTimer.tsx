import { Body } from "@/components/ui/Typography";
import { useUserInfoStore } from "@/stores";
import { cn } from "@/utils";
import { formatHMS } from "@/utils/date";
import dayjs from "dayjs";
import { memo, useEffect, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

interface IProps {
  onResend?: () => void;
}

export const ResendTimer = memo<IProps>(({ onResend }) => {
  const { t } = useTranslation();
  const otpExpire = useUserInfoStore.use.otpExpire();
  const updateOtpExpire = useUserInfoStore.use.updateOtpExpire();

  const [remaining, setRemaining] = useState(0);

  const rafRef = useRef<number>(undefined);

  useEffect(() => {
    const tick = () => {
      const now = dayjs();
      const expire = dayjs(otpExpire);

      if (!otpExpire) {
        return;
      }

      if (expire.isBefore(now)) {
        updateOtpExpire(null);
        return;
      }

      const diff = expire.diff(now, "second");
      setRemaining(Math.max(0, diff));
      if (diff > 0) {
        rafRef.current = setTimeout(tick, 1000);
      } else {
        updateOtpExpire(null);
      }
    };
    tick();
    return () => clearTimeout(rafRef.current);
  }, [otpExpire, updateOtpExpire]);

  return (
    <TouchableOpacity onPress={onResend} disabled={remaining > 0}>
      <Body
        variant="body2"
        className={cn("text-text-link", {
          "text-text-tertiary-inverse opacity-50": remaining > 0,
        })}
      >
        {remaining > 0
          ? t("auth.verify.resendIn", { time: formatHMS(remaining) })
          : t("auth.verify.resend")}
      </Body>
    </TouchableOpacity>
  );
});

ResendTimer.displayName = "ResendTimer";
