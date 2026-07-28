import { staffGroupApi } from "../../api/staffApi";
import CrudResourcePage from "../../components/crud/CrudResourcePage";

const resource = {
  title: "Staff Groups",
  singular: "Staff Group",
  api: staffGroupApi,
  idField: "employeeGroupId",
  defaults: {
    employeeGroupId: 0,
    employeeGroupName: "",
    employeeGroupShortName: "",
    employeeGroupSeqNo: 0,
    rowVersionLong: 0,
  },
  fields: [
    { name: "employeeGroupId", hidden: true },
    { name: "rowVersionLong", hidden: true },
    {
      name: "employeeGroupName",
      label: "Group Name",
      type: "text",
      required: true,
      maxLength: 100,
      width: 260,
    },
    {
      name: "employeeGroupShortName",
      label: "Short Name",
      type: "text",
      maxLength: 50,
      width: 160,
    },
    {
      name: "employeeGroupSeqNo",
      label: "Seq No",
      type: "number",
      width: 100,
    },
  ],
};

export default function StaffGroupPage() {
  return <CrudResourcePage resource={resource} />;
}
