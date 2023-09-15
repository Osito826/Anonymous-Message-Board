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
    created_on: { type: Date, required: true },
    reported: { type: Boolean, default: false },
    //bumped_on: { type: Date, required: true },
    delete_password: { type: String },
  });

  const threadSchema = new mongoose.Schema({
    board: {
      type: String,
      required: true,
    },
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

  app.route("/api/threads/:board").post(async (request, response) => {
    const { text, delete_password } = request.body;
    const { board } = request.params
    //let board = request.body.board;
    
    //let currentDate = new Date();
    const newThread = await Thread.create({
      board,
      text,
      delete_password,
      //created_on: currentDate,
      //bumped_on: currentDate,
      replies: [],
    });
    console.log(newThread);
    
      const boardData = await Board.findOne({ name: board });
      if (!boardData) {
        const newBoard = new Board({
          name: board,
          threads: [],
        });
        newBoard.threads.push(newThread);
        console.log(newBoard);
        const data = await newBoard.save();
        if (data) {
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
  .get(async (req, res) => {
      // GET ROUTE
      const { board } = req.params
      let threads = await Thread.find({ board }).sort("-bumped_on").populate("replies")

      threads = threads.map(thread => {
        let threadToView = {
          _id: thread._id,
          text: thread.text,
          created_on: thread.created_on,
          bumped_on: thread.bumped_on,
          replies: thread.replies.sort((a, b) => a.created_on - b.created_on).slice(0, 3).map(reply => {
            let rep = {
              _id: reply._id,
              text: reply.text,
              created_on: reply.created_on,
            }
            return rep
          }),
        }
        return threadToView
      }).slice(0, 10)
      res.send(threads)
    })
};
