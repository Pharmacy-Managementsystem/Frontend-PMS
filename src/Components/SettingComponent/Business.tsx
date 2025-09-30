import  { useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import FormBusiness from '../Forms/FormBusiness'; 

const Business = () => {
  const currentUserId = useMemo(() => {
    try {
      const token = localStorage.getItem('access');
      if (!token) return null;
      const decoded = jwtDecode<{ user_id?: string | number }>(token);
      const id = decoded?.user_id;
      return typeof id === 'string' ? id : String(id);
    } catch {
      return null;
    }
  }, []);

  const handleBack = () => {
   
    console.log('Back clicked');
  };

  if (!currentUserId) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Unable to load business information. Please log in again.</p>
      </div>
    );
  }

  return (
    <FormBusiness
      businessId={currentUserId}
      onBack={handleBack}
      mode="edit"
    />
  );
};

export default Business;