const mongoose = require('mongoose');
const express = require('express');
const parser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const port = 3000;
const multer = require('multer');



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, './public_html/images');
  },
  filename: (req, file, cb) => {
      cb(null, file.originalname);
  }
})

const upload = multer({storage});


// DB stuff
const db  = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/letBroCook';
mongoose.connect(mongoDBURL, { useNewUrlParser: true });
db.on('error', () => { 
  console.log('MongoDB connection error:');
});

var Schema = mongoose.Schema;

var ReviewSchema = new Schema({
  user: { type : mongoose.Schema.Types.ObjectId, ref: 'User' },
  stars: Number,
  recipe: { type : mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
});

var Review = mongoose.model('Review', ReviewSchema);

// schema for comments
var CommentSchema = new Schema({
  date: Date,
  text: String,
});

var Comment = mongoose.model('Comment', CommentSchema);

// schema for recipes
var RecipeSchema = new Schema({
  //date: Date, commenting this out for now to make what I'm currently working on easier
  title: String,
  image: String,
  ingredients: [{'regular' : String, 'substitute' : String}],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review '}],
  // uncommented this to work on comments
  comments: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  protein: Number,
  carbs: Number,
  fat: Number,
  instructions: String
});

var Recipe = mongoose.model('Recipe', RecipeSchema);

// schema for forum posts
var PostSchema = new Schema({
  date: Date,
  title: String,
  text: String,
  comments: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});

var ForumPost = mongoose.model('ForumPost', PostSchema);

// user schema
var UserSchema = new Schema({
  username: String,
  hash: String,
  salt: String,
  recipes: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  forums: [{ type : mongoose.Schema.Types.ObjectId, ref: 'ForumPost' }],
  comments: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  reviews: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Review' }],
});
var User = mongoose.model('User', UserSchema);

let sessions = {};

/*
 * This function adds the new user's session to the object that tracks
 * all of the current user sessions.
 */
function addSession(username) {
  let sid = Math.floor(Math.random() * 100000000000);
  let now = Date.now();
  sessions[username] = {id : sid, time : now};
  return sid;
}

/*
 * This function removes all the expired sessions from the sessions 
 * tracker so those users are no longer logged in.
 */ 
function removeSession() {
  let sessLength = 120000;    // session length is 2 minutes for now, for testing
  let now = Date.now();
  let usernames = Object.keys(sessions);
  for(let i = 0; i < usernames.length; i++) {
    let last = sessions[usernames[i]].time;
    if(last + sessLength < now) {
      delete sessions[usernames[i]];
    }
  }
}

// check for expired sessions every 2 seconds
setInterval(removeSession, 2000);

const app = express();

// use cookie parser and JSON parser
app.use(cookieParser()); 
app.use(parser.json());
app.use(parser.urlencoded({ extended: true, limit: '10mb' }));

/*
 * This function authenticates users trying to access the user-only pages of 
 * the application. If the user has access (which the website can tell via
 * the cookies from the user), then it will allow the users to access the
 * page. If the user does not have access, they will be redirected to the
 * login screen.
 */
function authenticate(req, res, next) {
  let c = req.cookies;
  if(c != undefined && c.login != undefined) {
    if(sessions[c.login.username] != undefined) {
      if(sessions[c.login.username].id == c.login.sessionID) {
        next(); // might need to change
      }
      else {
        res.redirect('/index.html');  // might change this depending
      }
    }
    else {
      res.redirect('/index.html');
    }
  }
  else {
      res.redirect('/index.html');
  }
}

/*
 * This function generates a 4-digit salt to add onto the end of a user's
 * password.
 */
function makeSalt() {
  let num1 = "" + (Math.random() * 10);
  let num2 = "" + (Math.random() * 10);
  let num3 = "" + (Math.random() * 10);
  let num4 = "" + (Math.random() * 10);
  let totalSalt = num1 + num2 + num3 + num4;
  return totalSalt;
}

/*
 * This function turns passwords (and salts) into the hashed versions
 * of themselves for storage and comparison to the stored password.
 */
function createHashes(currSalt, text) {
  let toHash = text + currSalt;
  let hasher = crypto.createHash('sha3-256');
  let data = hasher.update(toHash, 'utf-8');
  let hexVals = data.digest('hex');
  return hexVals;
}

app.use(express.static('public_html'));

app.listen(port, () => 
  console.log(`App listening at http://localhost:${port}`));


// should be changed to add/recipe/:USERNAME but currently testing
app.post('/add/recipe', upload.single('photo'), (req, res) => {

  // get the username from the request parameters
  console.log('a')
  console.log(typeof(req.body.ingredients))
  console.log(req.body.ingredients)
  let recipe = {
    title: req.body.title,
    image: req.file.originalname,
    ingredients: JSON.parse(req.body.ingredients),
    reviews: [],
    comments: [],
    instructions: req.body.instructions,
    protein: req.body.protein,
    carbs: req.body.carbs,
    fat: req.body.fat,
  }
  console.log(recipe)
  // create a new item object and save it to the database
  const newRecipe = new Recipe(recipe);
  console.log('b')
  newRecipe.save().then(() => {
    console.log('new recipe saved');
  }).catch((error) => { console.log('could not save new recipe', error) })

  // add the new item to the user's listings array
  /*let p = User.findOne({ username: username }).exec()
  p.then((user) => {
    user.listings.push(newItem.id)
    user.save().then(() => { console.log('update of listings made') })
      .catch((error) => { console.log('failed to update listing', error) })
  })
    .catch((error) => { console.log('could not add item to user listing', error) })*/
})

app.get('/search/recipes/:KEYWORD', (req, res) => {
  // get the search keyword from the request parameters
  const keyword = req.params.KEYWORD;
  const p = Recipe.find({}).exec();
  p.then((recipes) => {
    const neededRecipes = [];
    for (let recipe of recipes) {
      // filter users whose username contains the given keyword
      if (recipe.title.includes(keyword)) {
        neededRecipes.push(recipe);
      }
    }
    // return the matching items
    res.end(JSON.stringify(neededRecipes));
  })
    .catch((error) => {
      console.log('error getting items from db', error)
    })
})

// route for making reviews
app.post('/make/review', (req, res) => {
  let data = req.body;
  let name = data.username;
  let reviewStars = data.numStars;
  let recipeID = data.recipeID;
  let result = User.find({username : name}).exec();
  result.then((found) => {
    let currUser = found[0];
    let userID = currUser._id;
    let answer = "";
    let reviewResult = Review.find({user : userID}).exec();
    reviewResult.then((reviewFound) => {
      if(reviewFound.length == 0) {
        // new review to make
        let recipeResult = Recipe.find({_id : recipeID}).exec();
        recipeResult.then((recipeFound) => {
          let currRecipe = recipeFound[0];
          let newReview = new Review({
            user: currUser._id,
            stars: reviewStars,
            recipe: currRecipe,
          });
          currRecipe.reviews.push(newReview);
          currUser.reviews.push(newReview);
          let reviewSave = newReview.save();
          reviewSave.then((reviewSaveResult) => {});
          reviewSave.catch((error) => {
            res.end('FAILED TO ADD REVIEW');
          });
          let recipeSave = currRecipe.save();
          recipeSave.then((recipeSaveResult) => {});
          recipeSave.catch((error) => {
            res.end('FAILED TO ADD REVIEW');
          });
          answer = 'SUCCESSFULLY UPDATED REVIEW';
          let userSave = currUser.save();
          userSave.then((userSaveResult) => {
            res.end(answer);
          });
          userSave.catch((error) => {
            res.end('FAILED TO ADD REVIEW');
          })
        })
      }
      else {
        // updating old review
        let currReview = reviewFound[0];
        let recipeID = currReview.recipe;
        let recipeResult = Recipe.find({_id : recipeID}).exec();
        recipeResult.then((recipeFound) => {
          let currRecipe = recipeFound[0];
          currReview.stars = reviewStars;
          let resaveRecipe = currRecipe.save();
          resaveRecipe.then((saveResult) => {});
          resaveRecipe.catch((error) => {
            res.end('FAILED TO UPDATE REVIEW');
          });
          let resaveReview = currReview.save();
          resaveReview.then((savedResult) => {});
          resaveReview.catch((error) => {
            res.end('FAILED TO UPDATE REVIEW');
          });
          answer = 'SUCCESSFULLY UPDATED REVIEW';
          let resaveUser = currUser.save();
          resaveUser.then((savedUser) => {
            res.end(answer);
          });
          resaveUser.catch((error) => {
            res.end('FAILED TO UPDATE REVIEW');
          });
        }).catch((error) => {
          res.end('COULD NOT FIND RECIPE FOR REVIEW');
        });
      }
    });
    reviewResult.catch((error) => {
      res.end('ERROR ADDING REVIEW');
    });
  });
  result.catch((error) => {
    res.end('ERROR ADDING REVIEW');
  });
});

// route for adding comment to recipe
app.post('/recipe/add/comment', (req, res) => {
  let data = req.body;
  let name = data.username;
  let text = data.text;
  let recipeID = data.recipe;
  let result = User.find({username : name}).exec();
  result.then((found) => {
    let currUser = found[0];
    let answer = "";
    let recipeResult = Recipe.find({_id : recipeID}).exec();
    recipeResult.then((foundRecipe) => {
      let currRecipe = foundRecipe[0];
      let newComment = new Comment({
        date: Date.now(),
        text: text,
      });
      currRecipe.comments.push(newComment);
      currUser.comments.push(newComment);
      let commentSaved = newComment.save();
      commentSaved.then((saveComment) => {});
      commentSaved.catch((error) => {
        res.end('COULD NOT CREATE COMMENT');
      });
      let recipeSaved = currRecipe.save();
      recipeSaved.then((saveRecipe) => {});
      recipeSaved.catch((error) => {
        res.end('COULD NOT SAVE COMMENT TO RECIPE');
      });
      answer = 'SUCCESSFULLY ADDED COMMENT';
      let userSaved = currUser.save();
      userSaved.then((saveUser) => {
        res.end(answer);
      });
      userSaved.catch((error) => {
        res.end('COULD NOT SAVE COMMENT TO USER');
      });
    });
    recipeResult.catch((error) => {
      res.end('FAILED TO FIND RECIPE');
    });
  });
  result.catch((error) => {
    res.end('FAILED TO FIND USER');
  })
});

// route for editing a comment on a recipe
// assumes that the user was the one who made the comment which should be
// checked on the frontend
app.post('/recipe/edit/comment', (req, res) => {
  let data = req.body;
  let name = data.username;
  let newText = data.text;  // new comment text
  let recipeID = data.recipe; // to find the recipe for the comment
  let commentID = data.comment; // to find the comment itself
  let result = User.find({username : name}).exec();
  result.then((found) => {
    let currUser = found[0];
    let answer = "";
    let recipeResult = Recipe.find({_id : recipeID}).exec();
    recipeResult.then((recipeFind) => {
      let currRecipe = recipeFind[0];
      let commResult = Comment.find({_id : commentID});
      commResult.then((commFind) => {
        let currComment = commFind[0];
        currComment.text = newText;
        // resave everything to make sure new text is remembered
        let commSave = currComment.save();
        commSave.then((saveResult) => {});
        commSave.catch((error) => {
          res.end('FAILED TO SAVE NEW COMMENT TEXT');
        });
        let recipeSave = currRecipe.save();
        recipeSave.then((saveRes) => {});
        recipeSave.catch((error) => {
          res.end('FAILED TO SAVE NEW COMMENT WITH RECIPE');
        });
        answer = 'SUCCESSFULLY EDITED COMMENT';
        let userSave = currUser.save();
        userSave.then((useSaveResult) => {
          res.end(answer);
        });
        userSave.catch((error) => {
          res.end('FAILED TO SAVE COMMENT TO USER');
        });
      });
      commResult.catch((error) => {
        res.end('COULD NOT FIND COMMENT');
      });
    });
    recipeResult.catch((error) => {
      res.end('COULD NOT FIND RECIPE THE COMMENT WAS ON');
    });
  });
  result.catch((error) => {
    res.end('COULD NOT FIND USER WHO MADE THE COMMENT');
  });
});

// get the comments on a recipe for display
app.get('/recipe/get/comments', (req, res) => {
  let recipeID = req.body.recipe;
  let search = Recipe.find({_id : recipeID}).exec();
  search.then((found) => {
    let commentList = found[0].comments;
    let foundComments = Comment.find({_id : { $in: commentList }});
    foundComments.then((allComments) => {
      res.end(JSON.stringify(allComments, null, 4));
    }).catch((error) => {
      res.end('COULD NOT FIND COMMENTS');
    });
  }).catch((error) => {
    res.end('COULD NOT FIND RECIPE TO GET COMMENTS');
  });
});

// path for creating account
app.post('/add/user', (req, res) => {
  let userData = req.body;
  let name = userData.username;
  let pass = userData.password;
  let result = User.find({username : name}).exec();
  result.then((found) => {
    if(found.length == 0) {
      // user can be created, they don't already exist
      let newSalt = makeSalt();
      let newHash = createHashes(newSalt, pass);
      let use = new User({
        username: name,
        hash: newHash,
        salt: newSalt,
        recipes: [],
        forums: [],
        comments: [],
        reviews: [],
      });
      let wasSaved = use.save();
      wasSaved.then(() => {
        res.end('USER CREATED');
      }).catch(() => {
        res.end('FAILED TO SAVE DUE TO DATABASE ISSUE');
      });
    }
    else {
      res.end('USERNAME ALREADY TAKEN');
    }
  });
});

// path for logging in
app.post('/login/user', (req, res) => {
  let userData = req.body;
  let possUser = new User({
    username: userData.username,
    hash: "",
    salt: "",
    recipes: [],
    forums: [],
    comments: [],
  });
  let searched = User.find({username: possUser.username}).exec();
  searched.then((results) => {
    if(results.length == 0) {
      res.end('ACCOUNT DOES NOT EXIST');
    }
    else {
      let currUser = results[0];
      let check = createHashes(currUser.salt, userData.pass);
      if(check == currUser.hash) {
        let sid = addSession(userData.username);
        res.cookie("login", 
          {username: userData.username, sessionID: sid}, 
          {maxAge: 60000 * 2 });  // can change max age if needed
        res.end('SUCCESS');
      }
      else {
        res.end('INCORRECT PASSWORD');
      }
    }
  });
});