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
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);




// ✅ CORS Setup
app.use(cors({
  origin: ['https://copy-boss.com', 'https://www.copy-boss.com'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(bodyParser.json());

// 🔥 Wake endpoint to prevent Render cold starts
app.get('/wake', (req, res) => {
  res.send('🔥 Server is awake');
});

/// 💰 Stripe Checkout Endpoint
app.post('/create-checkout-session', async (req, res) => {
  console.log("🔁 Incoming Stripe Checkout Session request");

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
            unit_amount: 199,
          },
          quantity: 1,
        },
      ],
      success_url: 'https://copy-boss.com/?accesscode=ABC123',
      cancel_url: 'https://copy-boss.com/cancel.html',
    });

    console.log("✅ Stripe session created:", session.url);
    res.status(200).json({ id: session.id });

  } catch (err) {
    console.log("🛑 Stripe ERROR OCCURRED:");
    console.log("🪵 Full Error:", JSON.stringify(err, null, 2)); // ⬅️ must be this
    res.status(500).json({ error: err.message || 'Unknown error with Stripe' });
  }
});





// ✅ Stripe Webhook (Optional - Can be expanded later)
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  res.status(200).send('Webhook received');
});
// ✅ Script Generator Endpoint
app.post('/generate', async (req, res) => {
  const prompt = req.body.prompt;
  console.log("🟢 Prompt received:", prompt);

  try {
    const fakeResponse = {
      choices: [
        {
          message: {
            content: `🔥 ${prompt.trim().slice(0, 60)}...\n💡 Here’s your body line.\n📢 Call to action goes here.`
          }
        }
      ]
    };

    res.status(200).json(fakeResponse);
  } catch (err) {
    console.error("❌ Script generation error:", err);
    res.status(500).json({ error: "Script generation failed" });
  }
});


// 🚀 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
