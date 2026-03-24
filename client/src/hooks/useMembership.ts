import { useParams } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/useSession";

export interface MembershipType {
    id: string;
    slug: string;
    role: "ADMIN" | "ENGINEER" | "CLIENT" | "IDLE";
}

export const useMembership = () => {
    const { orgSlug } = useParams();
    const { user, isLoading: isSessionLoading } = useSession();

    const tenantConfig = orgSlug && user?.tenant ? user.tenant[orgSlug] : null;

    const membership: MembershipType | null = tenantConfig ? {
        id: tenantConfig.id,
        role: tenantConfig.role,
        slug: orgSlug as string
    } : null;

    return {
        data: membership,
        isLoading: isSessionLoading, 
    };
};