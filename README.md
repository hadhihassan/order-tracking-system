# Real-Time Order Tracking System with Web Sockets

## Overview

A WebSocket-based **real-time order tracking** system for a **Grocery Delivery** service.  
Built with **Node.js, Express.js, Socket.IO, and MongoDB** to handle real-time communication between users and drivers.

## Features

- **WebSocket Server**: Built with Node.js and Socket.IO for **real-time updates**.
- **JWT Authentication**: Secure client authentication using **JSON Web Tokens (JWT)**.
- **Order Lifecycle Management**:
  - User places an order.
  - Drivers get notified and can **accept/reject**.
  - Order status updates (`pending → preparing → outForDelivery → delivered`).
- **MongoDB Storage**: Orders are persisted in a MongoDB database.
- **Real-Time Broadcasts**: Live updates sent to **users & drivers**.
- **Graceful Error Handling**: Handles disconnections and errors efficiently.
- **Rate Limiting**: Protects against abuse & high traffic spikes.

## Project Structure

The project is organized into two main folders:

- **`rootDir`**: Contains the backend code.

## Setup Instructions

### Server

1. Navigate to the `rootDir` directory:
   ```bash
   cd order-tracking-system
3. Install dependencies:
    ```bash
    npm install
    ```
4. Start the server:
    ```bash
    npm start
    ```

## Environment Variables

Set up the environment variables in the `.env` files for server.

### Server (`order-tracking-system/.env`)

```env
PORT=your_server_runging_port

MONGO_URL=your_mongodb_coonect_url

JWT_SECRET_KEY=your_jwt_secret_key
JWT_EXPIRES=your_jwt_token_expires_time

```
## Testing Setup

1. Navigate to the `rootDir` directory:
   ```bash
   cd order-tracking-system
2. Install testing dependencies:
   ```bash
    npm install --save-dev jest
3. Run the tests:
    ```bash
    npm test
