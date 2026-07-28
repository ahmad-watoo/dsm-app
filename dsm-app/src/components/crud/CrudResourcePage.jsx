import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import {
  apiMessage,
  buildDataTableParams,
  errorMessage,
  isOk,
  toArray,
  toRecord,
} from "../../utils/apiHelpers";

const { RangePicker } = DatePicker;

const PAGE_SIZES = ["10", "20", "50", "100"];

export default function CrudResourcePage({ resource }) {
  const { title, singular, api: crudApi, idField, fields, defaults } = resource;

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ field: undefined, dir: "asc" });
  const [dateRange, setDateRange] = useState(null);

  const [selectedKeys, setSelectedKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingKey, setDeletingKey] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [form] = Form.useForm();
  const drawRef = useRef(0);

  const tableFields = useMemo(
    () => fields.filter((f) => f.inTable !== false && !f.hidden),
    [fields],
  );
  const formFields = useMemo(
    () => fields.filter((f) => f.inForm !== false && !f.hidden),
    [fields],
  );

  const columnNames = useMemo(
    () => tableFields.map((f) => f.name).join(","),
    [tableFields],
  );

  const toPayload = useCallback(
    (values, sourceRow) => {
      const payload = {};
      for (const field of fields) {
        const raw = values?.[field.name] ?? sourceRow?.[field.name];
        payload[field.name] =
          raw === undefined || raw === null
            ? (defaults?.[field.name] ??
              (field.type === "switch" ? false : null))
            : raw;
      }
      payload[idField] = Number(sourceRow?.[idField] ?? 0) || 0;
      return payload;
    },
    [fields, defaults, idField],
  );

  const load = useCallback(async () => {
    const names = columnNames ? columnNames.split(",") : [];
    setLoading(true);
    setLoadError("");
    try {
      if (dateRange?.[0] && dateRange?.[1]) {
        const res = await crudApi.getBySearch(
          dateRange[0].format("YYYY-MM-DD"),
          dateRange[1].format("YYYY-MM-DD"),
        );
        if (!isOk(res)) throw new Error(apiMessage(res, "Failed to load data"));

        const all = toArray(res.data);
        const needle = search.trim().toLowerCase();
        const filtered = needle
          ? all.filter((row) =>
              names.some((name) =>
                String(row?.[name] ?? "")
                  .toLowerCase()
                  .includes(needle),
              ),
            )
          : all;

        setTotal(filtered.length);
        setRows(filtered.slice((page - 1) * pageSize, page * pageSize));
        return;
      }

      drawRef.current += 1;
      const res = await crudApi.getList(
        buildDataTableParams({
          draw: drawRef.current,
          page,
          pageSize,
          search,
          sortField: sort.field,
          sortDir: sort.dir,
          fields: names,
        }),
      );
      if (!isOk(res)) throw new Error(apiMessage(res, "Failed to load data"));

      setRows(toArray(res.data));
      setTotal(res.recordsFiltered ?? res.recordsTotal ?? 0);
    } catch (err) {
      const message = errorMessage(err, `Could not load ${title}`);
      setLoadError(message);
      setRows([]);
      setTotal(0);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [crudApi, page, pageSize, search, sort, dateRange, columnNames, title]);

  useEffect(() => {
    // Fetching is the effect's purpose here; the loading flag it sets is local.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Debounce the search box so typing does not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const clearSelection = () => {
    setSelectedKeys([]);
    setSelectedRows([]);
  };

  const refresh = () => {
    clearSelection();
    load();
  };

  // -------------------------------------------------------------------- form
  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ ...defaults });
    setModalOpen(true);
  };

  const openEdit = async (row) => {
    setEditing(row);
    form.resetFields();
    form.setFieldsValue({ ...defaults, ...row });
    setModalOpen(true);

    try {
      const res = await crudApi.getById(row[idField]);
      const fresh = isOk(res) ? toRecord(res.data) : null;
      if (fresh) {
        setEditing((current) =>
          current?.[idField] === row[idField]
            ? { ...current, ...fresh }
            : current,
        );
        form.setFieldsValue({ ...defaults, ...row, ...fresh });
      }
    } catch {
      // Keep the row we already have — the list data is good enough to edit.
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const submit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setSaving(true);
    try {
      const res = await crudApi.save(toPayload(values, editing));
      if (!isOk(res)) throw new Error(apiMessage(res, "Save failed"));

      toast.success(
        apiMessage(res, `${singular} ${editing ? "updated" : "created"}`),
      );
      closeModal();
      clearSelection();
      if (!editing) setPage(1);
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  //  delete
  const removeOne = async (row) => {
    setDeletingKey(row[idField]);
    try {
      const res = await crudApi.deleteById(row[idField]);
      if (!isOk(res)) throw new Error(apiMessage(res, "Delete failed"));

      toast.success(apiMessage(res, `${singular} deleted`));
      clearSelection();
      // Step back a page when the last row of the page is removed.
      setPage((current) =>
        rows.length === 1 && current > 1 ? current - 1 : current,
      );
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Delete failed"));
    } finally {
      setDeletingKey(null);
    }
  };

  const removeSelected = async () => {
    if (!selectedRows.length) return;
    setBulkDeleting(true);
    try {
      const res = await crudApi.deleteAll(
        selectedRows.map((row) => toPayload(row, row)),
      );
      if (!isOk(res)) throw new Error(apiMessage(res, "Delete failed"));

      toast.success(
        apiMessage(res, `${selectedRows.length} record(s) deleted`),
      );
      clearSelection();
      setPage(1);
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Delete failed"));
    } finally {
      setBulkDeleting(false);
    }
  };

  //  columns
  const columns = useMemo(() => {
    const dataColumns = tableFields.map((field) => ({
      key: field.name,
      title: field.label,
      dataIndex: field.name,
      width: field.width,
      ellipsis: true,
      sorter: dateRange ? false : field.sortable !== false,
      sortOrder:
        sort.field === field.name
          ? sort.dir === "asc"
            ? "ascend"
            : "descend"
          : null,
      render: (value, row) => {
        if (field.render) return field.render(value, row);
        if (field.type === "switch") {
          return value ? (
            <Tag color="green">Active</Tag>
          ) : (
            <Tag color="default">Inactive</Tag>
          );
        }
        if (field.type === "select") {
          const match = field.options?.find((o) => o.value === value);
          return match?.label ?? value ?? "—";
        }
        return value === null || value === undefined || value === ""
          ? "—"
          : String(value);
      },
    }));

    return [
      ...dataColumns,
      {
        key: "actions",
        title: "Actions",
        align: "right",
        width: 110,
        fixed: "right",
        render: (_, row) => (
          <Space size={4}>
            <Tooltip title="Edit">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEdit(row)}
              />
            </Tooltip>
            <Popconfirm
              title={`Delete this ${singular.toLowerCase()}?`}
              description="This cannot be undone."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() => removeOne(row)}
            >
              <Tooltip title="Delete">
                <Button
                  type="text"
                  size="small"
                  danger
                  loading={deletingKey === row[idField]}
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableFields, sort, dateRange, deletingKey, singular, idField, rows]);

  const renderInput = (field) => {
    if (field.type === "switch") return <Switch />;
    if (field.type === "number")
      return (
        <InputNumber
          className="!w-full"
          min={field.min ?? 0}
          placeholder={field.placeholder || field.label}
        />
      );
    if (field.type === "select")
      return (
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          loading={field.loading}
          options={field.options || []}
          placeholder={field.placeholder || `Select ${field.label}`}
          notFoundContent={field.loading ? "Loading…" : "No options"}
        />
      );
    return (
      <Input
        maxLength={field.maxLength}
        placeholder={field.placeholder || field.label}
      />
    );
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl shadow-xs">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder={`Search ${title.toLowerCase()}…`}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full sm:!w-64"
          />
          <RangePicker
            value={dateRange}
            onChange={(range) => {
              setDateRange(range && range[0] && range[1] ? range : null);
              setPage(1);
              clearSelection();
            }}
            className="w-full sm:!w-auto"
          />
          <Tooltip title="Refresh">
            <Button icon={<ReloadOutlined />} onClick={refresh} />
          </Tooltip>
        </div>

        <div className="flex items-center gap-2">
          {selectedKeys.length > 0 && (
            <Popconfirm
              title={`Delete ${selectedKeys.length} record(s)?`}
              description="This cannot be undone."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={removeSelected}
            >
              <Button danger icon={<DeleteOutlined />} loading={bulkDeleting}>
                Delete ({selectedKeys.length})
              </Button>
            </Popconfirm>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New {singular}
          </Button>
        </div>
      </div>

      <Table
        size="middle"
        rowKey={(row) => row[idField]}
        columns={columns}
        dataSource={rows}
        loading={loading}
        scroll={{ x: "max-content" }}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: (keys, selection) => {
            setSelectedKeys(keys);
            setSelectedRows(selection);
          },
        }}
        onChange={(_pagination, _filters, sorter) => {
          if (dateRange) return;
          const next = Array.isArray(sorter) ? sorter[0] : sorter;
          setSort(
            next?.order
              ? {
                  field: next.field,
                  dir: next.order === "ascend" ? "asc" : "desc",
                }
              : { field: undefined, dir: "asc" },
          );
        }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZES,
          showTotal: (count, [from, to]) => `${from}-${to} of ${count}`,
          onChange: (nextPage, nextSize) => {
            setPage(nextSize !== pageSize ? 1 : nextPage);
            setPageSize(nextSize);
          },
        }}
        locale={{
          emptyText: (
            <Empty
              description={
                loadError || `No ${title.toLowerCase()} records found`
              }
            />
          ),
        }}
      />

      <Modal
        title={`${editing ? "Edit" : "New"} ${singular}`}
        open={modalOpen}
        onCancel={closeModal}
        onOk={submit}
        okText={editing ? "Update" : "Create"}
        confirmLoading={saving}
        destroyOnHidden
        mask={{ closable: !saving }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={defaults}
          className="pt-2"
          onFinish={submit}
        >
          {formFields.map((field) => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              extra={field.help}
              valuePropName={field.type === "switch" ? "checked" : "value"}
              rules={
                field.required
                  ? [{ required: true, message: `${field.label} is required` }]
                  : undefined
              }
            >
              {renderInput(field)}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  );
}
