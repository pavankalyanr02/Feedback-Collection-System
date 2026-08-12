import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';

export class OrgService {
  static async getUserOrganizations(userId: string) {
    const memberships = await prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                members: true,
                forms: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      logoUrl: m.organization.logoUrl,
      role: m.role,
      memberCount: m.organization._count.members,
      formCount: m.organization._count.forms,
      createdAt: m.organization.createdAt,
    }));
  }

  static async createOrganization(userId: string, name: string, slug?: string, logoUrl?: string) {
    const finalSlug =
      slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);

    const existing = await prisma.organization.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      throw AppError.conflict('Organization slug is already in use');
    }

    const org = await prisma.organization.create({
      data: {
        name,
        slug: finalSlug,
        logoUrl,
        members: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
      },
    });

    return org;
  }

  static async getMembers(orgId: string) {
    const members = await prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      email: m.user.email,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      avatarUrl: m.user.avatarUrl,
      role: m.role,
      joinedAt: m.createdAt,
    }));
  }

  static async addMemberByEmail(orgId: string, email: string, role = 'MEMBER') {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      throw AppError.notFound('User with specified email not found');
    }

    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      throw AppError.conflict('User is already a member of this organization');
    }

    const newMember = await prisma.organizationMember.create({
      data: {
        organizationId: orgId,
        userId: user.id,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return newMember;
  }
}
