require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  category: String,
  status: String,   // ✅ ADD THIS
  notes: String
});

const Contact = mongoose.model("Contact", ContactSchema);

app.get("/contacts", async (req,res)=>{
  const contacts = await Contact.find();
  res.json(contacts);
});

app.post("/contacts", async (req,res)=>{
  const contact = new Contact(req.body);
  await contact.save();
  res.json(contact);
});

app.delete("/contacts/:id", async (req,res)=>{
  await Contact.findByIdAndDelete(req.params.id);
  res.json({msg:"Deleted"});
});
app.put("/contacts/:id", async (req, res) => {
  const updated = await Contact.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});
const PORT = process.env.PORT || 4000;

app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));
