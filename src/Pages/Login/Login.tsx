import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';

import ResetPassword from '../../Components/ResetPassword/ResetPassword';
import { useLogin } from '../../Hook/API/useLogin';
import { useNavigate } from 'react-router-dom';
import { EyeOff , Eye } from 'lucide-react';

const PharmAdminLogin = () => {
  const navigate = useNavigate();
  const [forgetPass, setForgetPass] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginSchema = z.object({
    username: z.string().min(1, { message: 'username is required' }).min(1, { message: 'username is required' }),
    password: z.string().min(1, { message: 'password is required' }),
  });

  type FormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
    resolver: zodResolver(loginSchema),
  });

  const { mutate: loginMutate, isPending } = useLogin();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    loginMutate(data, {
      onSuccess: () => {
        navigate('/Dashboard/home', { replace: true }); 
      },
      onError: (error) => {
        console.error('Login failed:', error);
      },
    });
  };

  return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-bgleft to-bgright p-4">      {!forgetPass ? (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-6">PharmAdmin</h1>
            <p className="text-2xl font-bold text-gray-800">Login</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">username</label>
              <input
                type="username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="Enter your username"
                {...register('username')}
              />
              {errors.username && <p className=" bg-yellow-100 p-2 rounded-lg text-yellow-500 text-sm mt-2">{errors.username.message}</p>}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
              type={showPassword ? 'text' : 'password'}
              
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="••••••••"
                {...register('password')}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute text-gray-400 cursor-pointer  right-4 top-13 transform -translate-y-1/2"
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
              {errors.password && <p className=" bg-yellow-100 p-2 rounded-lg text-yellow-500 text-sm mt-2">{errors.password.message}</p>}
            </div>

            <div className="flex justify-between items-center">
              <label className="inline-flex items-center text-gray-700">
                <input type="checkbox" className="h-4 w-4 text-primary rounded" />
                <span className="ml-2 text-sm">Remember Me</span>
              </label>
              <span
                onClick={() => setForgetPass(true)}
                className="text-sm font-normal text-accent hover:text-primary hover:underline cursor-pointer transition"
              >
                Forget Password?
              </span>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full font-bold bg-primary text-white py-3 rounded-lg hover:bg-accent focus:ring-2 focus:ring-accent focus:ring-opacity-50 transition disabled:opacity-60"
            >
              {isPending ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6">
          <ResetPassword onBackToLogin={() => setForgetPass(false)} />
        </div>
      )}
    </div>
  );
};

export default PharmAdminLogin;
