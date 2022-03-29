//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const { json } = require("body-parser");

const app = express();

app.set('view engine', 'ejs');

app.use(express.json())
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/seriesDB", { useNewUrlParser: true });


mongoose.connect("mongodb+srv://harshil-admin:Harshil@4217@cluster0.taq4e.mongodb.net/seriesDB?retryWrites=true&w=majority", { useNewUrlParser: true });

mongoose.connection.on('connected', () => {
    console.log("DB Connected")
})

//**********************************************CONTENT SERVICE*****************************

const seriesSchema = {
    title: String,
    episodes: Array
};


//user
const userSchema = {
    userId: String,
    completed: [{
        seriesId: mongoose.Schema.Types.ObjectId,
        numberOfEpisodesWatched: Number
    }]

};

const Series = mongoose.model("Series", seriesSchema);
const User = mongoose.model("User", userSchema);

app.get("/series/get", function (req, res) {
    Series.find(function (err, foundSeries) {
        if (!err) {
            res.send(foundSeries);
        } else {
            res.send(err);
        }
    });
});


app.post("/series", function (req, res) {
    console.log(req.body)


    const newSeries = new Series({
        title: req.body.title,
        episodes: req.body.episodes
    });
    newSeries.save();
    res.send("Posted Successfully!!")
})

app.post("/create/user", function (req, res) {
    console.log(req.body.userId)
    const newUser = new User({
        userId: req.body.userId,
        completed: []
    })

    newUser.save();
    res.send("User Created Successfully!!")
})


app.get("/user/get", function (req, res) {
    const uid = req.body.userId
    User.find({ userId: uid }, function (err, foundUser) {
        if (!err) {
            res.send(foundUser);
        } else {
            res.send(err);
        }
    });
});

app.get("/user/get/unlockedPerSeries", function (req, res) {
    const uid = req.body.userId
    console.log(uid)
    User.find({ userId: uid }, function (err, foundUser) {
        if (!err) {
            res.send(foundUser[0].completed);
        } else {
            res.send(err);
        }
    });
});

app.get("/user/totalep", function (req, res) {
    const uid = req.body.userId
    const seriesWatched = req.body.series
    console.log(seriesWatched)
    User.find({ userId: uid }, function (err, foundUser) {
        if (err) {
            console.log(err)
        }
        else {
            //find series id
            Series.find({ title: seriesWatched }, function (err1, foundSeries) {
                if (!err1) {
                    console.log(foundSeries[0].episodes.length)
                    let val = foundSeries[0].episodes.length
                    res.send(foundSeries[0].episodes)
                } else {
                    res.send(err);
                }
            });
        }
    })

})

app.get("/user/unlockedEp", function (req, res) {
    const uid = req.body.userId
    const seriesWatched = req.body.series
    console.log(seriesWatched)
    User.find({ userId: uid }, function (err, foundUser) {
        if (err) {
            console.log(err)
        }
        else {
            //find series id
            Series.find({ title: seriesWatched }, function (err1, foundSeries) {
                if (!err1) {
                    const sId = foundSeries[0]._id
                    let objectArray = foundUser[0].completed
                    let result = objectArray.filter(obj => {
                        return obj.seriesId.toString() == sId.toString()
                    })
                    let val = result[0].numberOfEpisodesWatched
                    console.log(val)

                } else {
                    res.send(err);
                }
            });
        }
    })

})

//API for bulk upload
app.post("/update", function (req, res) {
    const uid = req.body.userId
    const seriesWatched = req.body.series
    console.log(seriesWatched)
    User.find({ userId: uid }, function (err, foundUser) {
        if (err) {
            console.log(err)
        }
        else {
            //find series id
            Series.find({ title: seriesWatched }, function (err1, foundSeries) {
                if (!err1) {

                    const sId = foundSeries[0]._id

                    let objectArray = foundUser[0].completed

                    if (objectArray.length == 0) {
                        console.log("Array not found")
                        objectArray.push({ seriesId: sId, numberOfEpisodesWatched: 1 })
                        User.findOneAndUpdate({ userId: uid }, { $set: { completed: objectArray } }, { upsert: true }, function (err, doc) {
                            if (err) { throw err; }
                            else { console.log("Updated"); }
                        });
                        res.send("Updated Successfully!!")
                    }

                    else {
                        let result = objectArray.filter(obj => {
                            return obj.seriesId.toString() == sId.toString()
                        })


                        if (result.length === 0) {

                            objectArray.push({ seriesId: sId, numberOfEpisodesWatched: 1 })
                            User.findOneAndUpdate({ userId: uid }, { $set: { completed: objectArray } }, { upsert: true }, function (err, doc) {
                                if (err) { throw err; }
                                else { console.log("Updated"); }
                            });
                            res.send("Updated Successfully!!")

                        }
                        else {
                            console.log("Array found, result found")

                            result[0].numberOfEpisodesWatched++
                            objectArray.forEach(function (arrayItem) {
                                if (toString(arrayItem.seriesId) == toString(sId)) {
                                    arrayItem = result[0]
                                }

                            });
                            console.log(objectArray)
                            User.findOneAndUpdate({ userId: uid }, { $set: { completed: objectArray } }, { upsert: true }, function (err, doc) {
                                if (err) { throw err; }
                                else { console.log("Updated"); }
                            });
                            res.send("Updated Successfully!!")

                        }
                    }





                } else {
                    res.send(err);
                }
            });
        }
    })

})


//**********************************************USER AND DAILY PASS SERVICE*****************************

//chapters Schema
const chapterSchema = {
    title: String,
    chapters: Array
};

//user schema
const userSchema2 = {
    name: String,
    email: String,
    unlockedChapters: [{
        chapterId: mongoose.Schema.Types.ObjectId,
        unlocked: Number
    }]

};

const User2 = mongoose.model("User2", userSchema2);
const Chapter = mongoose.model("Chapter", chapterSchema)

//add chapters
app.post("/create/newchapter", function (req, res) {

    const newChapter = new Chapter({
        title: req.body.title,
        chapters: req.body.chapters
    })

    newChapter.save();

    //for addition of new chapter with existing users
    // Chapter.find({ title: req.body.title }, function (err1, foundSeries) {
    //     const sId = foundSeries[0]._id
    //     newObj = { chapterId: sId, unlocked: 4 }
    //     User2.find(function (err, foundUser) {
    //         if (!err) {
    //             foundUser.forEach(function (arrayItem) {
    //                 arrayItem.unlockedChapters.push(newObj)
    //             });
    //             console.log(foundUser)
    //         }
    //         else {
    //             res.send(err)
    //         }
    //     })
    // })
    res.send("Created!!")
})

//create new user
app.post("/create/newuser", function (req, res) {
    console.log(req.body.name)
    console.log(req.body.email)
    let foundArr = []
    let unlockedForUser = []
    Chapter.find(function (err, foundChapters) {
        if (!err) {
            foundArr = foundChapters

            foundArr.forEach(function (arrayItem) {
                let newObj = {}
                newObj.chapterId = arrayItem._id
                newObj.unlocked = 4
                console.log(newObj)
                unlockedForUser.push(newObj)

            });
            const newUser = new User2({
                name: req.body.name,
                email: req.body.email,
                unlockedChapters: unlockedForUser
            })
            newUser.save();
            res.send("Created!!")
        }
        else {
            res.send(err)
        }
    })



})

//fetch all users
app.get("/newUser/all", function (req, res) {
    User2.find(function (err, foundUser) {
        if (!err) {
            res.send(foundUser)
        }
        else {
            res.send(err)
        }
    })
})

//api for multiple clicks
//API for bulk upload
app.post("/update/foruser", function (req, res) {
    const email = req.body.email
    const chapterTitle = req.body.title
    User2.find({ email: email }, function (err, foundUser) {
        if (err) {
            console.log(err)
        }
        else {
            //find series id
            Chapter.find({ title: chapterTitle }, function (err1, foundSeries) {
                if (!err1) {

                    const sId = foundSeries[0]._id

                    let objectArray = foundUser[0].unlockedChapters
                    console.log(objectArray)
                    if (objectArray.length == 0) {
                        console.log("Array not found")

                    }

                    else {
                        let result = objectArray.filter(obj => {
                            return obj.chapterId.toString() == sId.toString()
                        })


                        if (result.length === 0) {

                            objectArray.push({ chapterId: sId, unlocked: 4 })
                            User2.findOneAndUpdate({ email: email }, { $set: { unlockedChapters: objectArray } }, { upsert: true }, function (err, doc) {
                                if (err) { throw err; }
                                else { console.log("Updated"); }
                            });
                            res.send("Updated Successfully!!")

                        }
                        else {
                            console.log("Array found, result found")

                            result[0].unlocked++
                            objectArray.forEach(function (arrayItem) {
                                if (toString(arrayItem.chapterId) == toString(sId)) {
                                    arrayItem = result[0]
                                }

                            });
                            console.log(objectArray)
                            User2.findOneAndUpdate({ email: email }, { $set: { unlockedChapters: objectArray } }, { upsert: true }, function (err, doc) {
                                if (err) { throw err; }
                                else { console.log("Updated"); }
                            });
                            res.send("Updated Successfully!!")

                        }
                    }





                } else {
                    res.send(err);
                }
            });
        }
    })

})

app.get("/", (req, res) => {
    res.send("MICROSERVICE BACKEND INTERN ASSIGNMENT")
})
app.listen(3001, function () {
    console.log("Server started on port 3001");
});