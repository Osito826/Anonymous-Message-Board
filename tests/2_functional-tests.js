const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

const threadPostData = { board: "test", text: "test", delete_password: "test" };
const replyData = { text: "test", delete_password: "test", board: "test" };

let testThread_id;
let testReply_id;

suite("Functional Tests", function () {
  test("POST: Creating a new thread", function (done) {
    chai
      .request(server)
      .post("/api/threads/test")
      .send(threadPostData)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isDefined(res.body._id);
        assert.isArray(res.body.replies);
        testThread_id = res.body._id;
        done();
      });
  });

  test("POST: Creating a new reply", function (done) {
    chai
      .request(server)
      .post("/api/replies/test")
      .send({ ...replyData, thread_id: testThread_id.toString() })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isDefined(res.body._id);
        assert.isDefined(res.body.replies[0].text);
        //assert.isDefined(res.body.replies[0].delete_password);
        assert.isDefined(res.body.replies[0].created_on);
        assert.isObject(res.body.replies[0]);
        assert.isArray(res.body.replies);
        testReply_id = res.body.replies[0]._id;
        done();
      });
  });

  test("GET: Viewing the 10 most recent threads with 3 replies each", function (done) {
    chai
      .request(server)
      .get("/api/threads/test")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isObject(res.body[0]);
        assert.isDefined(res.body[0].text);
        assert.isDefined(res.body[0].created_on);
        assert.isDefined(res.body[0].bumped_on);
        assert.isArray(res.body[0].replies);
        assert.isBelow(res.body[0].replies.length, 4);
        done();
      });
  });

  test("GET: Viewing a single thread with all replies", function (done) {
    chai
      .request(server)
      .get("/api/replies/test")
      .query({ thread_id: testThread_id })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body.replies);
        assert.equal(res.body._id, testThread_id);
        done();
      });
  });

  test("PUT: Reporting a thread", function (done) {
    chai
      .request(server)
      .put("/api/threads/test")
      .send({ ...threadPostData, thread_id: testThread_id })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "reported");
        done();
      });
  });

  test("PUT: Reporting a reply", function (done) {
    chai
      .request(server)
      .put("/api/replies/test")
      .send({ reply_id: testReply_id, thread_id: testThread_id })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "reported");
        done();
      });
  });

  test("DELETE: Deleting a reply with the incorrect password", function (done) {
    chai
      .request(server)
      .delete("/api/replies/test")
      .send({
        thread_id: testThread_id,
        reply_id: testReply_id,
        delete_password: "incorrect",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "incorrect password");
        done();
      });
  });

  test("DELETE: Deleting a reply with the correct password", function (done) {
    chai
      .request(server)
      .delete("/api/replies/test")
      .send({
        thread_id: testThread_id,
        reply_id: testReply_id.toString(),
        delete_password: "test",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "success");
        done();
      });
  });

  test("DELETE: Deleting a thread with the correct password", function (done) {
    chai
      .request(server)
      .delete("/api/threads/test")
      .send({ ...threadPostData, thread_id: testThread_id })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "success");
        done();
      });
  });

  test("DELETE: Deleting a thread with the incorrect password", function (done) {
    chai
      .request(server)
      .delete("/api/threads/test")
      //.set("content-type", "application/json")
      .send({ thread_id: testThread_id, delete_password: "incorrect" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "incorrect password");
        done();
      });
  });
});
