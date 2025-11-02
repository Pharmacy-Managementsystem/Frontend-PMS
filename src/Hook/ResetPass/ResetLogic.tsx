import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useGet } from "../API/useApiGet";
import { useMutate } from "../API/useApiMutate";

const steps = ["Send Code", "Verify Code", "Reset Password"] as const;

export type ResetPasswordStep = (typeof steps)[number];

export const useResetPassword = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Reusable hooks
  const { mutateAsync: sendCode, isLoading: isSendingCode } = useMutate({
    endpoint: `${import.meta.env.VITE_API_URL}/user/password/send-verification-code/`,
    method: "post",
  });

  const { mutateAsync: verifyCode, isLoading: isVerifyingCode } = useMutate({
    endpoint: `${import.meta.env.VITE_API_URL}/user/password/verify-code/`,
    method: "post",
  });

  const { mutateAsync: resetPassword, isLoading: isResettingPassword } =
    useMutate({
      endpoint: `${import.meta.env.VITE_API_URL}/user/password/reset-password/`,
      method: "patch",
      onSuccess: () => {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/"), 2000);
      },
    });

  const { refetch: checkEmail, isLoading: isCheckingEmail } = useGet({
    endpoint: `${import.meta.env.VITE_API_URL}/user/password/forget-password/${email}/`,
    queryKey: ["checkEmail", email],
    enabled: false,
  });

  const loading =
    isSendingCode || isVerifyingCode || isResettingPassword || isCheckingEmail;

  const validatePassword = (): boolean => {
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!/\d/.test(newPassword)) {
      setError("Password must contain at least one number");
      return false;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter");
      return false;
    }
    if (!/[a-z]/.test(newPassword)) {
      setError("Password must contain at least one lowercase letter");
      return false;
    }
    if (!/[!@#$%^&*]/.test(newPassword)) {
      setError(
        "Password must contain at least one special character (!@#$%^&*)",
      );
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) =>
    setEmail(e.target.value);
  const handleVerificationCodeChange = (e: ChangeEvent<HTMLInputElement>) =>
    setVerificationCode(e.target.value);
  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) =>
    setNewPassword(e.target.value);
  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) =>
    setConfirmPassword(e.target.value);

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please include a valid email address");
      return;
    }

    try {
      setError("");
      setMessage("");

      const { data: checkEmailResponse } = await checkEmail();
      await sendCode({
        email: (checkEmailResponse as { email?: string })?.email || email,
      });

      setMessage("Email sent successfully! Please check your inbox.");
      setActiveStep(1);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send verification code";
      setError(errorMessage);
    }
  };

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    try {
      setError("");
      setMessage("");

      await verifyCode({ email, code: verificationCode });
      setMessage("Code verified successfully!");
      setActiveStep(2);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid verification code";
      setError(errorMessage);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      setError("");
      setMessage("");

      await resetPassword({ email, new_password: newPassword });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reset password";
      setError(errorMessage);
    }
  };

  return {
    activeStep,
    loading,
    error,
    email,
    verificationCode,
    newPassword,
    confirmPassword,
    message,
    steps,
    handleEmailChange,
    handleVerificationCodeChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
  };
};
