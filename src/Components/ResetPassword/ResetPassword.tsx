import React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { useResetPassword } from "../../Hook/ResetPass/ResetLogic";
import { useNavigate } from "react-router-dom";

interface ResetPasswordProps {
  onBackToLogin?: () => void; 
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onBackToLogin }) => { 
  const {
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
    handleResetPassword
  } = useResetPassword();
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      navigate("/");
    }
  };

  const getCurrentForm = () => {
    switch (activeStep) {
      case 0:
        return (
          <form className="space-y-5" onSubmit={handleSendCode}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full font-bold bg-primary text-white py-3 rounded-lg hover:bg-accent focus:ring-2 focus:ring-accent focus:ring-opacity-50 inline-flex justify-center items-center gap-2 transition"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Send Code"}
            </button>
          </form>
        );

      case 1:
        return (
          <form className="space-y-5" onSubmit={handleVerifyCode}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 transition"
                disabled
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={verificationCode}
                onChange={handleVerificationCodeChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full font-bold bg-primary text-white py-3 rounded-lg hover:bg-accent focus:ring-2 focus:ring-accent focus:ring-opacity-50 inline-flex justify-center items-center gap-2 transition"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Verify Code"}
            </button>
          </form>
        );

      case 2:
        return (
          <form className="space-y-5" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 transition"
                disabled
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={handleNewPasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full font-bold bg-primary text-white py-3 rounded-lg hover:bg-accent focus:ring-2 focus:ring-accent focus:ring-opacity-50 inline-flex justify-center items-center gap-2 transition"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Reset Password"}
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className='text-3xl font-bold text-primary mb-6'>PharmAdmin</h1>
      </div>
      <div className="px-4 pb-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {activeStep === 0 ? "Forgot Password?" : "Reset Password"}
          </h1>
          <p className="text-gray-600">
            Remember your password? 
            <span 
              onClick={handleBackToLogin}
              className="text-primary hover:text-accent hover:underline font-medium ml-1 cursor-pointer transition"
            >
              Login here
            </span>
          </p>
        </div>

        <Stepper activeStep={activeStep} alternativeLabel className="mb-8">
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel className="text-xs">{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <div className="mt-4">
          {getCurrentForm()}

          {error && (
            <Box sx={{ mt: 3 }}>
              <Alert severity="error" className="rounded-lg">{error}</Alert>
            </Box>
          )}
          {message && (
            <Box sx={{ mt: 3 }}>
              <Alert severity="success" className="rounded-lg">{message}</Alert>
            </Box>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;