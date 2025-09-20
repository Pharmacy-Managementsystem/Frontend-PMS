import { useEffect, useRef, useState } from "react";
import { Package, LayoutDashboard, ChartNoAxesColumnIncreasing, CircleUserRound, ShoppingCart, DollarSign, Settings, Users } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import { useLogout } from "../../services/Logout";
import { HiMenu, HiX } from "react-icons/hi";
import { useDecodedToken } from "../../Hook/useDecodedToken"

const navItems = [
  { Icon: LayoutDashboard, label: "Dashboard", id: "dashboard", page: "/Dashboard/home" },
  // { Icon: ScrollText, label: "POS", id: "pos", page: "/Dashboard/pos" },
  { Icon: Package, label: "Inventory", id: "inventory", page: "/Dashboard/inventory" },
  { Icon: ShoppingCart, label: "Purchase", id: "purchase", page: "/Dashboard/purchase" },
  { Icon: DollarSign, label: "Sales", id: "sales", page: "/Dashboard/sales" },
  { Icon: Users, label: "Contacts", id: "contacts", page: "/Dashboard/contacts" },
  { Icon: ChartNoAxesColumnIncreasing, label: "Management", id: "management", page: "/Dashboard/management" },
  { Icon: Settings, label: "Settings", id: "settings", page: "/Dashboard/setting" },
];

function Navbar() {
  const decodedToken = useDecodedToken();
  const [activeNavItem, setActiveNavItem] = useState<string>("dashboard");
  const [today, setToday] = useState<string>("");
  const [openUserDropdown, setOpenUserDropdown] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const logout = useLogout();

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const userBtnRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);

  // ✅ احسب التاريخ مرة واحدة عند الـ mount
  useEffect(() => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString("EG", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    setToday(formattedDate);
  }, []);

  // ✅ غلق dropdown / mobile menu لو كلكت بره
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openUserDropdown &&
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node) &&
        userBtnRef.current &&
        !userBtnRef.current.contains(event.target as Node)
      ) {
        setOpenUserDropdown(false);
      }

      if (
        openMobileMenu &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileMenuBtnRef.current &&
        !mobileMenuBtnRef.current.contains(event.target as Node)
      ) {
        setOpenMobileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openUserDropdown, openMobileMenu]);

  // ✅ حدد الـ activeNavItem بناءً على الـ path + role
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = navItems.find((item) => item.page === currentPath);

    let newActiveNavItem = "dashboard";

    if (activeItem) {
      if (decodedToken?.is_superuser) {
        newActiveNavItem =
          activeItem.id === "dashboard" || activeItem.id === "management"
            ? activeItem.id
            : "dashboard";
      } else {
        newActiveNavItem = activeItem.id;
      }
    }

    if (activeNavItem !== newActiveNavItem) {
      setActiveNavItem(newActiveNavItem);
    }
  }, [location.pathname, decodedToken, activeNavItem]);

  // ✅ فلترة الـ navItems على حسب role قبل الرندر
  const visibleNavItems = navItems.filter((item) => {
    if (decodedToken?.is_superuser) {
      return item.id === "dashboard" || item.id === "management";
    }
    return true;
  });

  return (
    <>
      <nav className="z-50 w-full flex items-center justify-between 
        bg-white border-b border-gray-200 sticky top-0 left-0 right-0
        transition-colors duration-300 px-4 py-2 lg:px-6 lg:py-0">
        
        <div className="flex items-center ">
          <h2 className="text-xl lg:text-2xl font-bold text-primary">PharmAdmin</h2>
        </div>

        <div className="hidden lg:flex items-center justify-center space-x-9">
          {visibleNavItems.map((item) => {
            const isActive = activeNavItem === item.id;
            return (
              <div
                key={item.id}
                className={`
                  lg:flex items-center justify-center cursor-pointer group 
                  relative py-4 transition-colors duration-200
                  ${isActive ? "border-b-1 ps-2 pe-4 border-primary" : "ps-2 pe-4 hover:border-b-1 hover:border-primary"}
                `}
                onClick={() => {
                  if (activeNavItem !== item.id) {
                    setActiveNavItem(item.id);
                  }
                  navigate(item.page);
                }}
              >
                <item.Icon className={`transition-colors duration-200 ${isActive ? "text-primary" : "text-icon"} group-hover:text-primary w-5 h-5`} />
                <span className={`ml-2 text-sm font-medium transition-colors duration-200 ${isActive ? "text-primary font-semibold" : "text-text"} group-hover:text-primary`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center lg:space-x-6">
          <span className="hidden lg:inline text-sm text-gray-500">{today}</span>
          <span className="hidden lg:inline">Dr.{decodedToken?.username || ""}</span>
          <button
            ref={mobileMenuBtnRef}
            onClick={() => setOpenMobileMenu(!openMobileMenu)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none"
          >
            {openMobileMenu ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>

          {/* User Dropdown */}
          <div className="lg:block hidden relative">
            <div
              ref={userBtnRef}
              onClick={() => setOpenUserDropdown(!openUserDropdown)}
              className="group cursor-pointer bg-primary rounded-full w-9 h-9 flex items-center justify-center hover:bg-primary-dark transition-colors"
            >
              <CircleUserRound className="text-white w-5 h-5" />
            </div>

            {openUserDropdown && (
              <div
                ref={userDropdownRef}
                className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-2xl border border-gray-100 z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="font-medium text-sm truncate">Dr.{decodedToken?.username || ""}</p>
                </div>

                <div
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setOpenUserDropdown(false);
                    logout();
                  }}
                >
                  <IoIosLogOut className="text-gray-500 mr-3" />
                  <span className="text-sm">Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {openMobileMenu && (
        <div
          ref={mobileMenuRef}
          className="fixed inset-0 z-50 bg-white mt-14 lg:hidden overflow-y-auto"
        >
          <div className="px-4 pt-2 pb-8 space-y-1">
            <div className="p-2 border-b border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">Welcome, Dr.{decodedToken?.username || ""}</p>
              <p className="text-sm text-gray-500">{today}</p>
            </div>

            {visibleNavItems.map((item) => {
              const isActive = activeNavItem === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (activeNavItem !== item.id) {
                      setActiveNavItem(item.id);
                    }
                    navigate(item.page);
                    setOpenMobileMenu(false);
                  }}
                  className={`flex items-center px-4 py-3 rounded-md text-sm font-medium cursor-pointer ${
                    isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </div>
              );
            })}

            <div
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer rounded-md"
              onClick={() => {
                setOpenMobileMenu(false);
                logout();
              }}
            >
              <IoIosLogOut className="text-gray-500 mr-3" />
              <span className="text-sm">Logout</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
