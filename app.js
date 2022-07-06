//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-Sparsh:Test123@cluster0.xsnynjf.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const itemsSchema = {
  name: String,
  done: Boolean,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome!"
});
const item2 = new Item({
  name: "Click + to add new element"
});
const item3 = new Item({
  name: "click - to delete an item"
});

const defaultitems = [item1, item2, item3];

const listSchema = {
  name: String,
  itemslist: [itemsSchema],
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, result) {

    if (result.length === 0) {
      Item.insertMany(defaultitems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Done!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: result
      });
    }
  });
});

app.post("/", function(req, res) {

  const itemname = req.body.newItem;
  const listname = req.body.list;
  const item = new Item({
    name: itemname,
  });
  if (listname === "Today") {
    item.save();
    res.redirect("/");
  } else {
  List.findOne({name : listname},function(err,result){
    result.itemslist.push(item);
    result.save();
    res.redirect("/" + listname);
  });
  }

});

app.post("/delete", function(req, res) {
  const itemcheckedid = req.body.checkbox;
  const listname = req.body.listname;
  if (listname === "Today") {
    Item.findByIdAndRemove(itemcheckedid, function(err) {
      if (!err) {
        console.log("Succesfully deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name : listname},{$pull : {itemslist : {_id: itemcheckedid}}},function(err,result){
      if(!err){
        res.redirect("/" + listname);
      }
    });
  }

});

app.get("/:listname", function(req, res) {
  const clistname = _.capitalize(req.params.listname);
  List.findOne({
    name: clistname
  }, function(err, result) {

    if (!err) {
      if (!result) {
        const list = new List({
          name: clistname,
          itemslist: defaultitems,
        });
        list.save();
        res.redirect("/" + clistname);
      } else {
        res.render("list",{listTitle: result.name, newListItems: result.itemslist});
      }
    } else {
      console.log(err);
    }
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
