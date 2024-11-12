// zkauth-backend/tests/authController.test.js
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/index.js'; // Assuming index.js is your server entry point

chai.use(chaiHttp);
const { expect } = chai;

describe('Auth Controller', () => {
  it('should register a new user', (done) => {
    chai.request(app)
      .post('/register')
      .send({
        publicKey: 'testPublicKey',
        proof: 'testProof',
        recoveryPhrase: 'testRecoveryPhrase'
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message', 'User registered successfully');
        done();
      });
  });

  it('should log in a registered user', (done) => {
    chai.request(app)
      .post('/login')
      .send({
        publicKey: 'testPublicKey',
        proof: 'testProof'
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
        done();
      });
  });
});
