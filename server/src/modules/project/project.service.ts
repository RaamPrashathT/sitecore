import { prisma } from "../../shared/lib/prisma.js";
import { slugify } from "../../shared/utils/slugify.js";

const projectService = {
    async createProject({
        organizationId,
        projectName,
    }: {
        readonly organizationId: string;
        readonly projectName: string;
    }) {
        const slugBase = slugify(projectName);
        const lastProject = await prisma.project.findFirst({
            where: {
                slugBase: slugBase,
            },
            orderBy: {
                slugIndex: "desc",
            },
        });

        const nextIndex = lastProject ? lastProject.slugIndex + 1 : 1;
        const slug = nextIndex === 1 ? slugBase : `${slugBase}-${nextIndex}`;

        const result = await prisma.project.create({
            data: {
                name: projectName,
                slug,
                slugBase,
                slugIndex: nextIndex,
                organizationId: organizationId,
            }
        })

        return {
            id: result.id,
            name: result.name,
            slug: result.slug,
        }
    },

    async getProjects(organizationId: string) {
        const result = await prisma.project.findMany({
            where: {
                organizationId: organizationId,
            },
            orderBy: {
                slug: "desc",
            },
        });

        return result.map((project) => ({
            id: project.id,
            name: project.name,
            slug: project.slug,
        }))
    }
};

export default projectService;
