import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(method, url, data) {
  const token = localStorage.getItem('authToken');
  const headers = {};

  if (data) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log('=== CLIENT AUTH DEBUG ===');
    console.log('Token from localStorage:', token ? 'Present' : 'Missing');
    console.log('Token length:', token?.length || 0);
    console.log('Token first 20 chars:', token?.substring(0, 20) + '...');
    console.log('Request URL:', url);
    console.log('Request method:', method);
    console.log('Headers being sent:', Object.keys(headers));
  } else {
    console.log('=== CLIENT AUTH DEBUG ===');
    console.log('ERROR: No token found in localStorage');
    console.log('Request URL:', url);
    console.log('Request method:', method);
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  console.log('Response status:', res.status);
  console.log('Response status text:', res.statusText);

  await throwIfResNotOk(res);
  return res;
}

export function getQueryFn(options) {
  return async ({ queryKey }) => {
    let url = queryKey[0];
    if (queryKey.length > 1) {
      const params = queryKey[1];
      if (typeof params === 'string' && params.length > 0) {
        url += `?${params}`;
      }
    }

    const token = localStorage.getItem('authToken');
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      credentials: "include",
      headers,
    });

    if (options.on401 === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
