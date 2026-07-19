/**
 * Test fixtures and mock data
 */

export const mockUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User',
    role: 'USER'
  },
  adminUser: {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    name: 'Admin User',
    role: 'ADMIN'
  },
  mentorUser: {
    email: 'mentor@example.com',
    password: 'MentorPassword123!',
    name: 'Mentor User',
    role: 'MENTOR'
  }
};

export const mockCompanies = {
  validCompany: {
    name: 'Tech Company',
    description: 'A tech company',
    industry: 'Technology',
    size: 'MEDIUM',
    location: 'San Francisco'
  },
  anotherCompany: {
    name: 'Design Studio',
    description: 'A design studio',
    industry: 'Design',
    size: 'SMALL',
    location: 'New York'
  }
};

export const mockSessions = {
  validSession: {
    title: 'Career Mentoring',
    description: 'Discuss career growth',
    duration: 60,
    status: 'SCHEDULED'
  },
  videoSession: {
    title: 'Live Video Session',
    description: 'Live mentoring session',
    duration: 90,
    sessionType: 'VIDEO',
    status: 'SCHEDULED'
  }
};

export const mockAuthTokens = {
  validAccessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  expiredToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  invalidToken: 'invalid.token.here'
};

export const mockErrors = {
  unauthorized: {
    statusCode: 401,
    message: 'Unauthorized access'
  },
  forbidden: {
    statusCode: 403,
    message: 'Access forbidden'
  },
  notFound: {
    statusCode: 404,
    message: 'Resource not found'
  },
  badRequest: {
    statusCode: 400,
    message: 'Bad request'
  }
};

export const mockPaginationParams = {
  firstPage: { page: 1, limit: 10 },
  secondPage: { page: 2, limit: 10 },
  largePage: { page: 1, limit: 50 }
};
