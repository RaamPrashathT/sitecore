import { create } from "zustand"

interface RequisitionCartItem {
    id: string
    quantity: number
    cost: string
    supplier: string
}

export const useRequisitionCart = create<RequisitionCartItem>();