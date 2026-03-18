import { prisma } from "../../shared/lib/prisma.js";
import type { SetDashboardItemsType } from "./dashboard.schema.js";

const dashboardService = {
    async getDashboardItems(organizationId: string) {
        const result = await prisma.requisitionItem.findMany({
            where: {
                status: "UNORDERED",
                requisition: {
                    status: "APPROVED",
                    phase: {
                        project: {
                            organizationId,
                        },
                    },
                },
            },
            select: {
                id: true,
                quantity: true,
                estimatedUnitCost: true,
                catalogue: {
                    select: {
                        name: true,
                        unit: true,
                    }
                },
                assignedSupplier: {
                    select: {
                        supplier: true,
                        leadTime: true,
                        truePrice: true,
                        standardRate: true,
                    }
                },
                requisition: {
                    select: {
                        phase: {
                            select: {
                                name: true,
                                startDate: true,
                                project: {
                                    select: {
                                        id: true,
                                        name: true,
                                    }
                                }
                            }
                        }
                    }
                }
            },  
        })
        return result.map(item => ({
            id: item.id,
            quantity: Number(item.quantity),
            estimatedUnitCost: Number(item.estimatedUnitCost),
            
            itemName: item.catalogue.name,
            unit: item.catalogue.unit,
            
            supplierName: item.assignedSupplier?.supplier,
            leadTime: item.assignedSupplier?.leadTime ?? 0,
            truePrice: item.assignedSupplier ? Number(item.assignedSupplier.truePrice) : undefined,
            standardRate: item.assignedSupplier ? Number(item.assignedSupplier.standardRate) : undefined,
            
            projectid: item.requisition.phase.project.id,
            projectName: item.requisition.phase.project.name,
            phaseName: item.requisition.phase.name,
            phaseStartDate: item.requisition.phase.startDate,
        }));
    },
    async setDashboardItems({
        requisitionItemIds,
        organizationId
    }: SetDashboardItemsType) {
        
        const result = await prisma.requisitionItem.updateMany({
            where: {
                id: {
                    in: requisitionItemIds 
                },
                requisition: {
                    status: "APPROVED",
                    phase: {
                        project: {
                            organizationId
                        }
                    }
                }
            },
            data: {
                status: "ORDERED"
            }
        });
    
        return result;
    }
}

export default dashboardService;