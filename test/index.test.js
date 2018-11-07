// Requiring probot allows us to initialize an application
const { Application } = require('probot')
// Requiring our app implementation
const myProbotApp = require('..')
// Create a fixtures folder in your test folder
// Then put any larger testing payloads in there
const pullRequestOpenedEvent = require('./fixtures/pull-request-opened.json')

const config = {
  content: Buffer.from("pullRequestOpened: Messege ").toString("base64")
}

describe('My Probot app', () => {
  let app;
  let github;

  beforeEach(() => {
    app = new Application()
    github = {
      repos: {
        getContent: () =>
          Promise.resolve({
            data:config
          })
        }
      };
    // Passes the mocked out GitHub API into out app instance
    app.auth = () => Promise.resolve(github)
    app.load(myProbotApp)
  })

  describe("pullRequests.opened", () => {
    it("Reads `pullRequestOpened` from the `auto-remind.yml` and sends the value to github", async () => {
      await app.receive({
        event: "pull_request",
        payload: pullRequestOpenedEvent });

      expect(github.issues.createComment).toHaveBeenCalledWith({
        body: "My Message",
        number: 19,
        repo: undefined
      });
    });

    it("does not create a new comment if the `pullRequestOpened` cannot be found in the config", async () => {
      await app.receive({
        event: "pull_request",
        payload: pullRequestOpenedEvent });

      github = {
        repos: {
          getContent: () =>
            Promise.resolve({
              data: {
                content: Buffer.from(`pullRequestOpened:\n  My Message`).toString("base64")
              }
            })
        },
        issues: {
          createComment: jest.fn()
        }
      };
      expect(github.issues.createComment).not.toHaveBeenCalled();
    });
  });
});

// For more information about testing with Jest see:
// https://facebook.github.io/jest/
