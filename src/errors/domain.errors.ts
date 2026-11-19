export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Solicitud inválida", details?: unknown) {
    super(400, message, details);
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Conflicto con un recurso existente") {
    super(409, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Recurso no encontrado") {
    super(404, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "No autorizado") {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "No tienes permisos para realizar esta acción") {
    super(403, message);
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(
    message = "Demasiadas solicitudes. Intenta de nuevo más tarde.",
  ) {
    super(429, message);
  }
}
