import { Card, Typography } from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;

export default function ModuleMenu() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // const modules = user?.loginUserModules || [];
  const modules = (user?.loginUserModules || []).map((m) => m.loginModule || m);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 md:px-10">
      <div className="mb-8">
        <Title level={3} className="!mb-1">
          Welcome, {user?.loginName || "Admin"}
        </Title>
        <Text type="secondary">Select a module to continue</Text>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {modules.map((mod, i) => {
          return (
            <motion.div
              key={mod.appProductModuleId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <Card
                hoverable
                onClick={() => navigate(`/app/${mod.appModuleShortName}`)}
                className="text-center !rounded-xl !bg-gray-100  transition !hover:bg-gray-200"
              >
                <div className="flex flex-col items-center gap-3">
                  {mod.moduleImageURL ? (
                    <img
                      src={mod.moduleImageURL}
                      alt={mod.appModuleName}
                      className="w-14 h-14 object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xl">
                      {mod.appModuleShortName?.[0]}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-800">
                      {mod.appModuleName}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {mod.appModuleShortName}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
