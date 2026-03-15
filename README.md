# StudyTube

## Your AI-Powered Learning Companion

### Features
- **Summarization**: Automatically summarize videos to help learners grasp key points quickly.
- **Quiz Generation**: Generate personalized quizzes based on video content, enhancing retention and understanding.
- **Progress Tracking**: Monitor learning progress with detailed analytics and feedback.
- **JWT Authentication**: Secure user sessions with JSON Web Tokens ensuring safe access to features.

### Technical Stack
- **Backend**: Java 21, Spring Boot 3.4
- **Frontend**: React 18, TypeScript
- **Database**: PostgreSQL
- **Caching**: Redis
- **Containerization**: Docker

### Infrastructure Details
- Optimized for 2 vCPUs and 4GB RAM, capable of supporting 500-1000 concurrent users. Utilizes HikariCP for efficient database connection management.

### Business Value
- The MVP valuation ranges from $3,000 to $7,000, marking significant potential for educational institutions and learners.

### Installation Guide
#### Prerequisites
- Docker installed
- Basic understanding of Docker and command line usage.

#### Docker Compose
```yaml
version: '3'
services:
  db:
    image: postgres:latest
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: studytube
  app:
    build: .
    ports:
      - '8080:8080'
    depends_on:
      - db
```

### Environment Variables
- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: Secret key for JWT signing

### API Documentation
| Endpoint                    | Method  | Description                            |
|-----------------------------|---------|----------------------------------------|
| `/api/auth/login`           | POST    | Login to retrieve JWT token           |
| `/api/videos`               | GET     | Retrieve list of videos               |
| `/api/videos/:id/quiz`     | GET     | Generate quiz for video               |
| `/api/progress`             | GET     | Fetch user progress                    |

### Server Deployment
- To deploy the server, run:
    ```sh
    docker-compose up --build
    ```
- Access the application at http://167.99.212.79:8080

### License
MIT License

### Contact
For inquiries, please contact @A1kol