import { useState, useEffect } from "react";
import { Input, Select, Checkbox } from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import { userAndPasswordValidate } from "../api/loginApi";
import { useAuth } from "../context/AuthContext";

export default function LoginStep2() {
  const [password, setPassword] = useState("");
  const [locationId, setLocationId] = useState();
  const [fiscalYearId, setFiscalYearId] = useState();
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { pendingLogin, completeLogin } = useAuth();

  const product = pendingLogin?.userInfo?.loginAppClientProduct;
  const locations = product?.appClientProductLocations || [];
  const fiscalYears = product?.appClientFiscalYears || [];

  useEffect(() => {
    if (!pendingLogin) {
      navigate("/login");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (locations.length) setLocationId(locations[0].appClientLocationId);
    if (fiscalYears.length)
      setFiscalYearId(fiscalYears[0].appClientFiscalYearId);
  }, []);

  const handleLogin = async () => {
    if (!password) return setError("Please enter your password");
    setError("");
    setLoading(true);
    try {
      const { loginId, userInfo } = pendingLogin;
      const product = userInfo.loginAppClientProduct;
      const connectionId =
        product?.appClientConnections?.[0]?.appClientConnectionId;
      const fiscalYearId =
        product?.appClientFiscalYears?.[0]?.appClientFiscalYearId;
      const locationId =
        product?.appClientProductLocations?.[0]?.appClientLocationId;

      const res = await userAndPasswordValidate({
        loginAppClientProductId: userInfo.loginAppClientProductId,
        loginAppClientLocationId: locationId,
        loginAppClientFiscalYearId: fiscalYearId,
        loginAppClientConnectionId: connectionId,
        loginId,
        loginPassword: password,
      });

      if (res.statusCode === 200 && res.data?.loginAccessToken) {
        // res.data contains: token, loginUserModules (module tiles), loginUserMenus (sidebar tree)
        completeLogin(res.data, res.data.loginAccessToken);
        navigate("/modules");
      } else {
        setError(res.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row w-100%">
      <div className="hidden sm:flex sm:w-1/2 relative">
        <div className="absolute bottom-10 left-8 text-white z-10">
          <h2
            className="text-2xl font-semibold mb-1"
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
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <label className="text-xs text-gray-400 mb-1 block">Login Id</label>
          <Input
            size="large"
            value={pendingLogin?.loginId}
            disabled
            className="!bg-gray-100 !text-gray-700 !mb-4"
          />

          <label className="text-xs text-gray-400 mb-1 block">Password</label>
          <Input.Password
            size="large"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPressEnter={handleLogin}
            autoFocus
            className="!mb-4"
          />

          {locations.length > 0 && (
            <>
              <label className="text-xs text-gray-400 mb-1 block">
                Location
              </label>
              <Select
                size="large"
                className="!w-full !mb-4"
                value={locationId}
                onChange={setLocationId}
                options={locations.map((l) => ({
                  value: l.appClientLocationId,
                  label: l.appClientLocation?.locationName,
                }))}
              />
            </>
          )}

          {fiscalYears.length > 0 && (
            <>
              <label className="text-xs text-gray-400 mb-1 block">
                Fiscal Year
              </label>
              <Select
                size="large"
                className="!w-full !mb-4"
                value={fiscalYearId}
                onChange={setFiscalYearId}
                options={fiscalYears.map((f) => ({
                  value: f.appClientFiscalYearId,
                  label: f.fiscalYearName,
                }))}
              />
            </>
          )}

          <div className="flex items-center justify-between mt-2">
            <Checkbox
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            >
              Remember
            </Checkbox>
            <button
              onClick={handleLogin}
              disabled={loading}
              className={`bg-brand-100 text-gray-50 cursor-pointer text-brand-700 font-medium px-6 py-2 rounded-lg hover:bg-brand-200 ${loading ? "bg-blue-600" : "bg-blue-600"} transition disabled:opacity-60`}
            >
              {loading ? <LoadingOutlined /> : "Login →"}
            </button>
          </div>

          <div className="flex justify-between mt-6 text-sm">
            <button
              onClick={() => navigate("/login")}
              className="text-gray-500 flex items-center gap-1 cursor-pointer"
            >
              ← Back
            </button>
            <span className="text-gray-500 cursor-pointer">
              Forgot Password
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
