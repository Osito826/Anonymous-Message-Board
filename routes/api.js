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
  const replyBoard = new mongoose.Schema({
    text: { type: String },
    created_on: { type: Date, required: true },
    reported: { type: Boolean, default: false },
    //bumped_on: { type: Date, required: true },
    delete_password: { type: String },
  });

  const threadBoard = new mongoose.Schema({
    text: { type: String },
    created_on: { type: Date, required: true, default: new Date(), },
    bumped_on: { type: Date, required: true, default: new Date(), },
    reported: { type: Boolean, default: false },
    delete_password: { type: String },
    replies: [replyBoard],
  });

  const boardSchema = new mongoose.Schema({
    name: { type: String },
    threads: [threadBoard],
  });

  //creating thread/reply model
  let Reply = mongoose.model("Reply", replyBoard);
  let Thread = mongoose.model("Thread", threadBoard);
  let Board = mongoose.model("Board", boardSchema);

  app.route('/api/threads/:board')
    .post(async (req, res) => {
      // POST ROUTE
      const { board } = req.params
      const { text, delete_password } = req.body

      const thread = await Thread.create({
        board,
        text,
        delete_password,
        replies: [],
      })
      res.send(thread)
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
    .delete(async (req, res) => {
      // DELETE ROUTE
      const { board, thread_id, delete_password } = req.body
      let threadToDelete = await Thread.findById(thread_id)
      if (threadToDelete && threadToDelete.delete_password === delete_password) {
        await threadToDelete.remove()
        res.send("success")
      } else {
        res.send("incorrect password")
      }
    })
    .put(async (req, res) => {
      // PUT ROUTE
      const { board, thread_id } = req.body
      let threadToUpdate = await Thread.findById(thread_id)
      if (threadToUpdate) {
        threadToUpdate.reported = true
        await threadToUpdate.save()
        res.send("reported")
      } else {
        res.send("incorrect thread id")
      }
    })

    /*.get(async (request, response) => {
      try {
        const arrayOfThreads = await Thread.find({
          board: request.params.board,
        })
          .sort({ bumped_on: "desc" })
          .limit(10)
          .select("-delete_password -reported")
          .lean()
          .exec();

        if (arrayOfThreads) {
          arrayOfThreads.forEach((thread) => {
            thread["replycount"] = thread.replies.length;

            // Sort Replies by Date 
            thread.replies.sort((thread1, thread2) => {
              return thread2.created_on - thread1.created_on;
            });

            // Limit Replies to 3 
            thread.replies = thread.replies.slice(0, 3);

            // Remove Delete Pass from Replies 
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
    });*/
};
