import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Enums as string constants
export const Role = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  MEMBER: 'MEMBER',
  RESPONDENT: 'RESPONDENT',
} as const;

export const FormStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
} as const;

export const QuestionType = {
  SHORT_TEXT: 'SHORT_TEXT',
  LONG_TEXT: 'LONG_TEXT',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  SINGLE_CHOICE: 'SINGLE_CHOICE',
  RATING: 'RATING',
  STAR_RATING: 'STAR_RATING',
  YES_NO: 'YES_NO',
  DROPDOWN: 'DROPDOWN',
  NUMBER: 'NUMBER',
  DATE: 'DATE',
} as const;

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing data
  await prisma.feedbackAnswer.deleteMany();
  await prisma.feedbackResponse.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.formQuestion.deleteMany();
  await prisma.formShare.deleteMany();
  await prisma.feedbackForm.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@feedback.com',
      passwordHash,
      firstName: 'Alex',
      lastName: 'Morgan',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@feedback.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const memberUser = await prisma.user.create({
    data: {
      email: 'member@feedback.com',
      passwordHash,
      firstName: 'David',
      lastName: 'Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const respondentUser = await prisma.user.create({
    data: {
      email: 'respondent@feedback.com',
      passwordHash,
      firstName: 'Emily',
      lastName: 'Watson',
    },
  });

  console.log('✅ Users created: admin@feedback.com, manager@feedback.com, member@feedback.com');

  // 3. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Tech Solutions',
      slug: 'acme-tech',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
    },
  });

  // 4. Assign Organization Memberships
  await prisma.organizationMember.createMany({
    data: [
      { organizationId: org.id, userId: adminUser.id, role: Role.ADMIN },
      { organizationId: org.id, userId: managerUser.id, role: Role.MANAGER },
      { organizationId: org.id, userId: memberUser.id, role: Role.MEMBER },
    ],
  });

  console.log('✅ Organization & RBAC Memberships seeded.');

  // 5. Create Demo Feedback Forms
  const publishedForm = await prisma.feedbackForm.create({
    data: {
      organizationId: org.id,
      creatorId: adminUser.id,
      title: 'Customer Product Satisfaction Survey 2026',
      description: 'Help us improve our SaaS platform by providing your feedback on our features, UI experience, and customer support.',
      status: FormStatus.PUBLISHED,
      publicId: 'csat-survey-2026',
      allowAnonymous: true,
      requireAuth: false,
      onePerUser: false,
    },
  });

  await prisma.feedbackForm.create({
    data: {
      organizationId: org.id,
      creatorId: managerUser.id,
      title: 'Employee Quarterly Check-in',
      description: 'Internal feedback regarding team collaboration, work-life balance, and career growth.',
      status: FormStatus.DRAFT,
      publicId: 'employee-q3-checkin',
      allowAnonymous: false,
      requireAuth: true,
      onePerUser: true,
    },
  });

  console.log('✅ Feedback Forms created.');

  // 6. Create Questions for Published Form
  const q1 = await prisma.formQuestion.create({
    data: {
      formId: publishedForm.id,
      type: QuestionType.STAR_RATING,
      title: 'Overall Satisfaction Rate',
      description: 'How satisfied are you with our overall SaaS platform experience?',
      isRequired: true,
      orderIndex: 0,
    },
  });

  const q2 = await prisma.formQuestion.create({
    data: {
      formId: publishedForm.id,
      type: QuestionType.SINGLE_CHOICE,
      title: 'Primary Use Case',
      description: 'What is your main goal when using our platform?',
      isRequired: true,
      orderIndex: 1,
      options: {
        create: [
          { label: 'Customer Feedback & Analytics', value: 'feedback', orderIndex: 0 },
          { label: 'Employee Performance Reviews', value: 'hr', orderIndex: 1 },
          { label: 'Product Feature Testing', value: 'product', orderIndex: 2 },
          { label: 'Market Research', value: 'research', orderIndex: 3 },
        ],
      },
    },
  });

  const q3 = await prisma.formQuestion.create({
    data: {
      formId: publishedForm.id,
      type: QuestionType.RATING,
      title: 'Ease of Use (1 to 10)',
      description: 'On a scale of 1 to 10, how intuitive is our user interface?',
      isRequired: true,
      orderIndex: 2,
    },
  });

  const q4 = await prisma.formQuestion.create({
    data: {
      formId: publishedForm.id,
      type: QuestionType.YES_NO,
      title: 'Would you recommend us to a colleague?',
      isRequired: true,
      orderIndex: 3,
    },
  });

  const q5 = await prisma.formQuestion.create({
    data: {
      formId: publishedForm.id,
      type: QuestionType.LONG_TEXT,
      title: 'What feature would you like us to build next?',
      description: 'Provide any detailed suggestions or feature requests.',
      isRequired: false,
      orderIndex: 4,
    },
  });

  console.log('✅ Form Questions created.');

  // 7. Seed Sample Responses & Answers
  const sampleResponsesData = [
    {
      starRating: '5',
      useCase: 'Customer Feedback & Analytics',
      easeRating: '9',
      recommend: 'Yes',
      feedback: 'The real-time analytics dashboard and instant CSV export features are outstanding! Highly recommended.',
      respondentId: respondentUser.id,
      isAnon: false,
    },
    {
      starRating: '4',
      useCase: 'Product Feature Testing',
      easeRating: '8',
      recommend: 'Yes',
      feedback: 'Great UI/UX layout. Would love to see automated email notification triggers when responses come in.',
      respondentId: null,
      isAnon: true,
    },
    {
      starRating: '5',
      useCase: 'Customer Feedback & Analytics',
      easeRating: '10',
      recommend: 'Yes',
      feedback: 'Extremely clean and fast interface. The drag-and-drop form builder works seamlessly.',
      respondentId: null,
      isAnon: true,
    },
    {
      starRating: '3',
      useCase: 'Market Research',
      easeRating: '7',
      recommend: 'Yes',
      feedback: 'Works well for basic forms. Adding Webhook integration options in future would be awesome.',
      respondentId: null,
      isAnon: true,
    },
    {
      starRating: '4',
      useCase: 'Employee Performance Reviews',
      easeRating: '9',
      recommend: 'Yes',
      feedback: 'Solid RBAC permission controls. Security and team separation are top tier.',
      respondentId: null,
      isAnon: true,
    },
  ];

  for (const resp of sampleResponsesData) {
    const createdResp = await prisma.feedbackResponse.create({
      data: {
        formId: publishedForm.id,
        respondentId: resp.respondentId,
        isAnonymous: resp.isAnon,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    await prisma.feedbackAnswer.createMany({
      data: [
        { responseId: createdResp.id, questionId: q1.id, value: resp.starRating },
        { responseId: createdResp.id, questionId: q2.id, value: resp.useCase },
        { responseId: createdResp.id, questionId: q3.id, value: resp.easeRating },
        { responseId: createdResp.id, questionId: q4.id, value: resp.recommend },
        { responseId: createdResp.id, questionId: q5.id, value: resp.feedback },
      ],
    });
  }

  // 8. Create Audit Logs & Notifications
  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      userId: adminUser.id,
      action: 'FORM_PUBLISHED',
      entity: 'FeedbackForm',
      entityId: publishedForm.id,
      metadata: JSON.stringify({ title: publishedForm.title, publicId: publishedForm.publicId }),
      ipAddress: '127.0.0.1',
    },
  });

  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: 'New Feedback Response',
      message: 'You received a new 5-star rating response on Customer Product Satisfaction Survey 2026.',
      type: 'SUCCESS',
    },
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
