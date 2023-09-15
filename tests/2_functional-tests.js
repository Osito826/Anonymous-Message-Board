const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

const threadPostData = { board: "test", text: "test", delete_password: "test" };
let replyData = { text: "test", delete_password: "test", board: "test" };

suite("Functional Tests", function () {
  /*test("POST: Creating a new thread", function (done) {
    chai
      .request(server)
      .post("/api/threads/test")
      .send(threadPostData)
      .end(async (err, res) => {
        assert.equal(res.status, 200);
        assert.isDefined(res.body._id);
        assert.isArray(res.body.replies);
      });
    done();
  });*/
});
