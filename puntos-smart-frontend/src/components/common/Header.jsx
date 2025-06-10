// components/common/Header.jsx - Versión actualizada con traductor
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { useTranslation } from "../../contexts/TranslationContext";
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import LanguageSelector from "./LanguageSelector";

const Header = () => {
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await logout();
      showAlert(t("auth.sessionClosed"), "info");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo y título */}
          <div className="flex items-center">
            <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Kingdom Smart</h1>
              <p className="text-xs text-gray-500">Reino 3501</p>
            </div>
          </div>

          {/* Usuario y acciones */}
          <div className="flex items-center space-x-4">
            {/* Selector de idioma */}
            <LanguageSelector />

            {/* Información del usuario */}
            <div className="hidden sm:flex items-center space-x-3">
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {user?.nombre_usuario}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.es_admin
                    ? t("dashboard.administrator")
                    : t("common.user")}
                </p>
              </div>
            </div>

            {/* Badge de admin */}
            {user?.es_admin && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {t("nav.admin")}
              </span>
            )}

            {/* Botón de cerrar sesión */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t("auth.logout")}</span>
              <span className="sm:hidden">{t("auth.logout")}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
