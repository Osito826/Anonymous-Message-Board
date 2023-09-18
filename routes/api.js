"use strict";

const mongodb = require("mongodb");
const mongoose = require("mongoose");

module.exports = function (app) {
  let uri =
    "mongodb+srv://User1:" +
    process.env.DB +
    "@cluster0.ckgo56z.mongodb.net/message_board?retryWrites=true&w=majority";

  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  //creating Schemas thread/reply
  const replySchema = new mongoose.Schema({
    text: { type: String },
    created_on: { type: Date, required: true, default: new Date() },
    reported: { type: Boolean, default: false },
    //bumped_on: { type: Date, required: true },
    delete_password: { type: String },
  });

  const threadSchema = new mongoose.Schema({
    board: { type: String, required: true },
    text: { type: String },
    created_on: { type: Date, required: true, default: new Date() },
    bumped_on: { type: Date, required: true, default: new Date() },
    reported: { type: Boolean, default: false },
    delete_password: { type: String },
    replies: [replySchema],
  });

  const boardSchema = new mongoose.Schema({
    name: { type: String },
    threads: [threadSchema],
  });

  //creating thread/reply model
  const Reply = mongoose.model("Reply", replySchema);
  const Thread = mongoose.model("Thread", threadSchema);
  const Board = mongoose.model("Board", boardSchema);

  app.route("/api/threads/:board").post(async (req, res) => {
    const { text, delete_password } = req.body;
    let board = req.body.board;
    if (!board) {
      board = req.params.board;
    }

    const newThread = await Thread.create({
      board,
      text,
      delete_password,
      //created_on: currentDate,
      //bumped_on: currentDate,
      replies: [],
    });

    try {
      const boardData = await Board.findOne({ name: board });
      if (!boardData) {
        const newBoard = new Board({
          name: board,
          threads: [],
        });
        newBoard.threads.push(newThread);
        //console.log(newThread);
        const data = await newBoard.save();
        if (data) {
          res.json(newThread);
        }
      } else {
        boardData.threads.push(newThread);
        const data = await boardData.save();
        if (data) {
          res.json(newThread);
        }
      }
    } catch (err) {
      res.send("There was an error saving in post");
    }
  }); /*
    .get(async (req, res) => {
      // GET ROUTE
      const { board } = req.params;
      let threads = await Thread.find({ board })
        .sort("-bumped_on")
        .populate("replies");
      //console.log(threads);

      threads = threads
        .map((thread) => {
          let threadToView = {
            _id: thread._id,
            text: thread.text,
            created_on: thread.created_on,
            bumped_on: thread.bumped_on,
            replies: thread.replies
              .sort((a, b) => a.created_on - b.created_on)
              .slice(0, 3)
              .map((reply) => {
                let rep = {
                  _id: reply._id,
                  text: reply.text,
                  created_on: reply.created_on,
                };
                return rep;
              }),
          };
          return threadToView;
        })
        .slice(0, 10);
      res.send(threads);
    });*/

  app.route("/api/replies/:board").post(async (req, res) => {
    const { text, delete_password, thread_id } = req.body;
    const board = req.params;

    let newTime = new Date();
    const newReply = await Reply.create({
      board,
      text,
      delete_password,
      created_on: newTime,
    });
    console.log(newReply);
    try {
      let threadData = await Thread.findById(thread_id);
      if (threadData) {
        threadData.bumped_on = newTime;
        threadData.replies.push(newReply);
        console.log(threadData);
      }
    } catch (error) {
      console.log(error);
    }
  })
  .get(async (req, res) => {});
  
};
/*
app.route("/api/threads/:board").post((req, res) => {
  const { text, delete_password } = req.body;
  let board = req.body.board;
  if (!board) {
    board = req.params.board;
  }

  const newThread = new Thread({
    board,
    text,
    delete_password,
    //created_on: currentDate,
    //bumped_on: currentDate,
    replies: [],
  });
  Board.findOne({ name: board }, (err, boardData) => {
    if (!boardData) {
      const newBoard = new Board({
        name: board,
        threads: [],
      });
      newBoard.threads.push(newThread);
      newBoard.save((err, data) => {
        if (err || !data) {
          res.send("There was an error saving in post");
        } else {
          res.json(newThread);
        }
      });
    } else {
      boardData.threads.push(newThread);
      boardData.save((err, data) => {
        if (err || !data) {
          res.send("There was an error saving in post");
        } else {
          res.json(newThread);
        }
      });
    }
  });*/
