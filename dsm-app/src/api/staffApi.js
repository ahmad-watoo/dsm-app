import api from "./axiosInstance";
import { createCrudApi } from "./crudFactory";

// Staff master data lives under the General API as "Employee*" controllers.
export const staffCategoryApi = createCrudApi("/api/GEN/EmployeeCategory");
export const staffGroupApi = createCrudApi("/api/GEN/EmployeeGroup");
export const staffGradeApi = createCrudApi("/api/GEN/EmployeeGrade");

// Lookups used by the Staff Category form.
export const getControlCategoryForEmployee = () =>
  api.get("/api/DBO/Data/GetControlCategoryForEmployee").then((r) => r.data);

export const getClientData = () =>
  api.get("/api/DBO/Data/GetClientData").then((r) => r.data);
