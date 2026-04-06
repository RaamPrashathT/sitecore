import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

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
    recentLogs: {
        id: string;
        title: string;
        createdAt: string;
        phaseName: string;
        phaseSlug: string;
        projectSlug: string;
    }[];
}

export interface ClientDashboardResponse {
    pendingPayments: PendingPayment[];
    projects: ProjectSummary[];
}

export interface ProcessedClientDashboardResponse {
    pendingPayments: ProcessedPendingPayment[];
    projects: ProjectSummary[];
}

const getClientDashboardItems = async () => {
    const response =
        await api.get<ClientDashboardResponse>(`/dashboard/client`);
    return response.data;
};

export const useGetClientDashboardItems = () => {
    return useQuery({
        queryKey: ["clientDashboardItems"],
        queryFn: getClientDashboardItems,
        select: (data): ProcessedClientDashboardResponse => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

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
