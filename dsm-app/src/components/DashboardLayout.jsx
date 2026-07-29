import { useState, useMemo } from "react";
import {
  Menu,
  Avatar,
  Dropdown,
  Empty,
  Breadcrumb,
  Drawer,
  Button,
} from "antd";
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import {
  useNavigate,
  Outlet,
  useParams,
  useSearchParams,
  Link,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { buildMenuTree } from "../utils/buildMenuTree";
import useWindowSize from "../hooks/useWindowSize";

//  breadcrumb titles for the tabbed staff screens.
const TAB_LABELS = {
  staffcategory: "Staff Category",
  staffgroup: "Staff Group",
  staffgrade: "Staff Grade",
};

const menuKey = (n) =>
  String(n.appProductMenuId ?? n.appMenuId ?? n.appMenuName);

// Recursive transformation to Ant Design Menu Items
function toAntdItems(nodes) {
  if (!Array.isArray(nodes)) return [];

  return nodes
    .filter((n) => n && !n.isMenuSeparator)
    .map((n) => {
      const hasChildren = Array.isArray(n.children) && n.children.length > 0;
      return {
        key: menuKey(n),
        label: n.appMenuDisplayName || n.appMenuName || "Menu Item",
        children: hasChildren ? toAntdItems(n.children) : undefined,
      };
    });
}

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { isMobile } = useWindowSize();
  const navigate = useNavigate();
  // const location = useLocation();
  const [searchParams] = useSearchParams();
  const { moduleShortName } = useParams();
  const { user, logout } = useAuth();

  // Normalize user modules safely
  const normalizedModules = useMemo(
    () =>
      (user?.loginUserModules || [])
        .map((m) => (m && m.loginModule ? m.loginModule : m))
        .filter(Boolean),
    [user],
  );

  // Active module lookup
  const currentModule = useMemo(
    () =>
      normalizedModules.find(
        (mod) =>
          mod?.appModuleShortName?.toLowerCase() ===
          moduleShortName?.toLowerCase(),
      ),
    [normalizedModules, moduleShortName],
  );

  // Build menu hierarchy
  const menuTree = useMemo(() => {
    if (!user?.loginUserMenus || !currentModule) return [];
    return buildMenuTree(user.loginUserMenus, currentModule.appProductModuleId);
  }, [user, currentModule]);

  const antdItems = useMemo(() => toAntdItems(menuTree), [menuTree]);

  // Recursively search clicked menu node
  const findNode = (nodes, key) => {
    if (!Array.isArray(nodes)) return null;
    for (const n of nodes) {
      if (n && menuKey(n) === key) return n;
      if (n?.children?.length) {
        const found = findNode(n.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  const handleMenuClick = ({ key }) => {
    const node = findNode(menuTree, key);
    if (!node) return;
    setMobileOpen(false);

    if (
      ["StaffCategory", "StaffGroup", "StaffGrade"].includes(node.appMenuName)
    ) {
      navigate(
        `/app/${moduleShortName}/staff?tab=${node.appMenuName.toLowerCase()}`,
      );
    } else {
      navigate(
        `/app/${moduleShortName}/page?name=${node.appMenuName}&label=${encodeURIComponent(
          node.appMenuDisplayName || node.appMenuName,
        )}`,
      );
    }
  };
  const handleToggleMenu = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };
  const userMenuItems = {
    items: [
      {
        key: "modules",
        icon: <AppstoreOutlined />,
        label: "Switch Module",
        onClick: () => navigate("/modules"),
      },
      { type: "divider" },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        danger: true,
        label: "Logout",
        onClick: () => {
          logout?.();
          navigate("/login");
        },
      },
    ],
  };

  // Extract Page Label for Breadcrumb
  const activeTab = searchParams.get("tab");
  const currentLabel =
    searchParams.get("label") ||
    (activeTab && (TAB_LABELS[activeTab.toLowerCase()] || activeTab)) ||
    "Overview";

  // Fallback Guard
  if (!currentModule) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border text-center max-w-sm w-full">
          <Empty description={`Module "${moduleShortName}" not found`} />
          <Button
            type="primary"
            className="mt-4 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => navigate("/modules")}
          >
            Back to Modules
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100/60 font-sans">
      {/* TOP SYSTEM NAVBAR */}
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          {/* SINGLE RESPONSIVE TOGGLE BUTTON */}
          <Button
            type="text"
            icon={<MenuOutlined className="text-gray-700 text-lg" />}
            onClick={handleToggleMenu}
            className="flex items-center justify-center p-2"
          />

          <h1 className="font-bold text-gray-800 text-base md:text-lg mb-0 flex items-center gap-2">
            <span>{currentModule?.appModuleName || "Management Portal"}</span>
          </h1>
        </div>

        {/* Right Header Metadata & Profile */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-indigo-900 leading-tight">
              Education Foundation
            </p>
            <p className="text-[11px] text-gray-400">Head Office - Lahore</p>
          </div>

          <Dropdown menu={userMenuItems} trigger={["click"]}>
            <div className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Avatar
                icon={<UserOutlined />}
                className="bg-indigo-100 text-indigo-600 border border-indigo-200"
              />
              <span className="hidden sm:inline-block text-xs font-semibold text-gray-700">
                {user?.loginName || "Administrator"}
              </span>
            </div>
          </Dropdown>
        </div>
      </header>
      {/* 2. MAIN LAYOUT SHELL */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden sm:block bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              🎓
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="font-bold text-gray-800 text-sm block truncate">
                  {currentModule?.appModuleShortName || "DSM"}
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                  Active Module
                </span>
              </div>
            )}
          </div>

          <Menu
            mode="inline"
            items={antdItems}
            onClick={handleMenuClick}
            inlineCollapsed={collapsed}
            className="!border-0 py-2 select-none"
          />
        </aside>

        {/* MOBILE DRAWER SIDEBAR */}
        <Drawer
          title={
            <div className="flex items-center gap-2">
              <span className="text-xl">🎓</span>
              <span className="font-bold text-gray-800">
                {currentModule?.appModuleShortName || "DSM"}
              </span>
            </div>
          }
          placement="left"
          onClose={() => setMobileOpen(false)}
          open={mobileOpen}
          size={280}
        >
          <Menu
            mode="inline"
            items={antdItems}
            onClick={handleMenuClick}
            className="!border-0"
          />
        </Drawer>

        {/* 3. WORKSPACE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col">
          {/* Breadcrumb Bar */}
          <div className="bg-white border border-gray-200/80 rounded-xl px-4 py-3 mb-5 shadow-xs flex items-center justify-between">
            <Breadcrumb
              items={[
                {
                  title: (
                    <Link
                      to="/modules"
                      className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-600"
                    >
                      <HomeOutlined />
                      <span className="pl-1">Modules</span>
                    </Link>
                  ),
                },
                {
                  title: (
                    <span className="text-gray-500 font-medium">
                      {currentModule?.appModuleShortName}
                    </span>
                  ),
                },
                {
                  title: (
                    <span className="text-indigo-600 font-semibold capitalize">
                      {currentLabel}
                    </span>
                  ),
                },
              ]}
            />
          </div>

          {/* Page Dynamic Router View */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
