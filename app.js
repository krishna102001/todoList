//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//intially we are storing in array 
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

//connect mongodb
mongoose.connect("mongodb+srv://admin-krishna:Test123@cluster0.bugotr5.mongodb.net/todolist");

// defining the schema
const itemSchema = new mongoose.Schema({
  name : {
    type : String,
    required : false
  }
});

// defining Model 
const Item = mongoose.model("Item",itemSchema);

//defining the three new model documents
const item1 = new Item({
  name : "Buy Food"
});
const item2 = new Item({
  name : "Hit + button to add an item"
});
const item3 = new Item({
  name : "<-- Hit to delete the item"
});
//default items
const defaultItems = [item1,item2,item3];
// Item.insertMany(defaultItems);
async function getAllList(){
  try{
    const items =await Item.find({});
    return items;
  }catch(err){
    console.log(err);
  }
}

const listSchema = new mongoose.Schema({
  name : String,
  items : [itemSchema]
})

const List = mongoose.model("List",listSchema);

app.get("/", async function(req, res) {
  try{
    const items = await getAllList();
    if(items.length==0){
      Item.insertMany(defaultItems);
      console.log(items);
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  }catch(err){
    console.log(err);
    res.status(404);
  }
});

app.post("/", async function(req, res){

  const newItem = req.body.newItem;
  const listName = req.body.list;
  console.log(newItem);
  const item = new Item({
    name : newItem
  })
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    const foundItems = await List.findOne({name : listName}) // it return direct javascript object
    // console.log(foundItems);
    foundItems.items.push(item);
    foundItems.save();
    res.redirect("/" + listName);
  }
  
});

app.post("/delete", async(req,res)=>{
    const checkItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
      await Item.findByIdAndRemove(checkItemId);
      res.redirect("/");
    }
    else{
      await List.findOneAndUpdate({name : listName},{$pull : {items : {_id : checkItemId}}})
      res.redirect("/" + listName);
    }
    
})
// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
app.get("/:customListName",async(req,res)=>{
  const customListName = _.capitalize(req.params.customListName);
  // console.log(await List.findOne({name : customListName}));
  if(!await List.findOne({name : customListName})){
    // console.log(await List.findOne({name : customListName}));
    const list = new List({
      name : customListName,
      items : defaultItems
    })
    list.save();
    res.redirect("/" + customListName)
  }
  else{
    const foundItems = await List.find({name : customListName})
    // console.log(foundItems[0].items);
    res.render("list",{listTitle : customListName, newListItems : foundItems[0].items})
  }
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
