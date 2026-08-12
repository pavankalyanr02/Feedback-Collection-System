import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { execSync } from 'child_process';

describe('Feedback Collection System - API Integration Tests', () => {
  let authToken: string;
  let testPublicId: string;
  let testFormId: string;

  beforeAll(async () => {
    try {
      const admin = await prisma.user.findUnique({
        where: { email: 'admin@feedback.com' },
      });
      if (!admin) {
        execSync('npx prisma db push --accept-data-loss', { cwd: __dirname + '/..' });
        execSync('npx prisma db seed', { cwd: __dirname + '/..' });
      }
    } catch {
      execSync('npx prisma db push --accept-data-loss', { cwd: __dirname + '/..' });
      execSync('npx prisma db seed', { cwd: __dirname + '/..' });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /health', () => {
    it('should return 200 OK and healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should authenticate demo admin user and return JWT tokens', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@feedback.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('admin@feedback.com');

      authToken = res.body.data.accessToken;
    });

    it('should reject invalid credentials with 401', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@feedback.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/forms', () => {
    it('should return paginated forms list for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/forms')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();

      const publishedForm = res.body.data.find((f: any) => f.status === 'PUBLISHED');
      if (publishedForm) {
        testFormId = publishedForm.id;
        testPublicId = publishedForm.publicId;
      }
    });
  });

  describe('GET /api/v1/public/forms/:publicId', () => {
    it('should return public form structure without authentication', async () => {
      if (!testPublicId) return;

      const res = await request(app).get(`/api/v1/public/forms/${testPublicId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.publicId).toBe(testPublicId);
      expect(Array.isArray(res.body.data.questions)).toBe(true);
    });
  });

  describe('POST /api/v1/public/forms/:publicId/responses', () => {
    it('should accept valid feedback submission', async () => {
      if (!testPublicId) return;

      const publicFormRes = await request(app).get(`/api/v1/public/forms/${testPublicId}`);
      expect(publicFormRes.status).toBe(200);
      const questions = publicFormRes.body.data.questions;
      if (!questions || questions.length === 0) return;

      const answers = questions.map((q: any) => ({
        questionId: q.id,
        value: q.type === 'STAR_RATING' ? '5' : q.type === 'YES_NO' ? 'Yes' : 'Awesome product!',
      }));

      const res = await request(app)
        .post(`/api/v1/public/forms/${testPublicId}/responses`)
        .send({
          isAnonymous: true,
          answers,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
    });
  });

  describe('GET /api/v1/analytics/dashboard', () => {
    it('should return dashboard metrics overview', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalForms).toBeGreaterThan(0);
      expect(res.body.data.summary.totalResponses).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data.ratingDistribution)).toBe(true);
    });
  });
});
