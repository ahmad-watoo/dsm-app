import api from "./axiosInstance";

const unwrap = (res) => res.data;

/**

 *  basePath: "/api/GEN/EmployeeCategory"
 *
 *   POST   {base}/GetList      body: DataTableRequestParam -> ResponseDataTableObject
 *   GET    {base}/GetAll                                   -> ResponseApiObject
 *   GET    {base}/GetById      ?Id=                        -> ResponseApiObject
 *   GET    {base}/GetBySearch  ?FromDate=&ToDate=          -> ResponseApiObject
 *   POST   {base}/Save         body: <Entity>Request       -> ResponseApiObject
 *   DELETE {base}/DeleteById   ?Id=                        -> ResponseApiObject
 *   POST   {base}/DeleteAll    body: <Entity>Request[]     -> ResponseApiObject
 */
export function createCrudApi(basePath) {
  return {
    basePath,

    getList: (dataTableParams) =>
      api.post(`${basePath}/GetList`, dataTableParams).then(unwrap),

    getAll: () => api.get(`${basePath}/GetAll`).then(unwrap),

    getById: (id) =>
      api.get(`${basePath}/GetById`, { params: { Id: id } }).then(unwrap),

    getBySearch: (fromDate, toDate) =>
      api
        .get(`${basePath}/GetBySearch`, {
          params: { FromDate: fromDate, ToDate: toDate },
        })
        .then(unwrap),

    // Save is create + update: id === 0 inserts, id > 0 updates.
    save: (payload) => api.post(`${basePath}/Save`, payload).then(unwrap),

    deleteById: (id) =>
      api.delete(`${basePath}/DeleteById`, { params: { Id: id } }).then(unwrap),

    // Bulk delete expects the full request objects, not just ids.
    deleteAll: (payloads) =>
      api.post(`${basePath}/DeleteAll`, payloads).then(unwrap),
  };
}
