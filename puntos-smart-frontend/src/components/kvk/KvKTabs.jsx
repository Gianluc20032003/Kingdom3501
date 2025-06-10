// components/kvk/KvKTabs.jsx - Componente de navegación de pestañas

import React from "react";
import { useTranslation } from "../../contexts/TranslationContext";

const KvKTabs = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation();

  const tabs = [
    { id: "initial", label: `📊 ${t("kvk.initialData")}` },
    { id: "honor", label: `🏆 ${t("kvk.honor")}` },
    { id: "battles", label: `⚔️ ${t("kvk.battles")}` },
    { id: "summary", label: `📈 ${t("kvk.summaryAndScore")}` },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default KvKTabs;