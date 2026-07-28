export const isOk = (res) => res?.statusCode === 200;

export const apiMessage = (res, fallback) => res?.message || fallback;

/** Pulls an array out of whatever shape `data` came back as. */
export function toArray(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  for (const key of ["items", "list", "rows", "records", "data", "result"]) {
    if (Array.isArray(data[key])) return data[key];
  }
  return [];
}

/** Pulls a single record out of `data` (Save/GetById sometimes return an array of one). */
export function toRecord(data) {
  if (Array.isArray(data)) return data[0] ?? null;
  return data ?? null;
}

/** Reads an axios error into a message we can show the user. */
export function errorMessage(err, fallback = "Something went wrong") {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.title ||
    err?.message ||
    fallback
  );
}

export function buildDataTableParams({
  draw = 1,
  page = 1,
  pageSize = 10,
  search = "",
  sortField,
  sortDir = "asc",
  fields = [],
  filters = "",
}) {
  const columns = fields.map((field) => ({
    data: field,
    name: field,
    searchable: true,
    orderable: true,
    search: { value: "", regex: "false" },
  }));

  const sortIndex = sortField ? fields.indexOf(sortField) : -1;

  return {
    draw,
    start: (page - 1) * pageSize,
    length: pageSize,
    filters,
    columns,
    search: { value: search || "", regex: "false" },
    order: sortIndex >= 0 ? [{ column: sortIndex, dir: sortDir }] : [],
  };
}

export function toOptions(data, { valueKeys = [], labelKeys = [] } = {}) {
  return toArray(data)
    .map((row) => {
      if (row === null || typeof row !== "object") {
        return { value: row, label: String(row) };
      }

      const keys = Object.keys(row);
      const valueKey =
        valueKeys.find((k) => row[k] !== undefined) ||
        keys.find((k) => /id$/i.test(k) && typeof row[k] !== "object");
      const labelKey =
        labelKeys.find((k) => row[k] !== undefined) ||
        keys.find((k) => typeof row[k] === "string" && !/id$/i.test(k));

      if (valueKey === undefined) return null;

      return {
        value: row[valueKey],
        label: String(row[labelKey] ?? row[valueKey]),
      };
    })
    .filter((option) => option && option.value !== undefined);
}
