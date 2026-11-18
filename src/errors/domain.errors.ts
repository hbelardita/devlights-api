export class ConflictError extends Error {
  constructor(message = "Conflicto con un recurso existente") {
    super(message);
    this.name = "ConflictError";
  }
}
