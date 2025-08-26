import useSWR from "swr";
import axios from "axios";

const fetcher = (url: string) => axios.get(url).then((res) => res.data.data);

export const useFetch = <T>(url: string, refreshInterval?: number) => {
  const { data, error, isLoading } = useSWR<T>(url, fetcher, { refreshInterval: refreshInterval || 0 });
  return { data, isLoading, isError: error };
};
