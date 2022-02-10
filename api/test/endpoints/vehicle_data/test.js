const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../src/server');
const should = chai.should();
chai.use(chaiHttp);

/**********************************************/
// Parameters used for testing
const vehicleID = 'test-bus-1';
const date = '2017-11-23';
const range = {
	startDate: '2017-11-23',
	endDate: '2017-11-24',
};
const startRouteDate = new Date(1511436338000);
const startRouteDateNumber = 1511436338000;
const InvalidStartRouteDate = 'a';

/**********************************************/

describe('VechicleData', () => {
	/*
	 * Test the /GET route
	 */
	describe(`GET /vehicle_data?vehicleId=${vehicleID}`, () => {
		it('it should GET all data for the vehicleID', done => {
			chai.request(server)
				.get(`/vehicle_data?vehicleId=${vehicleID}`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.be.eql(1);
					done();
				});
		});
	});

	describe(`GET /vehicle_data?vehicleId=${vehicleID}&date=${date}`, () => {
		it('it should GET all data for the vehicleID for that date', done => {
			chai.request(server)
				.get(`/vehicle_data?vehicleId=${vehicleID}&date=${date}`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.be.eql(1);
					done();
				});
		});
	});

	describe(`GET /vehicle_data?vehicleID=${vehicleID}&startDate=${range.startDate}&endDate=${range.endDate}`, () => {
		it('it should GET all data for the vehicleID for that date', done => {
			chai.request(server)
				.get(`/vehicle_data?vehicleId=${vehicleID}&startDate=${range.startDate}&endDate=${range.endDate}`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.be.eql(1);
					done();
				});
		});
	});

	describe(`GET /vehicle_data?vehicleId=${vehicleID}&startRouteDate=${startRouteDate}`, () => {
		it('it should GET all data for the vehicleID for the specific startRouteDate', done => {
			chai.request(server)
				.get(`/vehicle_data?vehicleId=${vehicleID}&startRouteDate=${startRouteDate}`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.be.eql(1);
					done();
				});
		});
	});

	describe(`GET /vehicle_data?vehicleID=${vehicleID}&startRouteDate=${startRouteDateNumber}`, () => {
		it('it should GET all data for the vehicleID for the specific startRouteDate', done => {
			chai.request(server)
				.get(`/vehicle_data?vehicleId=${vehicleID}&startRouteDate=${startRouteDateNumber}`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					res.body.length.should.be.eql(1);
					done();
				});
		});
	});

	describe(`GET /vehicle_data?vehicleID=${vehicleID}&startRouteDate=${InvalidStartRouteDate}`, () => {
		it('it should return status 404 as we gave invalid startRouteDate', done => {
			chai.request(server)
				.get(`/vehicle_data?vehicleId=${vehicleID}&startRouteDate=${InvalidStartRouteDate}`)
				.end((err, res) => {
					res.should.have.status(404);
					done();
				});
		});
	});
});
