import { ValidationError } from "../../../shared/error/validation.error.js";
import { prisma } from "../../../shared/lib/prisma.js";
import { resend } from "../../../shared/lib/resend.js";
import { User } from "../../../shared/models/user.js";

const invoiceService = {
    async generateInvoice(projectId: string, phaseId: string) {
        // Verify phase belongs to project
        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId },
        });

        if (!phase) {
            throw new ValidationError("Phase not found.");
        }

        // Find all un-invoiced site logs for this phase
        const siteLogs = await prisma.siteLog.findMany({
            where: { phaseId, invoiceId: null },
            include: {
                materialsUsed: {
                    include: { inventoryItem: true },
                },
            },
        });

        if (siteLogs.length === 0) {
            throw new ValidationError(
                "No uninvoiced site logs found for this phase.",
            );
        }

        // Calculate total cost from consumed materials
        let totalAmount = 0;
        for (const log of siteLogs) {
            for (const tx of log.materialsUsed) {
                const qty = Math.abs(Number(tx.quantityChange));
                const unitCost = Number(tx.inventoryItem.averageUnitCost);
                totalAmount += qty * unitCost;
            }
        }

        const invoice = await prisma.$transaction(async (tx) => {
            const newInvoice = await tx.invoice.create({
                data: {
                    phaseId,
                    amount: totalAmount,
                    status: "PENDING",
                },
            });

            // Link all site logs to this invoice
            await tx.siteLog.updateMany({
                where: { id: { in: siteLogs.map((l) => l.id) } },
                data: { invoiceId: newInvoice.id },
            });

            return newInvoice;
        });

        return invoice;
    },

    async getInvoices(projectId: string, phaseId: string) {
        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId },
        });

        if (!phase) {
            throw new ValidationError("Phase not found.");
        }

        const invoices = await prisma.invoice.findMany({
            where: { phaseId },
            include: { billedLogs: true },
            orderBy: { createdAt: "desc" },
        });

        return invoices;
    },

    async payInvoice(projectId: string, invoiceId: string) {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { phase: true },
        });

        if (invoice?.phase.projectId !== projectId) {
            throw new ValidationError("Invoice not found.");
        }

        if (invoice.status === "PAID") {
            throw new ValidationError("Invoice has already been paid.");
        }

        const updated = await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status: "PAID",
                paidAt: new Date(),
            },
        });

        return updated;
    },

    async sendInvoiceEmail(projectId: string, invoiceId: string, pdfUrl: string) {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { phase: { include: { project: true } } },
        });

        if (invoice?.phase.projectId !== projectId) {
            throw new ValidationError("Invoice not found.");
        }

        await prisma.invoice.update({
            where: { id: invoiceId },
            data: { pdfUrl },
        });

        const assignment = await prisma.assignment.findFirst({
            where: { projectId, role: "CLIENT" },
        });

        if (!assignment) {
            throw new ValidationError("No client is assigned to this project.");
        }

        const client = await User.findById(assignment.userId).lean();
        if (!client?.email) {
            throw new ValidationError("Could not retrieve client email.");
        }

        const projectName = invoice.phase.project.name;
        const phaseName = invoice.phase.name;
        const amount = Number(invoice.amount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
        });

        await resend.emails.send({
            from: "invoices@sitecore.app",
            to: client.email,
            subject: `Invoice Ready – ${projectName} / ${phaseName}`,
            html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1c1917">
                    <h2 style="font-size:20px;font-weight:600;margin-bottom:8px">
                        New Invoice: $${amount}
                    </h2>
                    <p style="color:#57534e;margin-bottom:16px">
                        A new invoice has been generated for <strong>${phaseName}</strong>
                        on project <strong>${projectName}</strong>.
                    </p>
                    <a href="${pdfUrl}"
                       style="display:inline-block;background:#15803d;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">
                        View / Download Invoice
                    </a>
                    <p style="margin-top:24px;font-size:12px;color:#a8a29e">
                        If you have any questions, please contact your project administrator.
                    </p>
                </div>
            `,
        });
    },
};

export default invoiceService;
