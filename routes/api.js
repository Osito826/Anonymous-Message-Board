"use strict";

let mongodb = require("mongodb");
let mongoose = require("mongoose");

module.exports = function (app) {
  let uri =
    "mongodb+srv://User1:" +
    process.env.DB +
    "@cluster0.ckgo56z.mongodb.net/message_board?retryWrites=true&w=majority";

  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  //creating Schemas thread/reply
  let replyBoard = new mongoose.Schema({
    text: { type: String },
    created_on: { type: Date, default: new Date() },
    reported: { type: Boolean, default: false },
    bumped_on: { type: Date, default: new Date() },
    delete_password: { type: String },
  });

  let threadBoard = new mongoose.Schema({
    text: { type: String },
    created_on: { type: Date, default: new Date() },
    bumped_on: { type: Date, default: new Date() },
    reported: { type: Boolean, default: false },
    delete_password: { type: String },
    replies: { type: [replyBoard] },
  });

  let boardSchema = new mongoose.Schema({
    name: { type: String },
    threads: { type: [threadBoard] },
  });

  //creating thread/reply model
  let Reply = mongoose.model("Reply", replyBoard);
  let Thread = mongoose.model("Thread", threadBoard);
  let Board = mongoose.model("Board", boardSchema);

  app
    .route("/api/threads/:board")
    .post(async (request, response) => {
    const { text, delete_password } = request.body;
    let board = request.body.board;
    if (!board) {
      board = request.params.board;
    }
    const newThread = new Thread({
      text: text,
      delete_password: delete_password,
      replies: [],
    });
    console.log(newThread);
    try {
      const boardData = await Board.findOne({ name: board });
      if (!boardData) {
        const newBoard = new Board({
          name: board,
          threads: [],
        });
        console.log(newBoard);
        newBoard.threads.push(newThread);
        const data = await newBoard.save();
        if (!data) {
          response.send("There was an error saving in post");
        } else {
          response.json(newThread);
        }
      } else {
        boardData.threads.push(newThread);
        const data = await boardData.save();
        if (!data) {
          response.send("There was an error saving in post");
        } else {
          response.json(newThread);
        }
      }
    } catch (err) {
      console.log(err);
    }
  });

  app.route("/api/replies/:board");
};
