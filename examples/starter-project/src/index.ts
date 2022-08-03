
import { initializeApi, safeDisconnect } from "ternoa-js"

async function main() {
  // This will initialize the internal SDK API.
  //
  // It's not strictly necessary but it's good practice to initialize the API as soon as possible.
  // If this call is omitted then the first SDK call will return an expection.
  // You can also specify the endpoint by passing the endpoint address as the first argument.
  await initializeApi();

  await safeDisconnect();
  
  process.exit()
}

main()
