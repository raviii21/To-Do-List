const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();
app.set("view engine", "ejs"); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// Database connectivity.
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://ravisavsani:ravisavsani@cluster0.hqzrkt4.mongodb.net/todolistDB");

// Create Schema for collection.
const itemsSchema = {
  name: String
};

// Create Mongoose Model for collection.
const Item = mongoose.model("Item",itemsSchema);

const item1=new Item({
  name : "Welcome to your ToDo List."
});
const item2=new Item({
  name:"Hit the + button to add a new item."
});
const item3=new Item({
  name : "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3]; 

// Create Schema for list when user add some extra URL path to the end.
const listSchema = {
 name : String,
 items: [itemsSchema]
}; 
const List = mongoose.model("List",listSchema);

app.get("/", function (req, res) {
   
  Item.find({},function(err,foundItems){
    if(foundItems.length==0){
        Item.insertMany(defaultItems,function(err){
        if(err) console.log(err);
        else console.log("Successfully added defaultIems.");
      });
      res.redirect("/");
    }else{
      res.render('list',{TITLE : "Today",LISTITEMS : foundItems});
    }
  })
  
}); 

app.post("/",function(req,res){
  const itemName = req.body.item; 
  const listName = req.body.button;
  
 const item= new Item({
  name: itemName
 });

 if(listName == "Today"){
  item.save();
  res.redirect("/");
 }else{
  List.findOne({name: listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
      res.redirect("/" + listName);
  });
 }
 
  
}); 

app.post("/delete",function(req,res){
 const checkeditemID=req.body.checkbox;
 const listName = req.body.listName;

 if(listName == "Today"){
  Item.findByIdAndRemove(checkeditemID,function(err){
    if(!err) {console.log("Succesfully deleted checked Items. ");
       res.redirect("/");
    }   
  });
 }else{
    List.findOneAndUpdate({name: listName}, { $pull :{items : {_id: checkeditemID } } }, function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    }); 
 }

});


app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  
  List.findOne({name: customListName},function(err,foundList){
      if(!err){
        if(!foundList){
            // Create a new List.
            const list = new List({
              name: customListName,
              items: defaultItems
            });
            
            list.save();
            res.redirect("/" + customListName);
        }
        else{
             res.render("list",{TITLE : foundList.name,LISTITEMS : foundList.items});
        }
      }
  });

})

app.post("/work",function(req,res){
  const item=req.body.item;
  workitems.push(item);
  res.redirect("/work");
});


let port=process.env.PORT;
if(port ==null || port==""){
  port=3000;
}

app.listen(port, function () {
  console.log("Server has started successfully");
});
