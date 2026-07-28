import { staffGradeApi } from "../../api/staffApi";
import CrudResourcePage from "../../components/crud/CrudResourcePage";

const resource = {
  title: "Staff Grades",
  singular: "Staff Grade",
  api: staffGradeApi,
  idField: "employeeGradeId",
  defaults: {
    employeeGradeId: 0,
    employeeGradeName: "",
    employeeGradeCode: "",
    employeeGradeSeqNo: 0,
    rowVersionLong: 0,
  },
  fields: [
    { name: "employeeGradeId", hidden: true },
    { name: "rowVersionLong", hidden: true },
    {
      name: "employeeGradeName",
      label: "Grade Name",
      type: "text",
      required: true,
      maxLength: 100,
      width: 260,
    },
    {
      name: "employeeGradeCode",
      label: "Grade Code",
      type: "text",
      maxLength: 50,
      width: 160,
    },
    {
      name: "employeeGradeSeqNo",
      label: "Seq No",
      type: "number",
      width: 100,
    },
  ],
};

export default function StaffGradePage() {
  return <CrudResourcePage resource={resource} />;
}
