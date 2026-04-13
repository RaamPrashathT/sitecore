import { ValidationError } from "../../../shared/error/validation.error.js";
import { prisma } from "../../../shared/lib/prisma.js";

const paymentService = {
    async generateDrawRequest(
        projectId: string,
        phaseId: string,
        data: { applicationNumber: number; retainageOverride?: number | undefined }
    ) {
        // 1. Fetch Phase with its Line Items and the Project's default retainage
        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId },
            include: { 
                lineItems: true,
                project: { select: { defaultRetainagePercent: true } }
            }
        });

        if (!phase) throw new ValidationError("Phase not found.");

        // 2. Calculate Gross Value of Work Completed to date
        // Math: Sum of (BilledValue * (PercentageComplete / 100))
        const totalGrossBilled = phase.lineItems.reduce((acc, item) => {
            const itemValue = Number(item.billedValue);
            const completion = Number(item.percentageComplete) / 100;
            return acc + (itemValue * completion);
        }, 0);

        if (totalGrossBilled <= 0) {
            throw new ValidationError("No progress has been logged for this phase yet. Nothing to bill.");
        }

        // 3. Determine Retainage
        const retainagePercent = data.retainageOverride ?? Number(phase.project.defaultRetainagePercent);
        const retainageWithheld = totalGrossBilled * (retainagePercent / 100);

        // 4. Calculate Net Payment Due
        const netPaymentDue = totalGrossBilled - retainageWithheld;

        // 5. Create the Payment Application record
        const paymentApp = await prisma.paymentApplication.create({
            data: {
                phaseId: phase.id,
                applicationNumber: data.applicationNumber,
                status: "SUBMITTED_TO_CLIENT",
                totalGrossBilled,
                retainageWithheld,
                netPaymentDue
            }
        });

        // 6. Update Phase Status to PAYMENT_PENDING if it was in PLANNING
        if (phase.status === "PLANNING") {
            await prisma.phase.update({
                where: { id: phase.id },
                data: { status: "PAYMENT_PENDING" }
            });
        }

        return paymentApp;
    },

    async recordPayment(paymentId: string) {
        const paymentApp = await prisma.paymentApplication.findUnique({
            where: { id: paymentId },
            include: { phase: true }
        });

        if (!paymentApp) throw new ValidationError("Payment application not found.");

        // Mark invoice as paid
        await prisma.paymentApplication.update({
            where: { id: paymentId },
            data: { status: "PAID" }
        });

        // If this is the first payment, move the phase to ACTIVE so work can begin/continue
        if (paymentApp.phase.status === "PAYMENT_PENDING") {
            await prisma.phase.update({
                where: { id: paymentApp.phaseId },
                data: { status: "ACTIVE" }
            });
        }

        return { success: true, status: "PAID" };
    }
};

export default paymentService;