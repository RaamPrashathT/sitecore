import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

// --- Interfaces mapping to the new Backend Response ---

export interface PendingPayment {
    id: string;
    phaseName: string;
    projectName: string;
    budget: number;
    paymentDeadline: string | Date;
    slug: string;
}

export interface ProcessedPendingPayment extends PendingPayment {
    daysTillDue: number;
    status: "OVERDUE" | "URGENT" | "DUE" | "UPCOMING";
}

export interface ProjectSummary {
    id: string;
    name: string;
    slug: string;
    status: string;
    estimatedBudget: number;
    totalOrderedCost: number;
    completionPercentage: number;
    activePhase: {
        id: string;
        name: string;
    } | null;
    latestLog: {
        id: string;
        title: string;
        createdAt: string;
    } | null;
}

export interface ClientDashboardResponse {
    pendingPayments: PendingPayment[];
    projects: ProjectSummary[];
}

export interface ProcessedClientDashboardResponse {
    pendingPayments: ProcessedPendingPayment[];
    projects: ProjectSummary[];
}

// --- Fetcher ---

const getClientDashboardItems = async () => {
    // Note: No headers attached here! Your Axios interceptor injects the tenant slug.
    const response = await api.get<ClientDashboardResponse>(`/dashboard/client`);
    return response.data;
};

// --- Hook ---

export const useGetClientDashboardItems = () => {
    return useQuery({
        // Since interceptors handle the tenant, we just need a simple key
        queryKey: ["clientDashboardItems"],
        queryFn: getClientDashboardItems,
        select: (data): ProcessedClientDashboardResponse => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Process the payments to add urgency and days left
            const processedPayments = data.pendingPayments.map((payment) => {
                const dropDeadDate = new Date(payment.paymentDeadline);
                dropDeadDate.setHours(0, 0, 0, 0);
                
                const diffTime = dropDeadDate.getTime() - today.getTime();
                const diffDate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let status: "OVERDUE" | "URGENT" | "DUE" | "UPCOMING";

                if (diffDate < 0) {
                    status = "OVERDUE";
                } else if (diffDate <= 3) {
                    status = "URGENT";
                } else if (diffDate <= 7) {
                    status = "DUE";
                } else {
                    status = "UPCOMING";
                }

                return {
                    ...payment,
                    daysTillDue: diffDate,
                    status,
                };
            });

            return {
                pendingPayments: processedPayments,
                projects: data.projects,
            };
        },
    });
};