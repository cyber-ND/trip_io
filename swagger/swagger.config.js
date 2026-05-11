module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Trip.io API',
    version: '1.0.0',
    description:
      'Ride-sharing REST API. Riders book rides, drivers accept and complete them. All protected routes require a Bearer JWT access token.',
    contact: { name: 'cyber-ND' },
  },
  servers: [{ url: `http://localhost:${process.env.PORT || 3000}/api`, description: 'Local development' }],
  tags: [
    { name: 'Auth', description: 'Register, login, tokens, password reset, email verification' },
    { name: 'Users', description: 'Rider / admin profile management' },
    { name: 'Drivers', description: 'Driver profile, availability, and location' },
    { name: 'Rides', description: 'Ride booking and lifecycle management' },
    { name: 'Payments', description: 'Payment initiation and history' },
    { name: 'Ratings', description: 'Post-ride driver ratings' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token from /auth/login or /auth/register',
      },
    },
    schemas: {
      Location: {
        type: 'object',
        required: ['address', 'coordinates'],
        properties: {
          address: { type: 'string', example: 'Victoria Island, Lagos' },
          coordinates: {
            type: 'array',
            items: { type: 'number' },
            minItems: 2,
            maxItems: 2,
            description: '[longitude, latitude]',
            example: [3.4, 6.5],
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '664abc123def456789012345' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          role: { type: 'string', enum: ['rider', 'driver', 'admin'], example: 'rider' },
          phoneNumber: { type: 'string', example: '+2348012345678' },
          authProvider: { type: 'string', enum: ['local', 'google'], example: 'local' },
          isActive: { type: 'boolean', example: true },
          isEmailVerified: { type: 'boolean', example: false },
          profilePhoto: { type: 'string', example: '' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthTokens: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        },
      },
      Driver: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { $ref: '#/components/schemas/User' },
          vehicle: {
            type: 'object',
            properties: {
              make: { type: 'string', example: 'Toyota' },
              model: { type: 'string', example: 'Camry' },
              year: { type: 'integer', example: 2020 },
              plateNumber: { type: 'string', example: 'LAG-123-AA' },
              colour: { type: 'string', example: 'White' },
            },
          },
          licenseNumber: { type: 'string', example: 'DRV-2024-001' },
          isAvailable: { type: 'boolean', example: true },
          isApproved: { type: 'boolean', example: false },
          rating: { type: 'number', example: 4.5 },
          totalRatings: { type: 'integer', example: 12 },
          totalRides: { type: 'integer', example: 20 },
          currentLocation: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'Point' },
              coordinates: {
                type: 'array',
                items: { type: 'number' },
                example: [3.4, 6.5],
              },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Ride: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          riderId: { $ref: '#/components/schemas/User' },
          driverId: { $ref: '#/components/schemas/User' },
          status: {
            type: 'string',
            enum: ['pending', 'accepted', 'ongoing', 'completed', 'cancelled', 'rejected'],
            example: 'pending',
          },
          pickup: { $ref: '#/components/schemas/Location' },
          dropoff: { $ref: '#/components/schemas/Location' },
          fare: {
            type: 'object',
            properties: {
              estimated: { type: 'number', example: 1500 },
              final: { type: 'number', example: 1500 },
            },
          },
          distance: { type: 'number', example: 5.2, description: 'Distance in km' },
          cancelReason: { type: 'string', example: 'Changed my mind' },
          startedAt: { type: 'string', format: 'date-time' },
          completedAt: { type: 'string', format: 'date-time' },
          cancelledAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          rideId: { type: 'string' },
          riderId: { $ref: '#/components/schemas/User' },
          driverId: { $ref: '#/components/schemas/User' },
          amount: { type: 'number', example: 1500 },
          method: { type: 'string', enum: ['card', 'wallet', 'cash'], example: 'cash' },
          status: {
            type: 'string',
            enum: ['pending', 'completed', 'failed', 'refunded'],
            example: 'pending',
          },
          paidAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Rating: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          rideId: { type: 'string' },
          riderId: { $ref: '#/components/schemas/User' },
          driverId: { $ref: '#/components/schemas/User' },
          stars: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
          comment: { type: 'string', example: 'Smooth ride, very professional' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 50 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          pages: { type: 'integer', example: 5 },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message' },
          errors: { type: 'array', items: { type: 'object' }, example: [] },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Missing or invalid access token',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { success: false, message: 'Unauthorized', errors: [] },
          },
        },
      },
      Forbidden: {
        description: 'Insufficient role permissions',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { success: false, message: 'Forbidden', errors: [] },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/Error' } },
        },
      },
    },
  },
  paths: {
    // ─── AUTH ────────────────────────────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Creates a rider or driver account. A verification email is sent automatically. Admin accounts cannot be self-registered.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', minLength: 8, example: 'Test@12345' },
                  role: { type: 'string', enum: ['rider', 'driver'], default: 'rider' },
                  phoneNumber: { type: 'string', example: '+2348012345678' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Registration successful' },
                    data: { $ref: '#/components/schemas/AuthTokens' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Email already in use',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', example: 'Test@12345' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Login successful' },
                    data: { $ref: '#/components/schemas/AuthTokens' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/auth/google': {
      post: {
        tags: ['Auth'],
        summary: 'Login or register with Google',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['idToken'],
                properties: {
                  idToken: { type: 'string', description: 'Google OAuth ID token', example: 'google-id-token' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Google login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/AuthTokens' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Invalid Google token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Get a new access token using a refresh token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'New access token issued',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: { accessToken: { type: 'string' } },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Invalid or expired refresh token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout — invalidates the refresh token',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: { refreshToken: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Logged out successfully' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request a password reset email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Reset email sent (token expires in 1 hour)' },
          400: {
            description: 'Account uses Google login',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          404: {
            description: 'No account with that email',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/auth/reset-password/{token}': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password using the token from the email link',
        parameters: [
          {
            name: 'token',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Reset token from the email link',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: {
                  password: { type: 'string', minLength: 8, example: 'NewPass@12345' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password reset successful' },
          400: {
            description: 'Invalid or expired token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/auth/verify-email/{token}': {
      post: {
        tags: ['Auth'],
        summary: 'Verify email address using the token from the verification email',
        parameters: [
          {
            name: 'token',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Email verified successfully' },
          400: {
            description: 'Invalid or expired token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/auth/resend-verification': {
      post: {
        tags: ['Auth'],
        summary: 'Resend the email verification link',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Verification email sent' },
          400: {
            description: 'Email already verified',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          404: {
            description: 'No account with that email',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    // ─── USERS ───────────────────────────────────────────────────────────────
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: "Get the authenticated user's profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: "Update the authenticated user's profile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Jane Doe' },
                  phoneNumber: { type: 'string', example: '+2348012345678' },
                  profilePhoto: { type: 'string', example: 'https://example.com/photo.jpg' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Profile updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Get all users — admin only',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Paginated user list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        items: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get a user by ID — admin only',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'User details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/users/{id}/deactivate': {
      patch: {
        tags: ['Users'],
        summary: 'Deactivate a user account — admin only',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'User deactivated' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ─── DRIVERS ─────────────────────────────────────────────────────────────
    '/drivers/profile': {
      post: {
        tags: ['Drivers'],
        summary: 'Create a driver profile — driver only',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['vehicle', 'licenseNumber'],
                properties: {
                  vehicle: {
                    type: 'object',
                    required: ['make', 'model', 'year', 'plateNumber', 'colour'],
                    properties: {
                      make: { type: 'string', example: 'Toyota' },
                      model: { type: 'string', example: 'Camry' },
                      year: { type: 'integer', example: 2020 },
                      plateNumber: { type: 'string', example: 'LAG-123-AA' },
                      colour: { type: 'string', example: 'White' },
                    },
                  },
                  licenseNumber: { type: 'string', example: 'DRV-2024-001' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Driver profile created. Pending admin approval.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', properties: { driver: { $ref: '#/components/schemas/Driver' } } },
                  },
                },
              },
            },
          },
          400: {
            description: 'Driver profile already exists',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      get: {
        tags: ['Drivers'],
        summary: "Get the authenticated driver's profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Driver profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', properties: { driver: { $ref: '#/components/schemas/Driver' } } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/drivers/availability': {
      patch: {
        tags: ['Drivers'],
        summary: 'Toggle online/offline availability — driver only',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Availability toggled',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', properties: { driver: { $ref: '#/components/schemas/Driver' } } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/drivers/location': {
      patch: {
        tags: ['Drivers'],
        summary: 'Update current location — driver only',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['coordinates'],
                properties: {
                  coordinates: {
                    type: 'array',
                    items: { type: 'number' },
                    minItems: 2,
                    maxItems: 2,
                    description: '[longitude, latitude]',
                    example: [3.4, 6.5],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Location updated' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/drivers': {
      get: {
        tags: ['Drivers'],
        summary: 'Get all drivers — admin only',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Paginated driver list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        items: { type: 'array', items: { $ref: '#/components/schemas/Driver' } },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/drivers/{id}/approve': {
      patch: {
        tags: ['Drivers'],
        summary: 'Approve a driver — admin only',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Driver document _id',
          },
        ],
        responses: {
          200: { description: 'Driver approved' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ─── RIDES ───────────────────────────────────────────────────────────────
    '/rides': {
      post: {
        tags: ['Rides'],
        summary: 'Book a ride — rider only',
        description: 'Creates a ride and attempts automatic driver assignment via geo-proximity.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['pickup', 'dropoff'],
                properties: {
                  pickup: { $ref: '#/components/schemas/Location' },
                  dropoff: { $ref: '#/components/schemas/Location' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Ride booked',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', properties: { ride: { $ref: '#/components/schemas/Ride' } } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      get: {
        tags: ['Rides'],
        summary: 'Get all rides — admin only',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Paginated rides',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        items: { type: 'array', items: { $ref: '#/components/schemas/Ride' } },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/rides/my': {
      get: {
        tags: ['Rides'],
        summary: 'Get rides for the authenticated user',
        description: 'Returns rides where the user is either the rider or the assigned driver.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Paginated rides',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        items: { type: 'array', items: { $ref: '#/components/schemas/Ride' } },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/rides/{id}': {
      get: {
        tags: ['Rides'],
        summary: 'Get a ride by ID',
        description: "Driver phone number is only included when the ride status is accepted, ongoing, or completed.",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Ride details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', properties: { ride: { $ref: '#/components/schemas/Ride' } } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/rides/{id}/accept': {
      patch: {
        tags: ['Rides'],
        summary: 'Accept an assigned ride — driver only',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Ride accepted (status → accepted)' },
          400: {
            description: 'Ride is not pending',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/rides/{id}/reject': {
      patch: {
        tags: ['Rides'],
        summary: 'Reject an assigned ride — driver only',
        description: 'System automatically attempts to assign the next nearest available driver.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Ride rejected, reassignment attempted' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/rides/{id}/start': {
      patch: {
        tags: ['Rides'],
        summary: 'Start a ride — driver only',
        description: 'Moves ride from accepted → ongoing.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Ride started (status → ongoing)' },
          400: {
            description: 'Ride is not accepted',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/rides/{id}/complete': {
      patch: {
        tags: ['Rides'],
        summary: 'Complete a ride — driver only',
        description: 'Moves ride from ongoing → completed. Sets final fare and increments driver total rides.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Ride completed (status → completed)' },
          400: {
            description: 'Ride is not ongoing',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/rides/{id}/cancel': {
      patch: {
        tags: ['Rides'],
        summary: 'Cancel a ride — rider only',
        description: 'Only pending or accepted rides can be cancelled.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cancelReason: { type: 'string', example: 'Changed my mind' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Ride cancelled' },
          400: {
            description: 'Ride cannot be cancelled at this stage',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    // ─── PAYMENTS ────────────────────────────────────────────────────────────
    '/payments/webhook/paystack': {
      post: {
        tags: ['Payments'],
        summary: 'Paystack webhook — called by Paystack servers only',
        description: 'Verifies HMAC-SHA512 signature. On `charge.success`, marks the matching payment as completed. Pass `paymentId` (MongoDB _id) in the Paystack transaction metadata so the webhook can find the record.',
        parameters: [
          {
            name: 'x-paystack-signature',
            in: 'header',
            required: true,
            schema: { type: 'string' },
            description: 'HMAC-SHA512 of raw request body signed with PAYSTACK_SECRET_KEY',
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  event: { type: 'string', example: 'charge.success' },
                  data: {
                    type: 'object',
                    properties: {
                      reference: { type: 'string', example: 'paystack_ref_abc123' },
                      amount: { type: 'integer', example: 150000, description: 'Amount in kobo' },
                      metadata: {
                        type: 'object',
                        properties: {
                          paymentId: { type: 'string', example: '664abc123def456789012345' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Webhook received and processed' },
          400: { description: 'Missing signature' },
          401: { description: 'Invalid webhook signature' },
        },
      },
    },
    '/payments': {
      post: {
        tags: ['Payments'],
        summary: 'Initiate payment for a completed ride — rider only',
        description: 'One payment per ride. Ride must be in completed status.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rideId'],
                properties: {
                  rideId: { type: 'string', example: '664abc123def456789012345' },
                  method: { type: 'string', enum: ['card', 'wallet', 'cash'], default: 'cash' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Payment initiated (status: pending)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', properties: { payment: { $ref: '#/components/schemas/Payment' } } },
                  },
                },
              },
            },
          },
          400: {
            description: 'Ride not completed or payment already initiated',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      get: {
        tags: ['Payments'],
        summary: 'Get all payments — admin only',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Paginated payments',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        items: { type: 'array', items: { $ref: '#/components/schemas/Payment' } },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/payments/my': {
      get: {
        tags: ['Payments'],
        summary: 'Get payments for the authenticated user (rider or driver)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Paginated payments',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        items: { type: 'array', items: { $ref: '#/components/schemas/Payment' } },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/payments/ride/{rideId}': {
      get: {
        tags: ['Payments'],
        summary: 'Get the payment for a specific ride',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'rideId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Payment details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', properties: { payment: { $ref: '#/components/schemas/Payment' } } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ─── RATINGS ─────────────────────────────────────────────────────────────
    '/ratings': {
      post: {
        tags: ['Ratings'],
        summary: 'Rate a driver after a completed ride — rider only',
        description: 'One rating per ride. Automatically updates the driver average rating.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rideId', 'stars'],
                properties: {
                  rideId: { type: 'string', example: '664abc123def456789012345' },
                  stars: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
                  comment: { type: 'string', example: 'Very professional driver' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Rating submitted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', properties: { rating: { $ref: '#/components/schemas/Rating' } } },
                  },
                },
              },
            },
          },
          400: {
            description: 'Ride not completed or already rated',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/ratings/driver/{driverId}': {
      get: {
        tags: ['Ratings'],
        summary: 'Get all ratings for a driver',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'driverId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Paginated ratings',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        items: { type: 'array', items: { $ref: '#/components/schemas/Rating' } },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/ratings/ride/{rideId}': {
      get: {
        tags: ['Ratings'],
        summary: 'Get the rating for a specific ride',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'rideId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Rating for the ride',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', properties: { rating: { $ref: '#/components/schemas/Rating' } } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
  },
}
