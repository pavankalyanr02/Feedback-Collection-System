import * as bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { AppError } from '../utils/AppError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw AppError.conflict('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    // Create default workspace/organization for user if specified or auto-generate
    const orgName = data.organizationName || `${data.firstName}'s Workspace`;
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);

    const org = await prisma.organization.create({
      data: {
        name: orgName,
        slug,
        members: {
          create: {
            userId: user.id,
            role: 'ADMIN',
          },
        },
      },
    });

    const payload = {
      userId: user.id,
      email: user.email,
      organizationId: org.id,
      role: 'ADMIN',
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
      organization: org,
      accessToken,
      refreshToken,
    };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const primaryMembership = user.memberships[0];
    const organizationId = primaryMembership?.organizationId;
    const role = primaryMembership?.role || 'MEMBER';

    const payload = {
      userId: user.id,
      email: user.email,
      organizationId,
      role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
      organizations: user.memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        role: m.role,
      })),
      currentOrganizationId: organizationId,
      currentRole: role,
      accessToken,
      refreshToken,
    };
  }

  static async refresh(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { memberships: true },
      });

      if (!user) {
        throw AppError.unauthorized('User not found');
      }

      const primaryMembership = user.memberships.find(
        (m) => m.organizationId === decoded.organizationId
      ) || user.memberships[0];

      const payload = {
        userId: user.id,
        email: user.email,
        organizationId: primaryMembership?.organizationId,
        role: primaryMembership?.role || 'MEMBER',
      };

      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        createdAt: true,
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    return user;
  }
}
