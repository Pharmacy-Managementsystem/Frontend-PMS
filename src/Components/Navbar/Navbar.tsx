import  { useEffect, useRef, useState } from 'react';

import { Package } from 'lucide-react';
import { LayoutDashboard } from 'lucide-react';
import {
  ChartNoAxesColumnIncreasing,
  CircleUserRound,
  ShoppingCart,
  DollarSign,
  Settings,
  Users,
  ScrollText
 } from 'lucide-react';


import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { IoIosLogOut } from "react-icons/io";
import { useLogout } from '../../services/Logout';

interface DecodedToken {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: string;
  username: string;
  email: string;
  is_superuser: boolean;
}


  const navItems = [
    { Icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', page: '/Dashboard/home' },
    { Icon: ScrollText, label: 'POS', id: 'pos', page: '/Dashboard/pos' },
    { Icon: Package, label: 'Inventory', id: 'inventory', page: '/Dashboard/inventory' },
    { Icon: ShoppingCart, label: 'Purchase', id: 'purchase', page: '/Dashboard/purchase' },
    { Icon: DollarSign, label: 'Sales', id: 'sales' , page: '/Dashboard/sales' },
    { 
      Icon: Users, 
      label: 'Contacts', 
      id: 'contacts', 
      page: '/Dashboard/contacts'
    },
    { 
      Icon: ChartNoAxesColumnIncreasing, 
      label: 'Management', 
      id: 'management', 
      page: '/Dashboard/management'
    },
    { 
      Icon: Settings, 
      label: 'Settings', 
      id: 'settings', 
      page: '/Dashboard/setting'
     
    },
  ];
function Navbar() {
  const [activeNavItem, setActiveNavItem] = useState<string>('dashboard'); 
  const [today, setToday] = useState<string>('');
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLDivElement>(null);
  
   const navigate = useNavigate();
  const location = useLocation();
  const logout = useLogout();
  
  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          btnRef.current &&
          !btnRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      }
      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);
  useEffect(() => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('EG', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
    setToday(formattedDate);
    try {
      const token = localStorage.getItem('access');
      if (token) {
        setDecodedToken(jwtDecode(token));
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    
    // Set active nav item based on current path
    const currentPath = location.pathname;
    const activeItem = navItems.find(item => item.page === currentPath);
    if (activeItem) {
      setActiveNavItem(activeItem.id);
    }
  }, [location.pathname]);



  return (
    <>
      <nav className={`z-50 w-full flex items-center justify-between 
        bg-white border-b border-gray-200 sticky top-0 left-0 right-0
        transition-colors duration-300 px-6`}>
        
        <div className='flex items-center'>
          <h2 className="text-2xl font-bold text-primary">PharmAdmin</h2>
        </div>

        <div className='flex items-center justify-center space-x-9'>
  {navItems.map((item, index) => {
    const isActive = activeNavItem === item.id;
    return (
      <div 
        key={index}
        className={`
          flex items-center justify-center cursor-pointer group 
          relative py-4  transition-colors duration-200
          ${isActive ? 
            'border-b-1  ps-2 pe-4 border-primary' : 
            'ps-2 pe-4 hover:border-b-1  hover:border-primary'}
        `}
        onClick={() => {
          setActiveNavItem(item.id);
          navigate(item.page);
        }}
      >
        <item.Icon className={`transition-colors duration-200 ${isActive ? 'text-primary' : 'text-icon'} group-hover:text-primary w-5 h-5`} />
        <span className={`ml-2 text-sm font-medium transition-colors duration-200 ${isActive ? 'text-primary font-semibold' : 'text-text'} group-hover:text-primary`}>
          {item.label}
        </span>
      </div>
    );
  })}
</div>

        <div className='flex items-center space-x-6'>
          <span className='text-sm text-gray-500'>{today}</span>
          <span>Dr.{ decodedToken ? decodedToken.username : ''}</span>
          <div className="relative">
            <div 
              ref={btnRef} 
              onClick={() => setOpen(!open)}
              className="group cursor-pointer bg-primary rounded-full w-9 h-9 flex items-center justify-center hover:bg-primary-dark transition-colors"
            >
              <CircleUserRound className='text-white w-5 h-5'  />
            </div>
            
            {open && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-2xl border border-gray-100 z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="font-medium text-sm truncate">Dr.{decodedToken ? decodedToken.username : ''}</p>
                </div>
                
                <div 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setOpen(false);
                  logout();
                  }}
                >
                  <IoIosLogOut className='text-gray-500 mr-3' />
                  <span className="text-sm">Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;