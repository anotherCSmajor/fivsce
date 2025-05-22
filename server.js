const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
 
const cookieParser = require('cookie-parser');
app.use(cookieParser());


app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('./public'))

mongoose.connect(process.env.MONGODB_URI, )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err)); 

  
  app.listen(port,()=>{
    console.log("listening on :",port)
})

//user-schema
const UserSchema = new mongoose.Schema({
    Name:{type:String,},
    password:{type:String},
    username:{type:String},
    inclass:{type:String},
    aboutme:{type:String},
skill:[{type:String, }],


})
User = mongoose.model("User", UserSchema)
// categories list with freelancer username , categories ki schema ;
const CategorieSchema = new mongoose.Schema({
  CategorieName:{type: String},
  userlist:[{type:String,}],

})
Categorielist = mongoose.model("Categorielist",CategorieSchema);


app.post("/setup-profile", async (req,res)=>{
    
    const {username} =  req.body;
const {Name,aboutme,skill,inclass,password}= req.body;
    //const existing =  userlist.find();
    const existing = await User.findOne({ username });
    if (existing) {
      console.log('Username already taken');
      return res.status(400).send("username already existing")
    }

 
 
 if(!username || username.trim()==="" ){
    return res.status(400).send("username missing")
    
};

try{
    
    const newUser = new User({username,Name,aboutme,skill,inclass,password});
    await  newUser.save();
    console.log("user saved");
    res.cookie('username', username);
    res.redirect("/createuser2.html");
}
catch(err){
    console.log(err);
    
}
})


app.post("/setup-profile-step2", async (req, res) => {
    const { username } = req.cookies;  
    const user = await User.findOne({ username });
  
    if (!user) {
      return res.status(404).send('User not found');
    }
  
    const { skill } = req.body;
    
    // Update the existing user's skill
    user.skill = skill;
   //const catlist = new Categorielist({CategorieName,userlist});

   for (const oneskill of skill) {
    await Categorielist.updateOne(
      { CategorieName: oneskill },
      {
        $setOnInsert: { CategorieName: oneskill },
        $addToSet: { userlist: username }
      },
      { upsert: true }
    );
  }
  
  
    // Save the updated user
    await user.save();
    console.log("User skill saved");
  
    res.redirect("userprofile.html");
  });
  

app.post("/login",async(req,res)=>{

 
    const { username } = req.body  || req.cookies ;  
    const {password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).send('User not found');
    }
    if(user.password!==password){
      return res.send ("incorrect password")
    }
    res.cookie('username', username);
    res.redirect("./userprofile.html");
})
app.get("/userprofile", async(req,res)=>{
  const { username }= req.cookies;
 
  const user = await User.findOne({ username });
  if (!user) {
    return res.redirect("/afterlogoutpage.html");
  }
  res.send(user);
})
//sending on list of creater on basis of skill/category
app.get("/getcreater",async(req,res)=>{
  const  CategorieName  = req.query.CName;
  console.log(req.query.CName);
  console.log(CategorieName );
  try {
    
    const category  = await Categorielist.findOne({ CategorieName })
    if (!category) {
      
      return res.status(404).json({ error: "Category not found" });

    }
    res.json({ userlist: category.userlist });
  
 
  } catch (error) {
console.log(error);
res.send("server error");
  }
  

})
app.get("/createrprofile", (req,res)=>{
  console.log(req.query.id);
  res.send (`hello dear welcome to page of ${req.query.id} `);
})
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect("./afterlogoutpage.html");
})
