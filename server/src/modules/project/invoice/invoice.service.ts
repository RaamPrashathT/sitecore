import { ValidationError } from "../../../shared/error/validation.error.js";
import { prisma } from "../../../shared/lib/prisma.js";
import { resend } from "../../../shared/lib/resend.js";
import { User } from "../../../shared/models/user.js";

const invoiceService = {
    async generateInvoice(projectId: string, phaseId: string) {
        const phase = await prisma.phase.findUnique({
            where: { id: phaseId, projectId },
        });

        if (!phase) throw new ValidationError("Phase not found.");

        const siteLogs = await prisma.siteLog.findMany({
            where: { phaseId, invoiceId: null },
            include: {
                materialsUsed: {
                    include: { inventoryItem: true },
                },
            },
        });

        if (siteLogs.length === 0) {
            throw new ValidationError("No uninvoiced site logs found for this phase.");
        }

        let totalAmount = 0;
        for (const log of siteLogs) {
            for (const tx of log.materialsUsed) {
                totalAmount += Math.abs(Number(tx.quantityChange)) * Number(tx.inventoryItem.averageUnitCost);
            }
        }

        const invoice = await prisma.$transaction(async (tx) => {
            const newInvoice = await tx.invoice.create({
                data: { phaseId, amount: totalAmount, status: "PENDING" },
            });
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
        if (!phase) throw new ValidationError("Phase not found.");

        return prisma.invoice.findMany({
            where: { phaseId },
            include: {
                billedLogs: {
                    include: {
                        materialsUsed: {
                            include: {
                                inventoryItem: {
                                    include: { catalogue: true },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
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

        return prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: "PAID", paidAt: new Date() },
        });
    },

    async sendInvoiceEmail(projectId: string, invoiceId: string) {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                phase: { include: { project: true } },
                billedLogs: {
                    include: {
                        materialsUsed: {
                            include: {
                                inventoryItem: {
                                    include: { catalogue: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (invoice?.phase.projectId !== projectId) {
            throw new ValidationError("Invoice not found.");
        }

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
        const issuedDate = new Date(invoice.createdAt).toLocaleDateString("en-IN", {
            day: "numeric", month: "long", year: "numeric",
        });
        const fmt = (n: number) =>
            new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

        const logRowsHtml = invoice.billedLogs.map((log) => {
            const logDate = new Date(log.workDate).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
            });
            const materialRows = log.materialsUsed.map((tx) => {
                const qty = Math.abs(Number(tx.quantityChange));
                const unit = tx.inventoryItem.catalogue.unit;
                const unitCost = Number(tx.inventoryItem.averageUnitCost);
                const lineTotal = qty * unitCost;
                return [
                    "<tr style='border-bottom:1px solid #e7e5e4'>",
                    `<td style='padding:8px 12px;color:#57534e;font-size:13px'>${tx.inventoryItem.catalogue.name}</td>`,
                    `<td style='padding:8px 12px;text-align:center;color:#57534e;font-size:13px'>${qty} ${unit}</td>`,
                    `<td style='padding:8px 12px;text-align:right;color:#57534e;font-size:13px'>${fmt(unitCost)}</td>`,
                    `<td style='padding:8px 12px;text-align:right;font-weight:600;color:#1c1917;font-size:13px'>${fmt(lineTotal)}</td>`,
                    "</tr>",
                ].join("");
            }).join("");

            const logTotal = log.materialsUsed.reduce(
                (s, tx) => s + Math.abs(Number(tx.quantityChange)) * Number(tx.inventoryItem.averageUnitCost),
                0,
            );

            const noMaterials = log.materialsUsed.length === 0
                ? "<tr><td colspan='4' style='padding:8px 12px;color:#a8a29e;font-size:12px;font-style:italic'>No materials recorded</td></tr>"
                : "";

            return [
                "<tr style='background:#f5f5f4'>",
                `<td colspan='4' style='padding:10px 12px'>`,
                `<strong style='font-size:13px;color:#1c1917'>${log.title}</strong>`,
                `<span style='font-size:11px;color:#a8a29e;margin-left:8px'>${logDate}</span>`,
                "</td></tr>",
                materialRows || noMaterials,
                "<tr style='background:#fafaf9;border-bottom:2px solid #e7e5e4'>",
                "<td colspan='3' style='padding:8px 12px;text-align:right;font-size:12px;color:#78716c'>Log subtotal</td>",
                `<td style='padding:8px 12px;text-align:right;font-weight:700;color:#15803d;font-size:13px'>${fmt(logTotal)}</td>`,
                "</tr>",
            ].join("");
        }).join("");

        const totalAmount = fmt(Number(invoice.amount));
        const statusColor = invoice.status === "PAID" ? "#15803d" : "#854d0e";
        const statusBg = invoice.status === "PAID" ? "#dcfce7" : "#fef9c3";

        const html = [
            "<!DOCTYPE html><html><body style='margin:0;padding:0;background:#f5f5f4;font-family:sans-serif'>",
            "<div style='max-width:640px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e7e5e4'>",
            // Header
            "<div style='background:#15803d;padding:32px;color:#fff'>",
            "<p style='margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:0.7'>Invoice</p>",
            `<h1 style='margin:0 0 16px;font-size:28px;font-weight:700'>${projectName}</h1>`,
            `<p style='margin:0;font-size:14px;opacity:0.85'>Phase: <strong>${phaseName}</strong></p>`,
            `<p style='margin:4px 0 0;font-size:13px;opacity:0.7'>Issued: ${issuedDate}</p>`,
            "</div>",
            // Summary
            "<div style='padding:24px 32px;border-bottom:1px solid #e7e5e4'>",
            "<table style='width:100%'><tr>",
            "<td><p style='margin:0;font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:1px'>Total Amount Due</p>",
            `<p style='margin:4px 0 0;font-size:32px;font-weight:700;color:#1c1917'>${totalAmount}</p></td>`,
            "<td style='text-align:right'><p style='margin:0;font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:1px'>Status</p>",
            `<span style='display:inline-block;margin-top:4px;padding:4px 12px;background:${statusBg};color:${statusColor};border-radius:99px;font-size:12px;font-weight:700;text-transform:uppercase'>${invoice.status}</span></td>`,
            "</tr></table></div>",
            // Line items
            "<div style='padding:24px 32px'>",
            "<p style='margin:0 0 16px;font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:1px'>Breakdown by Site Log</p>",
            "<table style='width:100%;border-collapse:collapse;border:1px solid #e7e5e4;border-radius:6px;overflow:hidden'>",
            "<thead><tr style='background:#f5f5f4'>",
            "<th style='padding:10px 12px;text-align:left;font-size:11px;color:#78716c;text-transform:uppercase;letter-spacing:1px'>Material</th>",
            "<th style='padding:10px 12px;text-align:center;font-size:11px;color:#78716c;text-transform:uppercase;letter-spacing:1px'>Qty</th>",
            "<th style='padding:10px 12px;text-align:right;font-size:11px;color:#78716c;text-transform:uppercase;letter-spacing:1px'>Unit Cost</th>",
            "<th style='padding:10px 12px;text-align:right;font-size:11px;color:#78716c;text-transform:uppercase;letter-spacing:1px'>Total</th>",
            "</tr></thead>",
            `<tbody>${logRowsHtml}</tbody>`,
            "<tfoot><tr style='background:#1c1917'>",
            "<td colspan='3' style='padding:14px 12px;text-align:right;color:#d6d3d1;font-size:13px;font-weight:600'>Grand Total</td>",
            `<td style='padding:14px 12px;text-align:right;color:#fff;font-size:16px;font-weight:700'>${totalAmount}</td>`,
            "</tr></tfoot></table></div>",
            // Footer
            "<div style='padding:24px 32px;border-top:1px solid #e7e5e4;background:#fafaf9'>",
            "<p style='margin:0;font-size:12px;color:#a8a29e;text-align:center'>This invoice was generated by Sitecore. For queries, contact your project administrator.</p>",
            "</div></div></body></html>",
        ].join("");

        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: "raamthiruna@gmail.com",
            subject: `Invoice – ${projectName} / ${phaseName} (${totalAmount})`,
            html,
        });
    },
};

export default invoiceService;
