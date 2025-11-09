import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);      // dữ liệu trả về
  const [loading, setLoading] = useState(true); // trạng thái loading
  const [error, setError] = useState(null);     // lỗi (nếu có)
  const [reloadFlag, setReloadFlag] = useState(0); // trigger reload

  // Hàm fetch dữ liệu
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(url, options);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [url, options, reloadFlag]);

  // Gọi fetch khi mount hoặc reloadFlag thay đổi
  useEffect(() => {
    if (!url) return;
    fetchData();
  }, [fetchData]);

  // Hàm reload dữ liệu (nếu muốn gọi lại API)
  const reload = useCallback(() => {
    setReloadFlag(prev => prev + 1);
  }, []);

  return { data, loading, error, reload };
};
