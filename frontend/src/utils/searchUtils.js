// utils/searchUtils.js

/**
 * Loại bỏ dấu tiếng Việt và chuẩn hóa chữ hoa/thường
 * @param {string} str
 * @returns {string}
 */
export function normalizeString(str) {
  return str
    .normalize('NFD')                // tách ký tự + dấu
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();                  // chuẩn hóa chữ thường
}

/**
 * Filter list theo search term, không phân biệt chữ hoa/thường và dấu
 * @param {Array} list - danh sách objects
 * @param {string} searchTerm - giá trị tìm kiếm
 * @param {function} getValueFn - hàm lấy trường muốn search từ object
 * @returns {Array} danh sách đã lọc
 */
export function filterList(list, searchTerm, getValueFn) {
  if (!searchTerm) return list;

  const normalizedSearch = normalizeString(searchTerm);
  return list.filter(item => 
    normalizeString(getValueFn(item)).includes(normalizedSearch)
  );
}

/**
 * Filter list theo search term và các field, không phân biệt chữ hoa/thường và dấu
 * @param {Array} list - danh sách object
 * @param {string} searchTerm - giá trị tìm kiếm
 * @param {Array<string>} fields - danh sách trường muốn search
 * @returns {Array} danh sách đã lọc
 */
export function filterListByFields(list, searchTerm, fields = []) {
  if (!searchTerm.trim()) return list;

  const keyword = normalizeString(searchTerm);

  return list.filter(item =>
    fields.some(field => normalizeString(item[field]).includes(keyword))
  );
}