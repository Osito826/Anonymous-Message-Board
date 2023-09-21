const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

const threadPostData = { board: "test", text: "test", delete_password: "test" };
const replyData = { text: "test", delete_password: "test", board: "test" };

let testThread_id;

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

  test("Delete: Deleting a thread with the incorrect password", function (done) {
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

  test("Delete: Deleting a thread with the correct password", function (done) {
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

  test("Put: Reporting a thread", function (done) {
    chai
      .request(server)
      .put("/api/threads/test")
      .send({ ...threadPostData })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, "reported");
        done();
      });
  });
});
