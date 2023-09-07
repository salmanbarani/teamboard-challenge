import { InternalProblem, ModelExistError, ModelNotFoundError } from "../../teamboard/domain/errors";

export interface IResponse {
    statusCode: number;
    message : Object | undefined;
    errors?: string[];
}

export function successResponse(status: number, message: Object, errors: string[] = []): IResponse {
    if (status >= 200 && status < 300)
    return {
        statusCode: status,
        message: message,
        errors: errors
    };
    else
        throw new InternalProblem("status is not right");
}

export function errorResponse(error: any) : IResponse {
    let result: IResponse;
    if (error instanceof ModelExistError)
        result = {
            statusCode: 400,
            message: undefined,
            errors: [error.message]
        };

    else if (error instanceof ModelNotFoundError)
        result = {
            statusCode: 404,
            message: undefined,
            errors: ["missing something"]
        }
    else if (error instanceof InternalProblem) // also notify developer about the problem
        result = {
           statusCode: 500,
           message: undefined,
           errors: ["Internal server error, will fix it soon."] 
        }

    else
        throw new InternalProblem("unknown error type"); // for developer to fix it.

    return result;
    }