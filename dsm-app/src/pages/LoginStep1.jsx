import { useState } from "react";
import { Input, Checkbox, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { userValidate } from "../api/loginApi";
import { useAuth } from "../context/AuthContext";

const { Text } = Typography;

export default function LoginStep1() {
  const [loginId, setLoginId] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setPendingLogin } = useAuth();

  const handleNext = async () => {
    if (!loginId.trim()) return setError("Please enter your Login Id");
    setError("");
    setLoading(true);
    try {
      const res = await userValidate(loginId.trim());
      if (res.statusCode === 200 && res.data) {
        setPendingLogin({ loginId: loginId.trim(), userInfo: res.data });
        navigate("/login/password");
      } else {
        setError(res.message || "User not found");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to validate user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row w-full">
      <div className="hidden sm:flex sm:w-1/2 relative">
        <div className="absolute bottom-10 left-8 z-10">
          <h2
            className="text-2xl font-semibold mb-1 "
            style={{ color: "white" }}
          >
            Get Inspired and Create.
          </h2>
          <p className="text-gray-400 text-sm">Copyright © 2026</p>
        </div>
        <img
          src="https://images.pexels.com/photos/26756127/pexels-photo-26756127.jpeg"
          alt="Login Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full sm:w-1/2 min-h-screen flex items-center justify-center px-6 sm:px-8 md:px-10 py-10 bg-white">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-10 flex items-center gap-2">
            <span className="text-brand-600 text-xl">🎓</span>
            <span className="font-semibold text-lg">
              HTAG <span className="text-brand-600">Solutions</span>
            </span>
          </div>

          <h1 className="text-2xl  " style={{ color: "gray" }}>
            Welcome to DSM
          </h1>
          <p className="text-gray-600 mb-8">It's a great day today!</p>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <label className="text-xs text-gray-400 mb-1 block">Login Id</label>
          <Input
            size="large"
            placeholder="admin@nef.dsm"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            onPressEnter={handleNext}
            autoFocus
            className="!py-3"
          />

          <div className="flex items-center justify-between mt-6">
            <Checkbox
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            >
              Remember
            </Checkbox>
            <button
              onClick={handleNext}
              disabled={loading}
              className={`bg-brand-100 text-gray-50 cursor-pointer text-brand-700 font-medium px-6 py-2 rounded-lg hover:bg-brand-200 ${loading ? "bg-blue-600" : "bg-blue-600"} transition disabled:opacity-60`}
            >
              {loading ? <LoadingOutlined /> : "Next"}
            </button>
          </div>

          <Text type="secondary" className="block mt-6 cursor-pointer text-sm">
            Forgot UserName
          </Text>
        </motion.div>
      </div>
    </div>
  );
}
