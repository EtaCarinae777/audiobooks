import { rest } from "msw";

const BASE_URL = "http://127.0.0.1:8000";

export const handlers = [
  // Auth endpoints
  rest.post(`${BASE_URL}/login/`, (req, res, ctx) => {
    const { email, password } = req.body;

    if (email === "test@example.com" && password === "password123") {
      return res(
        ctx.status(200),
        ctx.json({
          token: "mock-auth-token",
          user: { id: 1, email: "test@example.com" },
        })
      );
    }

      return res(
        ctx.status(400),
        ctx.json({ error: "Nieprawidłowy email lub hasło" })
      );
    }),
    rest.get('/api/user/library', (req, res, ctx) => {
      return res(
        ctx.json([
          {
            id: 1,
            title: 'Library Book 1',
            author: 'Test Author',
            narrator: 'Test Narrator',
            duration: '5h 30m',
            rating: 4.5,
            is_favorite: true,
            progress: 0.3,
            chapters: [
              { id: 1, title: 'Chapter 1', audio_file: '/test-audio.mp3' }
            ]
          }
        ])
      )
    }),


  rest.post(`${BASE_URL}/register/`, (req, res, ctx) => {
    const { email, password } = req.body;

    if (email === "existing@example.com") {
      return res(
        ctx.status(400),
        ctx.json({ email: ["User with this email already exists."] })
      );
    }

    return res(
      ctx.status(201),
      ctx.json({
        message: "User created successfully",
        user: { id: 1, email },
      })
    );
  }),

  rest.post(`${BASE_URL}/check-email/`, (req, res, ctx) => {
    const { email } = req.body;
    const exists = email === "existing@example.com";

    return res(ctx.status(200), ctx.json({ exists }));
  }),

  rest.post(`${BASE_URL}/logoutall/`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: "Logged out" }));
  }),

  // Audiobooks endpoints
  rest.get(`${BASE_URL}/audiobooks/`, (req, res, ctx) => {
    const search = req.url.searchParams.get("search");

    const audiobooks = [
      {
        id: 1,
        title: "Test Audiobook 1",
        author: 1,
        author_name: "Test Author",
        narrator: "Test Narrator",
        cover_image: "/test-cover.jpg",
        category_name: "Fiction",
        duration_formatted: "5h 30m",
        average_rating: 4.5,
        is_premium: false,
        is_purchased: true,
        price: "29.99",
      },
      {
        id: 2,
        title: "Premium Audiobook",
        author: 2,
        author_name: "Premium Author",
        narrator: "Premium Narrator",
        cover_image: "/premium-cover.jpg",
        category_name: "Mystery",
        duration_formatted: "8h 15m",
        average_rating: 4.8,
        is_premium: true,
        is_purchased: false,
        price: "49.99",
      },
    ];

    if (search) {
      const filtered = audiobooks.filter(
        (book) =>
          book.title.toLowerCase().includes(search.toLowerCase()) ||
          book.author_name.toLowerCase().includes(search.toLowerCase())
      );
      return res(ctx.status(200), ctx.json(filtered));
    }

    return res(ctx.status(200), ctx.json(audiobooks));
  }),

  rest.get(`${BASE_URL}/audiobooks/:id/`, (req, res, ctx) => {
    const { id } = req.params;

    return res(
      ctx.status(200),
      ctx.json({
        id: parseInt(id),
        title: "Test Audiobook Details",
        author: 1,
        author_name: "Test Author",
        narrator: "Test Narrator",
        description: "Test description for the audiobook",
        cover_image: "/test-cover.jpg",
        category_name: "Fiction",
        duration_formatted: "5h 30m",
        average_rating: 4.5,
        is_premium: false,
        is_purchased: true,
        price: "29.99",
      })
    );
  }),

  rest.get(`${BASE_URL}/audiobooks/:id/chapters/`, (req, res, ctx) => {
    const { id } = req.params;

    if (id === "2") {
      // Premium audiobook without access
      return res(ctx.status(403), ctx.json({ error: "Access denied" }));
    }

    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          title: "Chapter 1: Introduction",
          chapter_number: 1,
          duration_formatted: "45 min",
          audio_file: "/audio/chapter1.mp3",
        },
        {
          id: 2,
          title: "Chapter 2: The Beginning",
          chapter_number: 2,
          duration_formatted: "52 min",
          audio_file: "/audio/chapter2.mp3",
        },
      ])
    );
  }),

  // Authors endpoints
  rest.get(`${BASE_URL}/authors/`, (req, res, ctx) => {
    const search = req.url.searchParams.get("search");

    const authors = [
      {
        id: 1,
        name: "Test Author",
        bio: "A test author bio",
        audiobooks_count: 5,
      },
      {
        id: 2,
        name: "Another Author",
        bio: "Another author bio",
        audiobooks_count: 3,
      },
    ];

    if (search) {
      const filtered = authors.filter((author) =>
        author.name.toLowerCase().includes(search.toLowerCase())
      );
      return res(ctx.status(200), ctx.json(filtered));
    }

    return res(ctx.status(200), ctx.json(authors));
  }),

  rest.get(`${BASE_URL}/authors/:id/`, (req, res, ctx) => {
    const { id } = req.params;

    return res(
      ctx.status(200),
      ctx.json({
        id: parseInt(id),
        name: "Test Author",
        bio: "A detailed bio of the test author",
        audiobooks_count: 5,
      })
    );
  }),

  rest.get(`${BASE_URL}/authors/:id/audiobooks/`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          title: "Author Book 1",
          category_name: "Fiction",
          narrator: "Test Narrator",
          duration_formatted: "5h 30m",
          average_rating: 4.5,
          cover_image: "/test-cover.jpg",
        },
      ])
    );
  }),

  // Library endpoints
  rest.get(`${BASE_URL}/library/`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          audiobook: {
            id: 1,
            title: "Library Book 1",
            author: 1,
            author_name: "Test Author",
            narrator: "Test Narrator",
            cover_image: "/test-cover.jpg",
            category_name: "Fiction",
            duration_formatted: "5h 30m",
            average_rating: 4.5,
          },
          is_favorite: true,
          added_date: "2024-01-01",
        },
      ])
    );
  }),

  rest.post(`${BASE_URL}/library/add/`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ message: "Added to library", in_library: true })
    );
  }),

  rest.delete(`${BASE_URL}/library/remove/:id/`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ message: "Removed from library", in_library: false })
    );
  }),

  // Payment endpoints
  rest.get(`${BASE_URL}/payments/config/`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        publishable_key: "pk_test_mock_key",
      })
    );
  }),

  rest.post(`${BASE_URL}/payments/create-intent/`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        client_secret: "pi_mock_client_secret",
      })
    );
  }),

  rest.post(`${BASE_URL}/payments/confirm/`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message:
          "Payment successful! Audiobook has been added to your library.",
      })
    );
  }),
];
