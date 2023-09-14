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
    created_on: { type: Date, required: true },
    reported: { type: Boolean, default: false },
    bumped_on: { type: Date, required: true },
    delete_password: { type: String },
  });

  let threadBoard = new mongoose.Schema({
    text: { type: String },
    created_on: { type: Date, required: true },
    bumped_on: { type: Date, required: true },
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

  app.route("/api/threads/:board").post(async (request, response) => {
    const { text, delete_password } = request.body;
    let board = request.body.board;
    if (!board) {
      board = request.params.board;
    }
    let currentDate = new Date();
    let newThread = Thread.create({
      text: text,
      delete_password: delete_password,
      created_on: currentDate,
      bumped_on: currentDate,
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
  })

  .get(async (request, response) => {
    try {
      const arrayOfThreads = await Thread.find({ board: request.params.board })
        .sort({ bumpedon_: "desc" })
        .limit(10)
        .select("-delete_password -reported")
        .lean()
        .exec();

      if (arrayOfThreads) {
        arrayOfThreads.forEach((thread) => {
          thread["replycount"] = thread.replies.length;

          /* Sort Replies by Date */
          thread.replies.sort((thread1, thread2) => {
            return thread2.createdon_ - thread1.createdon_;
          });

          /* Limit Replies to 3 */
          thread.replies = thread.replies.slice(0, 3);

          /* Remove Delete Pass from Replies */
          thread.replies.forEach((reply) => {
            reply.delete_password = undefined;
            reply.reported = undefined;
          });
        });

        return response.json(arrayOfThreads);
      }
    } catch (error) {
      console.log(error);
    }
  });

  
};
