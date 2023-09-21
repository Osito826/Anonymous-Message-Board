const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

const threadPostData = { board: "test", text: "test", delete_password: "test" };
const replyData = { text: "test", delete_password: "test", board: "test" };

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
      });
    done();
  });

  test("#2 GET: Viewing the 10 most recent threads with 3 replies each", function (done) {
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
});
