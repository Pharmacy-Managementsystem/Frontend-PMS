import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import Swal from "sweetalert2";
import axios from "axios";
import { useTranslation } from "react-i18next";

import ResetPassword from "../../Components/ResetPassword/ResetPassword";
import { useLogin } from "../../Hook/API/useLogin";
import { useNavigate } from "react-router-dom";
import { EyeOff, Eye } from "lucide-react";

const PharmAdminLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [forgetPass, setForgetPass] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginSchema = z.object({
    username: z.string().min(1, { message: t("login.usernameRequired") }),
    password: z.string().min(1, { message: t("login.passwordRequired") }),
  });

  type FormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onChange",
    resolver: zodResolver(loginSchema),
  });

  const { mutate: loginMutate, isPending } = useLogin();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    loginMutate(data, {
      onSuccess: () => {
        Swal.fire({
          icon: "success",
          title: t("login.success.title"),
          text: t("login.success.text"),
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/Dashboard/home", { replace: true });
        });
      },
      onError: (error) => {
        let errorMessage = t("login.error.invalidCredentials");
        let errorStatus = "";

        if (axios.isAxiosError(error)) {
          errorStatus = error.response?.status
            ? t("login.error.errorCode", { code: error.response.status })
            : t("login.error.error");
          errorMessage =
            error.response?.data?.message || error.message || errorMessage;
        }

        Swal.fire({
          icon: "error",
          title: errorStatus,
          text: errorMessage,
          confirmButtonColor: "#c74c39",
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-bgleft to-bgright p-4">
      {!forgetPass ? (
        <div className="w-full max-w-md bg-white rounded-3xl custom-card-shadow p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-6">PharmAdmin</h1>
            <p className="text-2xl font-bold text-gray-800">{t("login.title")}</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("login.username")}
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder={t("login.usernamePlaceholder")}
                {...register("username")}
              />
              {errors.username && (
                <p className="bg-yellow-100 p-2 rounded-lg text-yellow-500 text-sm mt-2">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("login.password")}
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="••••••••"
                {...register("password")}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-11 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              {errors.password && (
                <p className="bg-yellow-100 p-2 rounded-lg text-yellow-500 text-sm mt-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center">
              <label className="inline-flex items-center text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary rounded"
                />
                <span className="ml-2 text-sm">{t("login.rememberMe")}</span>
              </label>
              <span
                onClick={() => setForgetPass(true)}
                className="text-sm font-normal text-accent hover:text-primary hover:underline cursor-pointer transition"
              >
                {t("login.forgetPassword")}
              </span>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full font-bold bg-primary text-white py-3 rounded-lg hover:bg-accent focus:ring-2 focus:ring-accent focus:ring-opacity-50 transition disabled:opacity-60"
            >
              {isPending ? t("login.loggingIn") : t("login.loginButton")}
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white rounded-3xl custom-card-shadow p-6">
          <ResetPassword onBackToLogin={() => setForgetPass(false)} />
        </div>
      )}
    </div>
  );
};

export default PharmAdminLogin;