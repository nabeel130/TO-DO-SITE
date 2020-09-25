"use strict";

//jshint esversion:6
var express = require("express");

var bodyParser = require("body-parser");

var mongoose = require("mongoose");

var _ = require("lodash"); // const date = require(__dirname + "/date.js");


var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express["static"]("public")); // const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://admin-nabeel:nabardkm@cluster0.nl6pm.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
var itemsSchema = {
  name: String
};
var Item = mongoose.model("Item", itemsSchema);
var item1 = new Item({
  name: "coding"
});
var item2 = new Item({
  name: "playing"
});
var item3 = new Item({
  name: "sleeping"
});
var defaultItems = [item1, item2, item3];
var listSchema = {
  name: String,
  items: [itemsSchema]
};
var List = mongoose.model("List", listSchema); // Item.insertMany(defaultItems, function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("successfuly stored in our DB");
//   }
// })

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfuly stored in our DB");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});
app.get("/:customListItems", function (req, res) {
  var customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        var list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
}); // const day = date.getDate();

app.post("/", function (req, res) {
  var itemName = req.body.newItem;
  var listName = req.body.list;
  console.log(listName);
  var item = new Item({
    name: itemName
  });

  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
app.post("/delete", function (req, res) {
  var checkedItemId = req.body.checkbox;
  var listName = req.body.listName; // console.log(req.body);

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("successfully deleted checked item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});
app.get("/work", function (req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});
app.get("/about", function (req, res) {
  res.render("about");
});
app.listen(3000, function () {
  console.log("Server started on port 3000");
});