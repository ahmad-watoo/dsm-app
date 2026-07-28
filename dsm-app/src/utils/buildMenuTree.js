export function buildMenuTree(allMenus, appProductModuleId) {
  const moduleMenus = allMenus.filter(
    (m) => m.appProductModuleId === appProductModuleId,
  );

  const byId = {};
  moduleMenus.forEach((m) => {
    byId[m.appProductMenuId] = { ...m, children: [] };
  });

  const roots = [];
  moduleMenus.forEach((m) => {
    const node = byId[m.appProductMenuId];
    if (m.parentAppMenuId && byId[m.parentAppMenuId]) {
      byId[m.parentAppMenuId].children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortTree = (nodes) => {
    nodes.sort((a, b) => a.appMenuSeqNo - b.appMenuSeqNo);
    nodes.forEach((n) => n.children.length && sortTree(n.children));
  };
  sortTree(roots);

  return roots;
}
