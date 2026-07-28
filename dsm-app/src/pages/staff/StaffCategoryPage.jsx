import { useEffect, useMemo, useState } from "react";
import { staffCategoryApi, getControlCategoryForEmployee } from "../../api/staffApi";
import { isOk, toArray, toOptions } from "../../utils/apiHelpers";
import { useAuth } from "../../context/AuthContext";
import CrudResourcePage from "../../components/crud/CrudResourcePage";

/** The login payload does not name its client key consistently — try each. */
function resolveClientId(user) {
  const candidates = [
    user?.clientId,
    user?.loginClientId,
    user?.appClientId,
    user?.loginAppClientId,
    user?.loginAppClientProduct?.appClientId,
    user?.loginAppClientProduct?.clientId,
  ];
  const found = candidates.find((v) => Number(v) > 0);
  return Number(found) || 0;
}

export default function StaffCategoryPage() {
  const { user } = useAuth();
  const [controlCategories, setControlCategories] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(true);

  const clientId = resolveClientId(user);

  useEffect(() => {
    let cancelled = false;
    getControlCategoryForEmployee()
      .then((res) => {
        if (cancelled) return;
        const rows = isOk(res) ? toArray(res.data) : [];
        setControlCategories(
          toOptions(rows, {
            valueKeys: ["controlCategoryId"],
            labelKeys: [
              "controlCategoryName",
              "controlCategoryDisplayName",
              "name",
            ],
          }),
        );
      })
      .catch(() => {
        if (!cancelled) setControlCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLookupLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const resource = useMemo(
    () => ({
      title: "Staff Categories",
      singular: "Staff Category",
      api: staffCategoryApi,
      idField: "employeeCategoryId",
      defaults: {
        employeeCategoryId: 0,
        clientId,
        controlCategoryId: null,
        employeeCategoryName: "",
        employeeCategoryPrefix: "",
        seqNo: 0,
        isActive: true,
        rowVersionLong: 0,
      },
      fields: [
        { name: "employeeCategoryId", hidden: true },
        { name: "rowVersionLong", hidden: true },
        {
          name: "employeeCategoryName",
          label: "Category Name",
          type: "text",
          required: true,
          maxLength: 100,
          width: 240,
        },
        {
          name: "employeeCategoryPrefix",
          label: "Prefix",
          type: "text",
          maxLength: 20,
          width: 120,
        },
        {
          name: "controlCategoryId",
          label: "Control Category",
          type: "select",
          options: controlCategories,
          loading: lookupLoading,
          width: 200,
        },
        { name: "seqNo", label: "Seq No", type: "number", width: 100 },
        {
          name: "isActive",
          label: "Active",
          type: "switch",
          width: 110,
          sortable: false,
        },
        {
          name: "clientId",
          label: "Client Id",
          type: "number",
          inTable: false,
          help: "Taken from the signed-in session; change only if required.",
        },
      ],
    }),
    [controlCategories, lookupLoading, clientId],
  );

  return <CrudResourcePage resource={resource} />;
}
