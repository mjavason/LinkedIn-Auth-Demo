import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import passport from 'passport';
import session from 'express-session';
import { setupSwagger } from './swagger.config';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import 'express-async-errors';

//#region App Setup
const app = express();

dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const clientID = process.env.LINKEDIN_CLIENT_ID || 'xxx';
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || 'xxx';
const callbackURL = process.env.LINKEDIN_CALLBACK_URL || 'xxx';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));
app.use(
  session({
    secret: 'SECRET',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
setupSwagger(app, BASE_URL);

passport.use(
  new LinkedInStrategy(
    {
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile', 'openid'], // Request these scopes from LinkedIn
    },
    function (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) {
      // Here, you can create or update your user in the database
      console.log('LinkedIn profile', profile);
      return done(null, profile); // Pass the profile data to the next middleware
    }
  )
);

// Serialize and deserialize user info for the session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

//#endregion App Setup

//#region Code here
// LinkedIn auth route
app.get(
  '/auth/linkedin',
  passport.authenticate('linkedin', { state: 'SOME STATE' })
);

// LinkedIn callback route
app.get(
  '/auth/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/' }),
  (req: Request, res: Response) => {
    // Optionally handle authenticated user data
    return res.send(req.user);
  }
);

app.get('/logout', (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});
//#endregion

//#region Server Setup

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Call a demo external API (httpbin.org)
 *     description: Returns an object containing demo content
 *     tags: [Default]
 *     responses:
 *       '200':
 *         description: Successful.
 *       '400':
 *         description: Bad request.
 */
app.get('/api', async (req: Request, res: Response) => {
  try {
    const result = await axios.get('https://httpbin.org');
    return res.send({
      message: 'Demo API called (httpbin.org)',
      data: result.status,
    });
  } catch (error: any) {
    console.error('Error calling external API:', error.message);
    return res.status(500).send({ error: 'Failed to call external API' });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Health check
 *     description: Returns an object containing demo content
 *     tags: [Default]
 *     responses:
 *       '200':
 *         description: Successful.
 *       '400':
 *         description: Bad request.
 */
app.get('/', (req: Request, res: Response) => {
  return res.send({ message: 'API is Live!' });
});

/**
 * @swagger
 * /obviously/this/route/cant/exist:
 *   get:
 *     summary: API 404 Response
 *     description: Returns a non-crashing result when you try to run a route that doesn't exist
 *     tags: [Default]
 *     responses:
 *       '404':
 *         description: Route not found
 */
app.use((req: Request, res: Response) => {
  return res
    .status(404)
    .json({ success: false, message: 'API route does not exist' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   // throw Error('This is a sample error');

//   console.log(`${'\x1b[31m'}${err.message}${'\x1b][0m]'} `);
//   return res
//     .status(500)
//     .send({ success: false, status: 500, message: err.message });
// });

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});

// (for render services) Keep the API awake by pinging it periodically
// setInterval(pingSelf(BASE_URL), 600000);

//#endregion
