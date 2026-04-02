import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const createLimiter = (max, windowMinutes, label) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const forwarded = req.headers['x-forwarded-for']?.split(',')[0].trim();
      return forwarded || ipKeyGenerator(req);
    },
    handler: (req, res) => {
      res.status(429).json({
        error: `Too many requests. You can use ${label} up to ${max} times per ${windowMinutes} minute window. Please try again later.`,
        retryAfter: Math.ceil(windowMinutes),
      });
    },
  });

export const summarizeLimiter = createLimiter(3, 60, 'summarize');
export const uploadLimiter    = createLimiter(3, 60, 'document upload');
export const flashcardLimiter = createLimiter(5, 60, 'flashcards');
export const quizLimiter      = createLimiter(5, 60, 'quiz');
export const chatLimiter      = createLimiter(15, 60, 'chat');