// components/common/Sidebar.jsx - Versión actualizada con traductor
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "../../contexts/TranslationContext";
import { modulesAPI } from "../../services/api";
import {
  HomeIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  FireIcon,
  TrophyIcon,
  UsersIcon,
  CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [moduleConfigs, setModuleConfigs] = useState({});
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    loadModuleConfigs();
  }, []);

  const loadModuleConfigs = async () => {
    try {
      const response = await modulesAPI.getConfig();
      if (response.success) {
        setModuleConfigs(response.data.modules);
      }
    } catch (error) {
      console.error("Error loading module configs:", error);
    }
  };

  const menuItems = [
    {
      name: t("nav.home"),
      path: "/dashboard",
      icon: HomeIcon,
      enabled: true,
    },
    {
      name: t("nav.fortresses"),
      path: "/fortalezas",
      icon: BuildingStorefrontIcon,
      enabled: moduleConfigs.fortalezas_barbaras?.habilitado !== false,
      key: "fortalezas_barbaras",
    },
    {
      name: t("nav.mobilization"),
      path: "/movilizacion",
      icon: ShoppingCartIcon,
      enabled: moduleConfigs.movilizacion?.habilitado !== false,
      key: "movilizacion",
    },
    {
      name: t("nav.kvk"),
      path: "/kvk",
      icon: FireIcon,
      enabled: moduleConfigs.kvk?.habilitado !== false,
      key: "kvk",
    },
    {
      name: t("nav.mge"),
      path: "/mge",
      icon: TrophyIcon,
      enabled: moduleConfigs.mge?.habilitado !== false,
      key: "mge",
    },
    {
      name: t("nav.aoo"),
      path: "/aoo",
      icon: UsersIcon,
      enabled: moduleConfigs.aoo?.habilitado !== false,
      key: "aoo",
    },
  ];

  const adminItems = [
    {
      name: t("nav.admin"),
      path: "/admin",
      icon: CogIcon,
      enabled: user?.es_admin,
    },
    {
      name: t("nav.adminAoo"),
      path: "/admin-aoo",
      icon: CogIcon,
      enabled: user?.es_admin,
    },
    {
      name: t("nav.adminMge"),
      path: "/admin-mge",
      icon: CogIcon,
      enabled: user?.es_admin,
    },
    {
      name: t("nav.adminKvk"),
      path: "/admin-kvk",
      icon: CogIcon,
      enabled: user?.es_admin,
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const MenuItem = ({ item }) => {
    const Icon = item.icon;

    if (!item.enabled) return null;

    return (
      <Link
        to={item.path}
        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive(item.path)
            ? "bg-purple-600 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        } ${collapsed ? "justify-center" : ""}`}
      >
        <Icon className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`} />
        {!collapsed && <span>{item.name}</span>}
      </Link>
    );
  };

  return (
    <div
      className={`bg-gradient-to-b from-gray-800 to-gray-900 text-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } min-h-screen shadow-xl`}
    >
      {/* Header del sidebar */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-white">Reino 3501</h2>
              <p className="text-xs text-gray-400">Kingdom Smart</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
          >
            {collapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <MenuItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Sección de administración */}
      {user?.es_admin && (
        <>
          <div className="px-4">
            <div className="border-t border-gray-700"></div>
          </div>
          <nav className="p-4 space-y-1">
            {!collapsed && (
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {t("nav.admin")}
              </div>
            )}
            {adminItems.map((item) => (
              <MenuItem key={item.path} item={item} />
            ))}
          </nav>
        </>
      )}

      {/* Usuario info en la parte inferior */}
      <div className="relative bottom-4 left-0 right-0 px-4">
        <div
          className={`bg-gray-700 rounded-lg p-3 ${
            collapsed ? "text-center" : ""
          }`}
        >
          {collapsed ? (
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-xs font-bold">
                {user?.nombre_usuario?.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-white truncate">
                {user?.nombre_usuario}
              </p>
              <p className="text-xs text-gray-400">
                {user?.es_admin
                  ? t("dashboard.administrator")
                  : t("common.user")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
