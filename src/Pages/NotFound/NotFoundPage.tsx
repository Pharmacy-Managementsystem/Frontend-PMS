import React from 'react';
import './NotFound.css'; // We'll create this CSS file
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen bg-gray-900 overflow-hidden flex items-center justify-center  p-6">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-[#3B82F6] blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-[#2DD4BF] blur-3xl"></div>
      </div>
      
      {/* Glitch text container */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* 404 with glitch effect */}
        <div className="relative mb-12">
          <h1 className="text-[120px] md:text-[180px] font-bold text-white tracking-tighter">
            <span className="relative">
              <span className="absolute inset-0 text-[#3B82F6] opacity-70 animate-glitch-1">404</span>
              <span className="absolute inset-0 text-[#2DD4BF] opacity-70 animate-glitch-2">404</span>
              <span className="relative">404</span>
            </span>
          </h1>
        </div>
        
        {/* Main heading */}
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Page Not Found
        </h2>
        
        {/* Description */}
        <p className="text-gray-400 text-lg mb-10">
          Oops! The page you're looking for has vanished into the digital void.
        </p>
        
        {/* Animated button */}
        <button onClick={() => navigate('/Dashboard/home', { replace: true })} className="relative px-8 py-4 bg-gradient-to-r from-[#3B82F6] to-[#2DD4BF] text-white font-bold rounded-lg overflow-hidden group">
          <span className="relative z-10">Return to Dashboard</span>
          <span className="absolute inset-0 bg-gradient-to-r from-[#2DD4BF] to-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </button>
      </div>

      {/* Floating elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <div className="w-3 h-3 bg-[#3B82F6] rounded-full animate-float animate-delay-100"></div>
        <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-float animate-delay-300"></div>
        <div className="w-4 h-4 bg-white rounded-full animate-float animate-delay-500"></div>
      </div>
    </section>
  );
};

export default NotFoundPage;