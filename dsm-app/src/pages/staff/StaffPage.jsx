import { Tabs } from "antd";
import { useSearchParams } from "react-router-dom";
import StaffCategoryPage from "./StaffCategoryPage";
import StaffGroupPage from "./StaffGroupPage";
import StaffGradePage from "./StaffGradePage";

// Keys match the `?tab=` value the sidebar sends (appMenuName lowercased).
const TABS = [
  { key: "staffcategory", label: "Staff Category", Component: StaffCategoryPage },
  { key: "staffgroup", label: "Staff Group", Component: StaffGroupPage },
  { key: "staffgrade", label: "Staff Grade", Component: StaffGradePage },
];

export default function StaffPage() {
  const [params, setParams] = useSearchParams();
  const requested = (params.get("tab") || "").toLowerCase();
  const activeKey = TABS.some((t) => t.key === requested)
    ? requested
    : TABS[0].key;

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl shadow-xs p-2 sm:p-4">
      <Tabs
        activeKey={activeKey}
        onChange={(key) => setParams({ tab: key }, { replace: true })}
        items={TABS.map(({ key, label, Component }) => ({
          key,
          label,
          children: <Component />,
        }))}
      />
    </div>
  );
}
