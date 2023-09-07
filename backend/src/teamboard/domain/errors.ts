import { Counter, Team } from "./models";
class ModelExistError extends Error {
    constructor(model: Counter | Team) {
      const message = `${model.name} already exists.`;
      super(message);
      this.name = 'ModelExistError';
    }
  }

class ModelNotFoundError extends Error {
    constructor() {
      const message = `was not found.`;
      super(message);
      this.name = 'ModelNotFoundError';
    }
  }

class InternalProblem extends Error {
    constructor(message: string) {
      message = `Internal Problem: ${message}.`;
      super(message);
      this.name = 'InternalProblem';
    }
  }

export {ModelExistError, ModelNotFoundError, InternalProblem};