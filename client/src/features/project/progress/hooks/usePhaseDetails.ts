import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface PhaseAuthor {
    name: string;
    profile: string | null;
}

export interface PhaseComment {
    id: string;
    text: string;
    createdAt: string;
    imageId: string | null;
    author: PhaseAuthor;
}

export interface PhaseImage {
    id: string;
    url: string;
}

export interface PhaseSiteLog {
    id: string;
    title: string;
    description: string | null;
    workDate: string;
    author: PhaseAuthor;
    images: PhaseImage[];
    comments: PhaseComment[];
}

export interface PhaseFinancials {
    budget: number;
    spent: number;
    remaining: number;
}

export interface PhaseDetailsResponse {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    paymentDeadline: string;
    sequenceOrder: number;
    status: "PLANNING" | "PAYMENT_PENDING" | "ACTIVE" | "COMPLETED";
    startDate: string;
    financials: PhaseFinancials;
    siteLogs: PhaseSiteLog[];
}

export const usePhaseDetails = (
    orgSlug?: string,
    projectSlug?: string,
    phaseSlug?: string,
) => {
    return useQuery({
        queryKey: ["phaseDetails", orgSlug, projectSlug, phaseSlug],
        queryFn: async () => {
            const { data } = await api.get<PhaseDetailsResponse>(
                `/project/phase/${phaseSlug}/info`,
            );
            return data;
        },
        enabled: !!orgSlug && !!projectSlug && !!phaseSlug,
    });
};
