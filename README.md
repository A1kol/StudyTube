# How to Run the Project

To run the project, you can use Docker Compose commands:

### Production Environment
To start the application in production mode:
```bash
docker compose up -d --build
```

### Development Environment
To start the application in development mode:
```bash
docker compose up --build
```

### Stopping Services
To stop all running services:
```bash
docker compose down
```

### Checking Containers
To check the running containers:
```bash
docker ps
```

### Viewing Logs
To view the logs for the services:
```bash
docker compose logs
```

### Additional Helpful Commands
- `docker images`: List all Docker images on your machine.
- `docker network ls`: List all Docker networks.

## Troubleshooting
If you encounter any issues:
- Ensure Docker and Docker Compose are installed and running.
- Check the logs using `docker compose logs` for any error messages.
- Verify that the .env file is correctly configured, if applicable.
- Ensure that no other applications are using the same ports.

If issues persist, consult the official Docker documentation or seek help from the community.