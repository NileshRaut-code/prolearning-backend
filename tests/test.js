import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Initialize the Express app
const app = express();

// Middleware setup
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Define a simple route for testing
app.get('/', (req, res) => {
  res.send('helloasdasd');
});

// Mocha describe block for tests
describe('Express App', () => {
  let server;

  // Before hook: Start the server before running tests
  before((done) => {
    server = app.listen(3000, () => {
      console.log('Server started on port 3000');
      done();
    });
  });

  // After hook: Close the server after tests
  after((done) => {
    server.close(() => {
      console.log('Server closed');
      done();
    });
  });

  // Test case: Check if GET / responds with 'hello'
  it('GET / should return "hello"', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .expect('hello')
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});
