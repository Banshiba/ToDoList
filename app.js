const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
mongoose.connect("mongodb+srv://admin_abhishek:Test-123@cluster0.akodr9u.mongodb.net/todolistDB");
let today = new Date();
var options = {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
}
let currentday = today.toLocaleDateString('en-US', options);
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your ToDo List"
});
const item2 = new Item({
  name: "Hit the + to add an item"
});
const item3 = new Item({
  name: "<--Check to delete an item"
});
const defaultitems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);
const app = express();
app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
let itemsarr = [];
app.get("/", function(req, res) {

  Item.find({}, function(err, founditems) {
    if (founditems.length === 0) {
      Item.insertMany(defaultitems, function(err) {
        if (err) {
          console.log("error prone");
        } else {
          console.log(founditems);
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: currentday,
        recitems: founditems
      });
    }

  });
});
app.post("/", function(req, res) {
  let a = req.body.newItem;
  let nameoflist = req.body.submit;
  const listitem = new Item({
    name: a
  });
  if (nameoflist === currentday) {
    listitem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: nameoflist
    }, function(err, found) {
      found.items.push(listitem);
      found.save();
      res.redirect("/" + nameoflist);
    });
  }
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.get("/:topic", function(req, res) {
  const a = _.capitalize(req.params.topic);
  List.findOne({
    name: a
  }, function(err, results) {
    if (!err) {
      if (!results) {
        const list = new List({
          name: a,
          items: defaultitems
        });
        list.save();
        res.redirect("/" + a);
      } else {
        res.render("list", {
          listTitle: results.name,
          recitems: results.items
        });
      }
    } else {
      console.log("error");
    }
  });
});


app.post("/delete", function(req, res) {
  console.log(req.body.infoaboutlist);
  if (req.body.infoaboutlist === currentday) {
    Item.findByIdAndRemove({
      _id: req.body.checkbox
    }, function(err, deleted) {
      if (!err) {
        console.log(deleted);
        res.redirect("/");
      }

    });
  } else {
    List.findOneAndUpdate({
      name: req.body.infoaboutlist
    }, {
      $pull: {
        items: {
          _id: req.body.checkbox
        }
      }
    }, function(err) {
      if (!err) {
        console.log("topiclist item deleted successfully");
        res.redirect("/" + req.body.infoaboutlist);
      }
    });
  }
});

app.listen(3000, function() {
  console.log("Server runnning on port 3000");
});
