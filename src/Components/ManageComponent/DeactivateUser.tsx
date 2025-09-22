import  { useState } from 'react';

export default function DeactivateUser({ onClose, id ,type}: { onClose?: () => void ; id: string ; type: string }) {
  const [showPassword, setShowPassword] = useState(false);
  

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl  relative z-50">
              <div className='ps-8 py-6 pe-6'>
                  
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-5xl"
          onClick={onClose}
        >
          &times;
        </button>
          <h2 className="text-xl text-title font-semibold mb-6">Deactivate User { id}</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded mb-6 flex items-start gap-3">
          <svg className="w-6 h-6 mt-1 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" /></svg>
          <span className="text-sm leading-6">
            This {type} will be deactivated. Being deactivated means the user would not be able to access their account.
          </span>
        </div>
        <label className="block mb-2 text-gray-700 text-sm">Please type your password to confirm</label>
        <div className="relative mb-8">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-100 text-base"
            placeholder="Password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.274.832-.67 1.613-1.176 2.316M15.362 17.362A9.958 9.958 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M9.88 9.88l4.24 4.24m0-4.24l-4.24 4.24" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-1.61 0-3.13-.386-4.438-1.07" /></svg>
            )}
          </button>
            </div>
              </div>
              <div>
        <div className="flex justify-between gap-4 rounded-xl bg-baAlert ps-12 py-6 pe-6">
          <button
            className="px-6 py-3 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">
            I understand the consequences, deactivate this {type}
          </button>
        </div>
              </div> 
      </div>
    </div>
  );
}
