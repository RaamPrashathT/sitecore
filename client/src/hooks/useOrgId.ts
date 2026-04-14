import { useMembership } from "@/hooks/useMembership";

export function useOrgId(): string {
    const { data: membership } = useMembership();
    return membership?.id ?? "";
}
