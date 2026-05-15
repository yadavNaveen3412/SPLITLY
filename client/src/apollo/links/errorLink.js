import { onError } from "@apollo/client/link/error";

export const errorLink = onError(() => {});
