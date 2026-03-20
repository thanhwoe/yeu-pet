import { Toast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { Image } from "@/components/ui/Image";
import { Body, Heading } from "@/components/ui/Typography";
import { useLogout } from "@/hooks/useLogout";
import { resendOtpMutation, verifyOtpMutation } from "@/services";
import { useUserInfoStore } from "@/stores";
import { cn } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { ResendTimer } from "./ResendTimer";

const OTP_LENGTH = 6;

export const VerifyOtpScreen = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  const { user, updateOtpExpire, updateUser } = useUserInfoStore();
  const { loading: loggingOut, logout } = useLogout();

  const { mutate: verifyOtp, isPending: isVerifying } = useMutation({
    mutationFn: verifyOtpMutation,
    onError(e) {
      Toast.error({ text: e.message });
      shake();
    },
    onSuccess(res) {
      updateOtpExpire(null);
      updateUser(res);
    },
  });

  const { mutate: resendOtp, isPending: resendingOtp } = useMutation({
    mutationFn: resendOtpMutation,
    onError(e) {
      Toast.error({ text: e.message });
    },
    onSuccess(res) {
      updateOtpExpire(dayjs(res.expiresAt).toDate());
    },
  });

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  const clearError = () => setHasError(false);

  const shake = () => {
    setHasError(true);
    translateX.value = withSequence(
      withTiming(10, { duration: 60 }),
      withTiming(-10, { duration: 60 }),
      withTiming(6, { duration: 60 }),
      withTiming(-6, { duration: 60 }),
      withTiming(0, { duration: 60, easing: Easing.out(Easing.ease) }),
    );
  };

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (hasError) {
      clearError();
    }

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      }
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      shake();
      return;
    }

    verifyOtp(code);
  };

  const handleResend = useCallback(() => {
    if (resendingOtp) {
      return;
    }
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
    setActiveIndex(0);
    setHasError(false);
    resendOtp();
  }, [resendOtp, resendingOtp]);

  const filled = otp.filter(Boolean).length;
  const isComplete = filled === OTP_LENGTH;

  const containerAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const otpRowAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <KeyboardAvoidingView
      onStartShouldSetResponder={() => {
        Keyboard.dismiss();
        return true;
      }}
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Animated.View
        className="flex-1 pt-safe-offset-8 pb-safe px-20"
        style={[containerAnimStyle]}
      >
        {/* Top section */}
        <View className="items-center mb-40">
          <Image
            contentFit="contain"
            className="size-[250px]"
            source={require("@/assets/images/sitting-dog.png")}
          />

          <Heading variant="h4">Verify your phone number</Heading>
          <Body>We sent a {OTP_LENGTH}-digit code to</Body>
          <Body weight="bold">{user?.phone}</Body>
        </View>

        {/* OTP inputs */}
        <Animated.View
          className="flex-row justify-center gap-10"
          style={[otpRowAnimStyle]}
        >
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(r) => {
                inputRefs.current[i] = r;
              }}
              className={cn(
                "w-48 h-56 rounded-12 border-[1.5px] border-line-tertiary text-center text-heading6 font-bold text-text-primary selection:text-text-secondary",
                {
                  "border-line-primary": activeIndex === i,
                  "border-line-primary bg-background": digit,
                  "border-line-negative bg-background-negative-foreground":
                    hasError,
                },
              )}
              value={digit}
              editable={!isVerifying}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              onFocus={() => setActiveIndex(i)}
              keyboardType="number-pad"
              maxLength={1}
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
            />
          ))}
        </Animated.View>

        {hasError && (
          <Body center variant="body3" className="mt-12 text-text-negative">
            Incorrect code. Please try again.
          </Body>
        )}

        {/* Progress dots */}
        <View className="flex-row justify-center gap-6 mt-20">
          {otp.map((d, i) => (
            <View
              key={i}
              className={cn(
                "size-6 rounded-4 bg-background-tertiary-highlight",
                {
                  "bg-background-primary": d,
                },
              )}
            />
          ))}
        </View>

        {/* Spacer */}
        <View className="flex-1" />

        {/* Bottom section */}
        <View className="gap-16">
          {/* Resend */}
          <View className="flex-row justify-center items-center">
            <Body variant="body2" className="text-text-tertiary-inverse">
              Didn&rsquo;t receive the code?{" "}
            </Body>
            <ResendTimer onResend={handleResend} />
          </View>

          <Button
            disabled={!isComplete || loggingOut || resendingOtp}
            loading={isVerifying}
            onPress={handleVerify}
          >
            Verify
          </Button>
          <Button
            variant="ghost"
            onPress={logout}
            loading={loggingOut}
            disabled={resendingOtp || isVerifying}
          >
            Change phone number
          </Button>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};
