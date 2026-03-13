import { Button } from '@/components/ui/button'
import { useMembership } from '@/hooks/useMembership'
import api from '@/lib/axios'
import React from 'react'

interface ApprovePhasePaymentButtonProps {
    id: string;
}


const ApprovePhasePaymentButton = ({id}: ApprovePhasePaymentButtonProps) => {
    const {data: membership, isLoading: membershipLoading} = useMembership();
    if(membershipLoading) return (
        <div>
            Loading...
        </div>
    )
    if(!membership) return (
        <div>
            No access
        </div>
    )
    const handleApprove = async (id: string) => {
        await api.put("/project/phase/payment_approval",
            {
                id: id,
            },
            {
                headers: {
                    "x-organization-id": membership?.id
                }
            }
        )
        
    }
  return (
    <Button
        onClick={() => handleApprove(id)}
    >
        Approve
    </Button>
  )
}

export default ApprovePhasePaymentButton