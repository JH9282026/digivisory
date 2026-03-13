# DVB CMS — REST API Reference

All API endpoints are available under `/api/`. Admin endpoints require authentication via NextAuth.js session cookies.

---

### Authentication

DVB CMS uses NextAuth.js with JWT session strategy.

#### Login

```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response:** `200 OK`
```json
{
  "token": "jwt_token_string",
  "user": { "id": "...", "email": "...", "name": "...", "role": "admin" }
}
```

#### NextAuth Session

For browser-based access, use the NextAuth.js endpoints:

```
GET  /api/auth/session     — Get current session
POST /api/auth/signin      — Sign in (HTML form)
POST /api/auth/signout     — Sign out
GET  /api/auth/csrf        — Get CSRF token
```

---

### Posts

#### List Posts

```
GET /api/posts
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status: `draft`, `published`, `scheduled` |
| `search` | string | Search in title and content |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response:** `200 OK`
```json
[
  {
    "id": "clx...",
    "title": "My Post Title",
    "slug": "my-post-title",
    "excerpt": "Short description...",
    "status": "published",
    "publishedAt": "2026-03-12T00:00:00Z",
    "featuredImage": "https://bs-uploads.toptal.io/blackfish-uploads/components/blog_post_page/6389919/cover_image/regular_1708x683/Next-js-Improving-Page-Speed-of-a-Server-Side-React-App-Blog-7d4de23630c897d49e1c5be730ad5695.png",
    "readingTime": 5,
    "author": { "id": "...", "name": "Admin" },
    "categories": [{ "category": { "id": "...", "name": "Tech", "slug": "tech" } }],
    "tags": [{ "tag": { "id": "...", "name": "NextJS", "slug": "nextjs" } }]
  }
]
```

#### Get Single Post

```
GET /api/posts/:id
```

**Response:** `200 OK` — Full post object including `content` field

#### Create Post

```
POST /api/posts
```

**Body:**
```json
{
  "title": "New Post",
  "slug": "new-post",
  "content": "<p>HTML content here</p>",
  "contentType": "richtext",
  "excerpt": "Brief summary",
  "status": "draft",
  "featuredImage": "https://lh6.googleusercontent.com/VJCMDW9zwsfAR5WraeOA4gjVF6tpM186Ccm2a0TLTNRzafSFLqfzyNAz1j9C2owPy5xXXS4LHwws7XsCm3KHTEkYhK4UfZ7M7NXlw__PuqO1ooj2rn03vvP1hKa1kSQB66puTK35v_48nLvOCXmf3g",
  "featuredImageAlt": "Alt text",
  "metaTitle": "SEO Title",
  "metaDescription": "SEO description",
  "metaRobots": "index, follow",
  "canonicalUrl": "",
  "focusKeyword": "keyword",
  "schemaType": "BlogPosting",
  "categoryIds": ["cat_id_1"],
  "tagIds": ["tag_id_1"]
}
```

**Response:** `201 Created`

#### Update Post

```
PUT /api/posts/:id
```

**Body:** Same as create (all fields optional)

**Response:** `200 OK`

#### Delete Post

```
DELETE /api/posts/:id
```

**Response:** `200 OK`

---

### Pages

#### List Pages

```
GET /api/pages
```

#### Get Page

```
GET /api/pages/:id
```

#### Create Page

```
POST /api/pages
```

**Body:**
```json
{
  "title": "About Us",
  "slug": "about",
  "content": "<p>Page content</p>",
  "status": "published",
  "metaTitle": "About Us",
  "metaDescription": "Learn about our team"
}
```

#### Update Page

```
PUT /api/pages/:id
```

#### Delete Page

```
DELETE /api/pages/:id
```

---

### Categories

#### List Categories

```
GET /api/categories
```

**Response:**
```json
[
  {
    "id": "...",
    "name": "Technology",
    "slug": "technology",
    "description": "Tech articles",
    "_count": { "posts": 15 }
  }
]
```

#### Create Category

```
POST /api/categories
```

**Body:**
```json
{
  "name": "New Category",
  "slug": "new-category",
  "description": "Description here"
}
```

#### Update Category

```
PUT /api/categories/:id
```

#### Delete Category

```
DELETE /api/categories/:id
```

---

### Tags

#### List Tags

```
GET /api/tags
```

#### Create Tag

```
POST /api/tags
```

**Body:**
```json
{
  "name": "JavaScript",
  "slug": "javascript"
}
```

#### Update Tag

```
PUT /api/tags/:id
```

#### Delete Tag

```
DELETE /api/tags/:id
```

---

### Media

#### List Media

```
GET /api/media
```

**Response:**
```json
[
  {
    "id": "...",
    "fileName": "image.jpg",
    "fileType": "image/jpeg",
    "fileSize": 245000,
    "url": "https://www.continualengine.com/wp-content/uploads/2024/06/Alt-Text-on-Images-What-is-it-and-How-to-Write-It.png",
    "altText": "Description",
    "width": 1200,
    "height": 800,
    "createdAt": "2026-03-12T00:00:00Z"
  }
]
```

#### Upload Media (Presigned URL)

**Step 1:** Get presigned upload URL

```
POST /api/upload/presigned
```

**Body:**
```json
{
  "fileName": "photo.jpg",
  "contentType": "image/jpeg",
  "isPublic": true
}
```

**Response:**
```json
{
  "uploadUrl": "https://upload.wikimedia.org/wikipedia/commons/0/0e/Cloud_storage_architecture.png",
  "cloudPath": "public/uploads/1234-photo.jpg"
}
```

**Step 2:** Upload file directly to the presigned URL (PUT request)

**Step 3:** Complete the upload

```
POST /api/upload/complete
```

**Body:**
```json
{
  "fileName": "photo.jpg",
  "fileType": "image/jpeg",
  "fileSize": 245000,
  "cloudPath": "public/uploads/1234-photo.jpg",
  "isPublic": true
}
```

#### Delete Media

```
DELETE /api/media/:id
```

---

### Menus

#### Get Menus

```
GET /api/menus
```

**Response:**
```json
{
  "header": [
    { "id": "...", "label": "Home", "url": "/", "target": "_self", "sortOrder": 0 }
  ],
  "footer": [
    { "id": "...", "label": "Privacy", "url": "/page/privacy", "target": "_self", "sortOrder": 0 }
  ]
}
```

#### Save Menus

```
POST /api/menus
```

**Body:**
```json
{
  "header": [
    { "label": "Home", "url": "/", "target": "_self", "sortOrder": 0 },
    { "label": "Blog", "url": "/blog", "target": "_self", "sortOrder": 1 }
  ],
  "footer": [
    { "label": "Privacy", "url": "/page/privacy", "target": "_self", "sortOrder": 0 }
  ]
}
```

---

### Site Settings

#### Get Settings

```
GET /api/settings
```

#### Update Settings

```
PUT /api/settings
```

**Body:** (all fields optional)
```json
{
  "siteName": "My Blog",
  "tagline": "A modern blog",
  "siteUrl": "https://example.com",
  "defaultMetaTitle": "My Blog - Default Title",
  "defaultMetaDesc": "Default meta description",
  "enableSidebar": true,
  "colorScheme": "indigo",
  "headerAdCode": "<script>...</script>",
  "customCss": "body { ... }",
  "robotsTxt": "User-agent: *\nAllow: /"
}
```

---

### Redirects

#### List Redirects

```
GET /api/redirects
```

#### Create Redirect

```
POST /api/redirects
```

**Body:**
```json
{
  "fromPath": "/old-page",
  "toPath": "/new-page",
  "type": 301
}
```

#### Delete Redirect

```
DELETE /api/redirects/:id
```

---

### 404 Monitor

#### Get 404 Logs

```
GET /api/404-log
```

**Response:**
```json
[
  {
    "id": "...",
    "path": "/missing-page",
    "count": 42,
    "lastSeen": "2026-03-12T10:00:00Z",
    "referer": "https://google.com"
  }
]
```

---

### Import / Export

#### Export Content

```
GET /api/export?format=json
GET /api/export?format=wordpress
```

#### Import Content

```
POST /api/import
Content-Type: application/json
```

**Body:**
```json
{
  "format": "json",
  "data": { ... }
}
```

---

### Dashboard Stats

```
GET /api/dashboard
```

**Response:**
```json
{
  "totalPosts": 45,
  "publishedPosts": 38,
  "draftPosts": 7,
  "totalPages": 5,
  "totalCategories": 8,
  "totalTags": 15,
  "totalMedia": 120
}
```

---

### User Profile

#### Get Profile

```
GET /api/user
```

#### Update Profile

```
PUT /api/user
```

**Body:**
```json
{
  "name": "John Doe",
  "bio": "Writer and developer",
  "expertise": "Web Development",
  "credentials": "B.S. Computer Science",
  "jobTitle": "Senior Developer",
  "twitterUrl": "https://twitter.com/johndoe",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "password": "new_password"
}
```

---

### Public Endpoints (No Auth Required)

| Endpoint | Description |
|----------|-------------|
| `GET /api/posts?status=published` | Published posts (filtered) |
| `GET /sitemap.xml` | XML Sitemap |
| `GET /robots.txt` | Robots.txt |
| `GET /llms.txt` | AI crawler guide |

---

### Error Responses

All errors follow this format:

```json
{
  "error": "Description of the error"
}
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request (invalid input) |
| `401` | Unauthorized (not logged in) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Resource not found |
| `500` | Internal server error |

---

### Rate Limiting

API rate limiting can be configured via Nginx. Uncomment the rate limiting section in `config/nginx/default.conf`:

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
location /api/ {
    limit_req zone=api burst=60 nodelay;
    proxy_pass http://nextjs;
}
```
