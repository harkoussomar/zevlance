"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // Import here
import axios from "axios";

interface Props {
    children: ReactNode;
}

export function ReactQueryProvider({ children }: Props) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5,
                        retry: (failureCount, error) => {
                            if (
                                axios.isAxiosError(error) &&
                                [401, 403].includes(error.response?.status ?? 0)
                            ) {
                                return false;
                            }
                            return failureCount < 1;
                        },
                        refetchOnWindowFocus: false,
                    },
                },
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools will only show up in development mode */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
