// Error body of the API: RFC 9457 problem details (docs/analisis.md §4).
export interface Violation {
  propertyPath: string;
  title: string;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  violations?: Violation[];
}
