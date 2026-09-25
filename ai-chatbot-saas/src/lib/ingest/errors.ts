/** შეცდომა, რომლის ტექსტიც უსაფრთხოა მომხმარებლისთვის საჩვენებლად. */
export class IngestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IngestError";
  }
}

/** URL არ არის დასაშვები (შიდა ქსელი, არასწორი პროტოკოლი და ა.შ.). */
export class UnsafeUrlError extends IngestError {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeUrlError";
  }
}