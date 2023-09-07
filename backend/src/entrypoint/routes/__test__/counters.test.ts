import request from 'supertest';
import { app } from '../../app';

const PATH = "/api/counters"

const createCounter = (counterName: string = "Salman") => {
  return request(app).post(PATH).send({
    counterName: counterName
  });
};

it('create counter', async () => {
  const response = await createCounter();
  expect(response.status).toEqual(201);
  expect(response.body.message.counterName).toEqual("Salman");
});

it('create another counter throws an error', async () => {
  const response = await createCounter();
  expect(response.status).toEqual(400);
  expect(response.body.message).toEqual(undefined);
  expect(response.body.errors.length).toEqual(1);
});

it('get list of counters', async () => {
  let counters = ["Marvan", "Steve", "George"]
  counters.forEach( async counterName => {
    await createCounter(counterName);
  });
  
  const response = await request(app).get(PATH).send();
  expect(response.status).toEqual(200);
  expect(response.body.message.length).toEqual(4);

  counters = [...counters, "Salman"];
  for (let i= 0; i < response.body.message.length; i++) {
    expect(counters).toContain(response.body.message[i].name); 
  }
});

it('get acounter', async () => {
  const response = await request(app).get(PATH+"/Salman").send();
  expect(response.status).toEqual(200);
  expect(response.body.message.name).toEqual("Salman");
  expect(response.body.message.steps).toEqual(0);
});

it('counter not exist', async () => {
  const response = await request(app).get(PATH+"/Abolhassan").send();
  expect(response.status).toEqual(404);
  expect(response.body.errors.length).toEqual(1);
});

it('counter delete', async () => {
  let response = await request(app).get(PATH+"/Salman").send();
  expect(response.status).toEqual(200); // Making sure that Salman already exist;

  response = await request(app).delete(PATH+"/Salman").send();
  expect(response.status).toEqual(204);

  response = await request(app).get(PATH+"/Salman").send();
  expect(response.status).toEqual(404);
  expect(response.body.errors.length).toEqual(1);

});

it('deleting not existing counter still give 204', async () => {
  let response = await request(app).get(PATH+"/Abolhasan").send();
  expect(response.status).toEqual(404); // Making sure that Abolhasan not exist;

  response = await request(app).delete(PATH+"/Abolhasan").send();
  expect(response.status).toEqual(204);
});

it('adding steps', async () => {
  let getResponse = await request(app).get(PATH+"/George").send();
  expect(getResponse.status).toEqual(200);
  expect(getResponse.body.message.steps).toEqual(0); // George has no steps

  let response = await request(app).post(PATH+"/George/add-steps").send();
  expect(response.status).toEqual(200); 

  getResponse = await request(app).get(PATH+"/George").send();
  expect(getResponse.status).toEqual(200);
  expect(getResponse.body.message.steps).toEqual(1); // not George has 1 steps
});

it('adding steps to not existing counter', async () => {
  let response = await request(app).post(PATH+"/NOT-EXISTING-COUNTER/add-steps").send();
  expect(response.status).toEqual(404);
});
