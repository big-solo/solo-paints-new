const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// ✅ FIX 1: Serve all your pictures and logo
app.use(express.static(__dirname));

// --- MongoDB - FIX 2: Support both MONGO_URI and MONGODB_URI ---
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
mongoose.connect(mongoUri)
.then(()=> console.log("✅ MongoDB Connected - FINAL DB Ready"))
.catch(err=> console.log("❌ Mongo Error:", err));

// --- Quote Schema ---
const quoteSchema = new mongoose.Schema({
  name: String, phone: String, location: String, service: String,
  size: String, color: String, estimate: String,
  paintType: String, buckets: Object, paintCost: Number, workCost: Number,
  details: String
},{timestamps:true});
const Quote = mongoose.model('Quote', quoteSchema);

// --- JWT Middleware ---
function protect(req,res,next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({error:"No token"});
  const token = auth.split(' ')[1];
  try{
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  }catch(e){
    return res.status(401).json({error:"Invalid token"});
  }
}

// --- Routes ---
app.post('/api/quote', async (req,res)=>{
  console.log("FRONTEND SENT:", req.body);
  try{
    const q = new Quote(req.body);
    const saved = await q.save();
    console.log("✅ SAVED TO DB:", saved);
    res.json({success:true, data:saved});
  }catch(e){
    console.log("❌ SAVE ERROR:", e);
    res.status(400).json({error:e.message});
  }
});

app.get('/api/quotes', protect, async (req,res)=>{
  const quotes = await Quote.find().sort({createdAt:-1});
  res.json(quotes);
});

app.delete('/api/quotes/:id', protect, async (req,res)=>{
  await Quote.findByIdAndDelete(req.params.id);
  res.json({success:true});
});

app.post('/api/login', async (req,res)=>{
  const {username, password} = req.body;
  if(username!== process.env.ADMIN_USER || password!== process.env.ADMIN_PASS){
    return res.status(401).json({error:"Wrong username or password"});
  }
  const token = jwt.sign({user:username}, process.env.JWT_SECRET, {expiresIn:'7d'});
  res.json({success:true, token});
});

// Serve HTML
app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'index.html')));
app.get('/admin', (req,res)=> res.sendFile(path.join(__dirname,'admin.html')));
app.get('/login', (req,res)=> res.sendFile(path.join(__dirname,'login.html')));

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));