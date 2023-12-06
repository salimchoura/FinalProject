/*
 * Nilufer Demirbas, Salim Choura, Yanxihao Chen, and Adrianna Koppes
 * This file contains the backend server, which provides functionality
 * for the website. It contains connections to a database (allowing
 * content and user data to be saved), as well as routes to perform
 * every kind of operation needed for the website.
 * 
 * File Authors: Nilufer Demirbas, Salim Choura, and Adrianna Koppes
 * 
 * Setup code written by Nilufer Demirbas
 */

const mongoose = require('mongoose');
const express = require('express');
const parser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const port = 3000;
const multer = require('multer');



// allows storage of images
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

/*
 * Below are the various schemas for the different types of data
 * that we are storing in the database: one for each type of content,
 * and one for the users.
 * 
 * Author: Adrianna Koppes
 */

// schema for reviews
var ReviewSchema = new Schema({
  user: String,
  stars: Number,
  recipe: { type : mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
  text: String,
});

var Review = mongoose.model('Review', ReviewSchema);

// schema for comments
var CommentSchema = new Schema({
  date: Date,
  user: String,
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
  protein: Number,
  carbs: Number,
  fat: Number,
  instructions: String
});

var Recipe = mongoose.model('Recipe', RecipeSchema);

// schema for forum posts
var PostSchema = new Schema({
  date: Date,
  username: String,
  title: String,
  text: String,
  tag: String,
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

/**
 * This function adds the new user's session to the object that tracks
 * all of the current user sessions. This allows us to keep track of the
 * users who are logged in.
 * 
 * @param username String representing the name of the user for whom to
 *                 add a session
 * 
 * Author: Adrianna Koppes
 */
function addSession(username) {
  let sid = Math.floor(Math.random() * 100000000000);
  let now = Date.now();
  sessions[username] = {id : sid, time : now};
  return sid;
}

/**
 * This function removes all the expired sessions from the sessions 
 * tracker so those users are no longer logged in. This allows us to log
 * users out automatically after a certain amount of time for security.
 * 
 * Author: Adrianna Koppes
 */ 
function removeSession() {
  let sessLength = 60000 * 10;    // session length is 10 mins for testing
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

/**
 * This function authenticates users trying to access the user-only pages of 
 * the application. If the user has access (which the website can tell via
 * the cookies from the user), then it will allow the users to access the
 * page. If the user does not have access, they will be redirected to the
 * login screen.
 * 
 * @param req The request that was sent to the server by the client.
 * @param res The response that the server will send back.
 * @param next The route to move to next if the user is logged in.
 * 
 * Author: Adrianna Koppes
 */
function authenticate(req, res, next) {
  let c = req.cookies;
  if(c != undefined && c.login != undefined) {
    if(sessions[c.login.username] != undefined) {
      if(sessions[c.login.username].id == c.login.sessionID) {
        next();
      }
      else {
        res.redirect('/index.html');
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

/**
 * This function generates a 4-digit salt to add onto the end of a user's
 * password.
 * 
 * Author: Adrianna Koppes
 */
function makeSalt() {
  let num1 = "" + (Math.random() * 10);
  let num2 = "" + (Math.random() * 10);
  let num3 = "" + (Math.random() * 10);
  let num4 = "" + (Math.random() * 10);
  let totalSalt = num1 + num2 + num3 + num4;
  return totalSalt;
}

/**
 * This function turns passwords (and salts) into the hashed versions
 * of themselves for storage and comparison to the stored password.
 * 
 * @param currSalt String representing the salt to use
 * @param text String representing the text to encrypt
 * 
 * Author: Adrianna Koppes
 */
function createHashes(currSalt, text) {
  let toHash = text + currSalt;
  let hasher = crypto.createHash('sha3-256');
  let data = hasher.update(toHash, 'utf-8');
  let hexVals = data.digest('hex');
  return hexVals;
}

// make sure user can't access page to add recipe unless logged in
app.use('/addRecipe.html', authenticate);

// user can't access page to add forum post unless logged in
app.use('/makeForumPost.html', authenticate);

// serve static files
app.use(express.static('public_html'));

app.listen(port, () => 
  console.log(`App listening at http://localhost:${port}`));

/*
 * Route used to make sure the user is logged in (without redirecting);
 * used to determine if the user can write comments.
 * Takes parameters req, the request sent by the client, and res, the
 * response that the server will give.
 * 
 * Author: Adrianna Koppes
 */
app.get('/check/user', (req, res) => {
  let c = req.cookies;
  if(c != undefined && c.login != undefined) {
    if(sessions[c.login.username] != undefined) {
      if(sessions[c.login.username].id == c.login.sessionID) {
        res.end('1');
      }
      else {
        res.end('0');
      }
    }
    else {
      res.end('0');
    }
  }
  else {
      res.end('0');
  }
});

// make sure users are logged in if they are to add recipes - extra guard
app.use('/add/recipe/*', authenticate);

/**
 * Route used to add a recipe to the database and associate it with a
 * certain user. Also adds a photo.
 * Takes parameters req, the request sent by the client, and res, the
 * response that the server will give.
 * 
 * Author: Salim Choura
 */
app.post('/add/recipe/:username', upload.single('photo'), (req, res) => {

  // get the username from the request parameters
  let username = req.params.username
  console.log(typeof(req.body.ingredients))
  console.log(req.body.ingredients)
  let recipe = {
    title: req.body.title,
    image: req.file.originalname,
    ingredients: JSON.parse(req.body.ingredients),
    reviews: [],
    instructions: req.body.instructions,
    protein: req.body.protein,
    carbs: req.body.carbs,
    fat: req.body.fat,
  }
  // create a new item object and save it to the database
  let newRecipe = new Recipe(recipe);
  newRecipe.save().then(() => {
    console.log('new recipe saved');
  }).catch((error) => { console.log('could not save new recipe', error) })

  // add the new item to the user's listings array
  let p = User.findOne({ username: username }).exec()
  p.then((user) => {
    user.recipes.push(newRecipe.id)
    user.save().then(() => { console.log('update of user recipes list made'); res.end('recipe posted sucessfully') })
      .catch((error) => { console.log('failed to update of user recipes list', error) })
  })
    .catch((error) => { console.log('could not add item to user listing', error) })
})

/**
 * Route used to search recipes by keyword in the title. Search is case
 * insensitive. Used to generate search results when a user is on
 * the Explore Recipes page.
 * Takes parameters req, the request sent by the client, and res, the
 * response that the server will give.
 * 
 * Author: Salim Choura, with some fixes made by Adrianna Koppes
 */
app.get('/search/recipes/:KEYWORD', (req, res) => {
  // get the search keyword from the request parameters
  const keyword = req.params.KEYWORD;
  //const p = Recipe.find({}).exec();
  const p = Recipe.find({title : {$regex : keyword, $options : "i"}});
  p.then((recipes) => {
    res.end(JSON.stringify(recipes));
  })
    .catch((error) => {
      console.log('error getting items from db', error)
    })
})

// make sure users are logged in before they review
app.use('/make/review', authenticate);

/**
 * Route for adding reviews or, if the user already added a review on
 * the given recipe, editing a review that was previously made.
 * Takes parameters req, the request sent by the client, and res, the
 * response that the server will give.
 * 
 * Author: Adrianna Koppes
 */
app.post('/make/review', (req, res) => {
  let data = req.body;
  let name = data.username;
  let reviewStars = data.numStars;
  let reviewText = data.text;
  let recipeID = data.recipeID;
  let result = User.find({username : name}).exec();
  result.then((found) => {
    let currUser = found[0];
    let answer = "";
    let reviewResult = Review.find({
      user : name,
      recipe : recipeID,
    }).exec();  // find reviews made by that user for that recipe
    reviewResult.then((reviewFound) => {
      if(reviewFound.length == 0) {
        // new review to make
        let recipeResult = Recipe.find({_id : recipeID}).exec();
        recipeResult.then((recipeFound) => {
          let currRecipe = recipeFound[0];
          let newReview = new Review({
            user: name,
            stars: reviewStars,
            recipe: currRecipe,
            text: reviewText,
          });
          currRecipe.reviews.push(newReview._id);
          currUser.reviews.push(newReview._id);
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
          if(currUser.reviews.includes(currReview._id) == false) {
            res.end('YOU DO NOT HAVE PERMISSION TO EDIT THIS REVIEW');
          }
          currReview.stars = reviewStars;
          currReview.text = reviewText;
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

/**
 * Route to get all the reviews on a specific recipe, which is found using its
 * ObjectId, since multiple recipes can have the same title.
 * Takes parameters req, the request sent by the client, and res, the
 * response that the server will give.
 * 
 * Author: Adrianna Koppes
 */
app.get('/get/reviews/:recipe', (req, res) => {
  let recipeID = req.params.recipe;
  let result = Review.find({recipe : recipeID}).exec();
  result.then((found) => {
    res.end(JSON.stringify(found));
  });
  result.catch((error) => {
    res.end('COULD NOT FIND REVIEWS');
  });
});

// make sure users are logged in before they can add forum post - extra guard
app.use('/add/forum', authenticate);

/**
 * Route to add forum posts, by the username, title, content, and tag of the
 * post. Adds the new post to the database and then confirms that this action
 * was done.
 * Takes parameters req, the request sent by the client, and res, the
 * response that the server will give.
 * 
 * Author: Adrianna Koppes
 */
app.post('/add/forum', (req, res) => {
  let data = req.body;
  let name = data.username;
  let postTitle = data.title;
  let postContent = data.content;
  let postTag = data.tag; // tag on the post; I noticed we had this 
                          // in the project doc so I added it here.
  let currDate = Date.now();
  let answer = "";
  let result = User.find({username : name}).exec();
  result.then((found) => {
    if(found.length == 1) {
      let currUser = found[0];
      let newPost = new ForumPost({
        date : currDate,
        username : name,
        title : postTitle,
        text : postContent,
        tag : postTag,
        comments : [],
      });
      currUser.forums.push(newPost._id);
      let saved = newPost.save();
      saved.then((saveRes) => {});
      saved.catch((error) => {
        res.end('FAILED TO SAVE NEW POST');
      });
      answer = 'SUCCESSFULLY CREATED POST';
      let userSave = currUser.save();
      userSave.then((saveResult) => {
        res.end(answer);
      });
      userSave.catch((error) => {
        res.end('FAILED TO SAVE NEW POST');
      });
    }
    else {
      res.end('FAILED TO FIND USER WHO MADE THE POST');
    }
  });
  result.catch((error) => {
    res.end('FAILED TO FIND USER WHO MADE POST');
  });
});

// make sure users are logged in before they edit posts - extra guard
app.use('/edit/forum', authenticate);

// expects a JSON object in the body of the request with the parameters:
// username: the username of the user who made/wants to edit the post
// forumID: the ObjectId of the Forum Post to edit
// title: the updated title of the post
// content: the updated text of the post
/**
 * Route for editing an existing forum post. Requires a username, an ObjectId
 * associated with the correct forum post, and potentially a new title or 
 * new text content that replaces the old ones.
 * Takes parameters req, the request sent by the client, and res, the
 * response that the server will give.
 * 
 * Author: Adrianna Koppes
 */
app.post('/edit/forum', (req, res) => {
  let data = req.body;
  let user = data.username;
  let postID = data.forumID;
  let newTitle = data.title;
  let newText = data.content;
  let answer = "";
  let result = User.find({username : user}).exec();
  result.then((found) => {
    let currUser = found[0];
    if(currUser.forums.includes(postID) == false) {
      res.end('YOU DO NOT HAVE PERMISSION TO EDIT THIS FORUM POST');
    }
    let postResult = ForumPost.find({_id : postID}).exec();
    postResult.then((foundPosts) => {
      let currForum = foundPosts[0];
      // update the post's properties
      currForum.text = newText;
      currForum.title = newTitle;
      let saveResult = currForum.save();
      saveResult.then((postSaved) => {});
      saveResult.catch((error) => {
        res.end('FAILED TO UPDATE FORUM POST CONTENTS');
      });
      answer = 'SUCCESSFULLY UPDATED FORUM POST';
      let userSaveResult = currUser.save();
      userSaveResult.then((userSaved) => {
        res.end(answer);
      });
      userSaveResult.catch((error) => {
        res.end('FAILED TO UPDATE USER FORUM POST');
      });
    });
    postResult.catch((error) => {
      res.end('FAILED TO FIND POST TO UPDATE');
    });
  });
  result.catch((error) => {
    res.end('FAILED TO FIND USER WHO MADE THIS POST');
  });
});

/**
 * Route to search for forum posts by keyword and then return the result.
 * The keyword search is performed on the forum post text, rather than the
 * title, so results that are relevant but have an oddly worded title do
 * not get omitted. Search is case insensitive.
 * Takes parameters req, the request sent by the client, and res, the
 * response that the server will give.
 * 
 * Author: Adrianna Koppes
 */
app.get('/search/forum/:keyword', (req, res) => {
  let word = req.params.keyword;
  let result = ForumPost.find({text : {$regex : word, $options : "i"}}).exec();
  result.then((found) => {
    res.end(JSON.stringify(found, null, 4));
  });
  result.catch((error) => {
    res.end('COULD NOT SEARCH FORUM POSTS');
  });
});

// make sure users are logged in before commenting - extra guard
app.use('/forum/add/comment', authenticate);

/**
 * Route for adding a comment to a forum post. Requires the client to
 * specify a username, some text for the comment, and an ObjectId for
 * the forum post in question so it is clear where to add the new
 * comment.
 * Takes parameters req, the request sent by the client, and res, the
 * response that the server will give.
 * 
 * Author: Adrianna Koppes
 */
app.post('/forum/add/comment', (req, res) => {
  let data = req.body;
  let name = data.username;
  let text = data.text;
  let forumID = data.forum;
  let result = User.find({username : name}).exec();
  result.then((found) => {
    let currUser = found[0];
    let answer = "";
    let forumResult = ForumPost.find({_id : forumID}).exec();
    forumResult.then((foundForum) => {
      let currForum = foundForum[0];
      let newComment = new Comment({
        date: Date.now(),
        user: currUser.username,
        text: text,
      });
      currForum.comments.push(newComment._id);
      currUser.comments.push(newComment._id);
      let commentSaved = newComment.save();
      commentSaved.then((saveComment) => {});
      commentSaved.catch((error) => {
        res.end('COULD NOT CREATE COMMENT');
      });
      let forumSaved = currForum.save();
      forumSaved.then((saveForum) => {});
      forumSaved.catch((error) => {
        res.end('COULD NOT SAVE COMMENT TO FORUM POST');
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
    forumResult.catch((error) => {
      res.end('FAILED TO FIND FORUM POST');
    });
  });
  result.catch((error) => {
    res.end('FAILED TO FIND USER');
  })
});

/**
 * Route to get all the comments on a single forum post. This is
 * necessary for displaying forum posts on their own page. 
 * Takes parameters req, the request sent by the client, and res, the
 * response that the server will give. The "forum" parameter is
 * the ObjectId of the forum post we are trying to get all of the
 * comments for.
 * 
 * Author: Adrianna Koppes
 */
app.get('/forum/get/comments/:forum', (req, res) => {
  let forumID = req.params.forum;
  let searched = ForumPost.find({_id : forumID}).exec();
  searched.then((found) => {
    let allComments = found[0].comments;
    let foundComments = Comment.find({_id : { $in: allComments }});
    foundComments.then((results) => {
      res.end(JSON.stringify(results, null, 4));
    })
  .catch((error) => {
      console.log(error);
      res.end('COULD NOT GET COMMENTS');
    });
  });
  searched.catch((error) => {
    res.end('COULD NOT FIND FORUM POST TO GET COMMENTS');
  });
});

/**
 * Route for allowing users to create their own accounts. Duplicate 
 * usernames are not allowed.
 * Takes parameters req, the request sent by the client, and res, the
 * response that the server will give.
 * 
 * Author: Adrianna Koppes
 */
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

/**
 * Route for logging into one's account. The entered username is checked to
 * see if there is a match. If there is, then continue to sald and hash
 * it and compare to make sure the password is correct.
 * Takes parameters req, the request sent by the client, and res, the
 * response that the server will give.
 * 
 * Author: Adrianna Koppes
 */
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
          {maxAge: 60000 * 10 });  // can change max age if needed
        res.end('SUCCESS');
      }
      else {
        res.end('INCORRECT PASSWORD');
      }
    }
  });
});