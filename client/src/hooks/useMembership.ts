import { useParams } from "react-router-dom";
import { useSession } from "@/features/auth/hooks/useSession";

export interface MembershipType {
    id: string;
    slug: string;
    profile: string | null;
    role: "ADMIN" | "ENGINEER" | "CLIENT" | "IDLE";
}

const resolveMembershipRole = (role: string): MembershipType["role"] => {
    if (role === "ADMIN" || role === "ENGINEER" || role === "CLIENT") {
        return role;
    }

    return "IDLE";
};

export const useMembership = () => {
    const { orgSlug } = useParams();
    const { user, isLoading: isSessionLoading } = useSession();

    const tenantConfig = orgSlug && user?.tenant ? user.tenant[orgSlug] : null;

    const membership: MembershipType | null = tenantConfig ? {
        id: tenantConfig.id,
        role: resolveMembershipRole(tenantConfig.role),
        slug: orgSlug as string,
        profile: null,
    } : null;

    return {
        data: membership,
        isLoading: isSessionLoading, 
    };
};
