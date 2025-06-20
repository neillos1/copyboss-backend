// 🔐 Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// 🚀 Backend setup
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import Stripe from 'stripe';

const app = express();


// ✅ CORS Setup
app.use(cors({
  origin: ['https://copy-boss.com', 'https://www.copy-boss.com', 'https://copyboss.onrender.com'],
  methods: ['GET', 'POST'],
  credentials: true
}));


app.use(bodyParser.json());

// 🧪 Log every incoming request
app.use((req, res, next) => {
  console.log(`➡️  Incoming: ${req.method} ${req.url}`);
  next();
});

// 🧪 CORS Test Endpoint
app.get('/cors-test', (req, res) => {
  res.json({ cors: "ok" });
});

// 💳 Stripe setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 🟦 Stripe webhook raw body parser (must come before json parser)
app.use('/webhook', express.raw({ type: 'application/json' }));

// 🧠 OpenAI Script Generator Endpoint
app.post('/generate', async (req, res) => {
  const prompt = req.body.prompt;
  console.log("🟢 Prompt received:", prompt);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a social media script expert." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// 💰 Stripe Checkout Endpoint
app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Unlimited Script Generator + Bonus Tools',
              description: 'Lifetime access to viral script generator, hashtag tool, and bonuses.',
            },
            unit_amount: 199, // £1.99 in pence
          },
          quantity: 1,
        },
      ],
      success_url: 'http://copy-boss.com/success.html',
      cancel_url: 'http://copy-boss.com/cancel.html',
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error("❌ Stripe session error:", err);
    res.status(500).json({ error: 'Something went wrong with Stripe.' });
  }
});

// ✅ Stripe Webhook Verification
app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
  const endpointSecret = 'whsec_...'; // Replace this later
  const sig = request.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    console.log('✅ Webhook verified:', event.type);
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('💰 Payment completed for:', session.customer_email);
  }

  response.status(200).end();
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
// Force rebuild
// Force rebuild
