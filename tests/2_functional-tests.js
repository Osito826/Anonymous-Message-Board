const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

let testThreadId;
let testReplyId;
let testPass = "testpass";

suite("Functional Tests", function () {
  /*test("Creating a new thread: POST request to /api/threads/{board}", (done) => {
    chai
      .request(server)
      .post("/api/threads/test")
      .send({
        board: "test",
        text: "testing the thread",
        delete_password: testPass,
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        let createdThreadId =
          res.redirects[0].split("/")[res.redirects[0].split("/").length - 1];
        testThreadId = createdThreadId;
        done();
      });
  });*/
});
