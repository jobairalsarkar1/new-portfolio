import useSWR from "swr";
import axios from "axios";

const fetcher = (url: string) => axios.get(url).then((res) => res.data.data);

export const useFetch = <T>(url: string) => {
  const { data, error, isLoading } = useSWR<T>(url, fetcher);
  return { data, isLoading, isError: error };
};
