import { useSearchParams } from "react-router-dom";
import { Breadcrumb, Empty } from "antd";

export default function MenuPage() {
  const [params] = useSearchParams();
  const label = params.get("label") || "Page";

  return (
    <div>
      <Breadcrumb
        className="mb-4 bg-white px-4 py-2 rounded-lg"
        items={[{ title: label }]}
      />
      <div className="bg-white rounded-xl shadow-sm p-10">
        <Empty
          description={`"${label}" screen — not built yet in this task scope`}
        />
      </div>
    </div>
  );
}
