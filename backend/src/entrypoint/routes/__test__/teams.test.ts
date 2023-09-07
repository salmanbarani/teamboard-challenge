import request from 'supertest';
import { app } from '../../app';

const PATH = "/api/teams";
const COUNTER_PATH = "/api/counters";

const createCounter = (counterName: string = "Salman") => {
  return request(app).post(COUNTER_PATH).send({
    counterName: counterName
  });
};

const createTeam = (teamName: string = "APSIS") => {
  return request(app).post(PATH).send({
    teamName: teamName
  });
};

it('create team', async () => {
  const response = await createTeam();
  expect(response.status).toEqual(201);
  expect(response.body.message.teamName).toEqual("APSIS");
});

it('create another team throws an error', async () => {
  const response = await createTeam();
  expect(response.status).toEqual(400);
  expect(response.body.message).toEqual(undefined);
  expect(response.body.errors.length).toEqual(1);
});

it('get list of teams', async () => {
  let teams = ["IBM", "APPLE", "GOOGLE"]
  teams.forEach( async teamName => {
    await createTeam(teamName);
  });
  
  const response = await request(app).get(PATH).send();
  expect(response.status).toEqual(200);
  expect(response.body.message.length).toEqual(4);

  teams = [...teams, "APSIS"];
  for (let i= 0; i < response.body.message.length; i++) {
    expect(teams).toContain(response.body.message[i].name); 
  }
});

it('get team', async () => {
  const response = await request(app).get(PATH+"/APSIS").send();
  expect(response.status).toEqual(200);
  expect(response.body.message.name).toEqual("APSIS");
  expect(response.body.message.totalSteps).toEqual(0);
});

it('team not exist', async () => {
  const response = await request(app).get(PATH+"/Abolhassan").send();
  expect(response.status).toEqual(404);
  expect(response.body.errors.length).toEqual(1);
});

it('team delete', async () => {
    let response = await request(app).get(PATH+"/APSIS").send();
    expect(response.status).toEqual(200); // Making sure that APSIS already exist;

  response = await request(app).delete(PATH+"/APSIS").send();
  expect(response.status).toEqual(204);

  response = await request(app).get(PATH+"/APSIS").send();
  expect(response.status).toEqual(404);
  expect(response.body.errors.length).toEqual(1);

});

it('deleting not existing team still give 204', async () => {
  let response = await request(app).get(PATH+"/Abolhasan").send();
  expect(response.status).toEqual(404); // Making sure that Abolhasan not exist;

  response = await request(app).delete(PATH+"/Abolhasan").send();
  expect(response.status).toEqual(204);
});

it('adding counter to team', async () => {
  const createCoutnerResponse = await createCounter("Marvan");
  const createTeamResponse = await createTeam("FACEBOOK");
  expect(createCoutnerResponse.status).toEqual(201);
  expect(createTeamResponse.status).toEqual(201);

  const response = await request(app).post(PATH+"/FACEBOOK/add").send({
    counterName: "Marvan"
  });

  expect((response).status).toEqual(200); // Making sure that Abolhasan not exist;
  // response = await request(app).delete(PATH+"/Abolhasan").send();
});


it('adding counter to not existing team', async () => {  
  const  response = await request(app).post(PATH+"/NOT-EXISTING-TEAM/add").send({
    counterName: "Salman"
  });

  expect((response).status).toEqual(404); // Making sure that Abolhasan not exist;
  // response = await request(app).delete(PATH+"/Abolhasan").send();
});


it('adding not existing counter to team', async () => {  
  const  response = await request(app).post(PATH+"/FACEBOOK").send({
    counterName: "NOT-EXISTING-COUNTER"
  });

  expect((response).status).toEqual(404); // Making sure that Abolhasan not exist;
  // response = await request(app).delete(PATH+"/Abolhasan").send();
});
